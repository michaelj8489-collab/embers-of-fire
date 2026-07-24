import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';
import { STRIPE_API_VERSION, getRequiredEnv, jsonError, readJsonObject } from '@/utils/api/security';
import { validateTierName } from '@/utils/membership';
import { buildSubscriptionChangeIdempotencyKey, getPlanChangeOutcome, retrieveValidatedStripePrice, resolveSubscriptionMembership, updateSubscriptionIfNoPending } from '@/utils/membership.server';

type SubscriptionRow = {
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  tier: string | null;
};

function changeError(message: string, status: number, code: string) {
  return NextResponse.json({ success: false, code, error: message }, { status });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return changeError('Authentication required.', 401, 'AUTHENTICATION_REQUIRED');

  const body = await readJsonObject(req);
  if (!body.ok) return jsonError(body.error, 400);
  const targetTier = validateTierName(body.value.targetTier);
  if (!targetTier.ok) return changeError(targetTier.error, 400, 'INVALID_TIER');

  const { data, error } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id, stripe_subscription_id, tier')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) {
    console.error('subscription-change: subscription lookup failed.', { code: error.code, message: error.message });
    return changeError('Unable to load your membership.', 500, 'BILLING_LOOKUP_FAILED');
  }

  const row = data as SubscriptionRow | null;
  if (!row?.stripe_customer_id || !row.stripe_subscription_id) {
    return changeError('An active paid membership is required to change plans.', 409, 'SUBSCRIPTION_REQUIRED');
  }

  const secretKey = getRequiredEnv('STRIPE_SECRET_KEY');
  if (!secretKey.ok) return changeError('Membership changes are not configured.', 500, 'BILLING_NOT_CONFIGURED');
  const stripe = new Stripe(secretKey.value, { apiVersion: STRIPE_API_VERSION });

  try {
    const targetPrice = await retrieveValidatedStripePrice(stripe, targetTier.value);
    if (!targetPrice.ok) {
      console.error('subscription-change: configured Stripe Price is invalid.', { configurationError: targetPrice.error });
      return changeError('Membership changes are not configured.', 500, 'BILLING_NOT_CONFIGURED');
    }

    const subscription = await stripe.subscriptions.retrieve(row.stripe_subscription_id);
    const stripeCustomerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
    if (stripeCustomerId !== row.stripe_customer_id) {
      console.warn('subscription-change: subscription customer did not match stored customer.', { hasSubscriptionId: true });
      return changeError('Your billing record needs attention before changing plans.', 409, 'BILLING_OWNERSHIP_MISMATCH');
    }
    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
      return changeError('Your membership is not currently active. Please use billing management to resolve its status.', 409, 'SUBSCRIPTION_NOT_ACTIVE');
    }
    const membership = resolveSubscriptionMembership(subscription, row.tier);
    if (membership.kind === 'configuration_error') {
      console.error('subscription-change: invalid Stripe Price configuration.', { configurationError: membership.error });
      return changeError('Membership changes are not configured.', 500, 'BILLING_NOT_CONFIGURED');
    }
    if (membership.kind === 'unknown_price') {
      console.warn('subscription-change: subscription did not contain exactly one supported membership item.', {
        subscriptionStatus: subscription.status,
      });
      return changeError('This membership cannot be changed online. Please use billing management.', 409, 'UNSUPPORTED_SUBSCRIPTION');
    }

    const membershipItem = membership.item;
    const currentTier = membership.tier;
    if (currentTier === targetTier.value) {
      return NextResponse.json({ success: true, outcome: 'completed', currentTier, targetTier: currentTier, noOp: true });
    }

    // Always invoice immediately for the prorated difference. pending_if_incomplete keeps a
    // payment-required upgrade from being treated as active until Stripe confirms payment.
    const updateAttempt = await updateSubscriptionIfNoPending(subscription.pending_update, () =>
      stripe.subscriptions.update(subscription.id, {
        items: [{ id: membershipItem.id, price: targetPrice.value }],
        metadata: {
          ...subscription.metadata,
          supabase_user_id: user.id,
          requested_tier: targetTier.value,
          tier_name: targetTier.value,
        },
        proration_behavior: 'always_invoice',
        payment_behavior: 'pending_if_incomplete',
        expand: ['latest_invoice.payment_intent'],
      }, {
        idempotencyKey: buildSubscriptionChangeIdempotencyKey({
          subscriptionId: subscription.id,
          subscriptionItemId: membershipItem.id,
          currentPriceId: membershipItem.price.id,
          targetPriceId: targetPrice.value,
          subscriptionUpdated: getSubscriptionUpdated(subscription),
        }),
      })
    );
    if (updateAttempt.kind === 'pending') {
      return NextResponse.json({ success: true, outcome: 'pending_payment', code: 'SUBSCRIPTION_CHANGE_PENDING' });
    }
    const updated = updateAttempt.value;

    const paymentIntent = getPaymentIntent(updated);
    const invoiceStatus = getLatestInvoiceStatus(updated);
    const outcome = getPlanChangeOutcome({
      hasPendingUpdate: Boolean(updated.pending_update),
      invoiceStatus,
      paymentIntentStatus: paymentIntent?.status ?? null,
      subscriptionStatus: updated.status,
    });
    return NextResponse.json({
      success: true,
      outcome,
      currentTier,
      targetTier: targetTier.value,
      noOp: false,
    });
  } catch (error: unknown) {
    if (error instanceof Stripe.errors.StripeError) {
      console.error('subscription-change: Stripe update failed.', { type: error.type, code: error.code, statusCode: error.statusCode, requestId: error.requestId });
    } else {
      console.error('subscription-change: unexpected failure.', { errorName: error instanceof Error ? error.name : 'UnknownError' });
    }
    return changeError('Unable to change your membership right now. Please try again.', 500, 'SUBSCRIPTION_CHANGE_FAILED');
  }
}

function getSubscriptionUpdated(subscription: Stripe.Subscription) {
  return (subscription as Stripe.Subscription & { updated?: number }).updated ?? subscription.created;
}

function getLatestInvoiceStatus(subscription: Stripe.Subscription) {
  const invoice = subscription.latest_invoice;
  return invoice && typeof invoice !== 'string' ? invoice.status : null;
}

function getPaymentIntent(subscription: Stripe.Subscription) {
  const invoice = subscription.latest_invoice;
  if (!invoice || typeof invoice === 'string') return null;
  const paymentIntent = (invoice as Stripe.Invoice & {
    payment_intent?: string | Stripe.PaymentIntent | null;
  }).payment_intent;
  return paymentIntent && typeof paymentIntent !== 'string' ? paymentIntent : null;
}
