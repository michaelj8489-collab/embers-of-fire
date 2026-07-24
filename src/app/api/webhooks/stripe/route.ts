import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  STRIPE_API_VERSION,
  createSupabaseServiceRoleClient,
  getRequiredEnv,
  normalizeTierName,
  type TierName,
} from '@/utils/api/security';
import { resolveSubscriptionMembership } from '@/utils/membership.server';

type SubscriptionLookupRow = {
  user_id: string;
  tier: string | null;
  status: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
};

type BillingContext = {
  userId: string | null;
  tier: TierName | null;
  existingSubscription: SubscriptionLookupRow | null;
};

type InvoiceWithLegacySubscription = Stripe.Invoice & {
  subscription?: string | Stripe.Subscription | null;
};

const ACCESS_GRANTING_SUBSCRIPTION_STATUSES = new Set<string>(['active', 'trialing']);
const ACCESS_REVOKING_SUBSCRIPTION_STATUSES = new Set<string>([
  'past_due',
  'unpaid',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'paused',
]);

type SubscriptionAccessDecision = 'grant' | 'revoke';

type CurrentSubscriptionDecision =
  | { action: 'ignore' }
  | {
      action: 'apply';
      access: SubscriptionAccessDecision;
      currentRow: SubscriptionLookupRow | null;
      currentSubscription: Stripe.Subscription;
      userId: string;
    };

export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  const stripeSecretKey = getRequiredEnv('STRIPE_SECRET_KEY');
  const webhookSecret = getRequiredEnv('STRIPE_WEBHOOK_SECRET');

  if (!stripeSecretKey.ok || !webhookSecret.ok) {
    console.error('stripe-webhook: missing required server configuration.', {
      missingStripeKey: !stripeSecretKey.ok,
      missingWebhookSecret: !webhookSecret.ok,
    });
    return NextResponse.json({ error: 'Webhook is not configured.' }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey.value, {
    apiVersion: STRIPE_API_VERSION,
  });

  const payload = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret.value);
  } catch (error: unknown) {
    console.error('stripe-webhook: signature verification failed.', {
      errorName: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message : 'Unknown verification error',
    });
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseServiceRoleClient();
  if (!supabaseAdmin.ok) return supabaseAdmin.response;

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(
          stripe,
          supabaseAdmin.client,
          event.data.object as Stripe.Checkout.Session
        );
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(
          stripe,
          supabaseAdmin.client,
          event.data.object as Stripe.Subscription
        );
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(
          stripe,
          supabaseAdmin.client,
          event.data.object as Stripe.Subscription
        );
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(
          stripe,
          supabaseAdmin.client,
          event.data.object as Stripe.Invoice
        );
        break;
      case 'invoice.paid':
        await handleInvoicePaid(stripe, supabaseAdmin.client, event.data.object as Stripe.Invoice);
        break;
      default:
        console.info('stripe-webhook: ignored event type.', {
          eventId: event.id,
          eventType: event.type,
        });
    }
  } catch (error: unknown) {
    console.error('stripe-webhook: event processing failed.', {
      eventId: event.id,
      eventType: event.type,
      errorName: error instanceof Error ? error.name : 'UnknownError',
    });
    return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

async function handleCheckoutSessionCompleted(
  stripe: Stripe,
  supabaseAdmin: SupabaseClient,
  session: Stripe.Checkout.Session
) {
  if (session.mode !== 'subscription') {
    console.warn('stripe-webhook: checkout session is not subscription mode.', {
      hasSessionId: Boolean(session.id),
      mode: session.mode,
    });
    return;
  }

  const subscriptionId = getStripeObjectId(session.subscription);
  const customerId = getStripeObjectId(session.customer);
  const email = session.customer_details?.email ?? session.customer_email;
  const context = await resolveBillingContext(supabaseAdmin, {
    metadata: session.metadata,
    subscriptionId,
    email,
    logContext: 'checkout.session.completed',
  });

  if (!subscriptionId || !customerId || !context.userId) {
    console.warn('stripe-webhook: checkout session missing required billing data.', {
      hasSessionId: Boolean(session.id),
      hasSubscriptionId: Boolean(subscriptionId),
      hasCustomerId: Boolean(customerId),
      hasUserId: Boolean(context.userId),
      hasTier: Boolean(context.tier),
      hasEmailFallback: Boolean(email),
    });
    return;
  }

  const decision = await prepareCurrentSubscriptionDecision(stripe, supabaseAdmin, {
    userId: context.userId,
    subscriptionId,
    logContext: 'checkout.session.completed',
    requireCurrentRow: false,
  });

  if (decision.action === 'ignore') return;

  await applyCurrentSubscriptionDecision(supabaseAdmin, decision, {
    fallbackCustomerId: customerId,
    fallbackTier: context.tier,
    logContext: 'checkout.session.completed',
  });
}

async function handleSubscriptionDeleted(
  stripe: Stripe,
  supabaseAdmin: SupabaseClient,
  subscription: Stripe.Subscription
) {
  const subscriptionId = subscription.id;
  const customerId = getStripeObjectId(subscription.customer);
  const context = await resolveBillingContext(supabaseAdmin, {
    metadata: subscription.metadata,
    subscriptionId,
    email: null,
    logContext: 'customer.subscription.deleted',
  });

  if (!context.userId || !customerId) {
    console.warn('stripe-webhook: deleted subscription missing resolvable billing data.', {
      hasSubscriptionId: Boolean(subscriptionId),
      hasCustomerId: Boolean(customerId),
      hasUserId: Boolean(context.userId),
    });
    return;
  }

  const decision = await prepareCurrentSubscriptionDecision(stripe, supabaseAdmin, {
    userId: context.userId,
    subscriptionId,
    logContext: 'customer.subscription.deleted',
    requireCurrentRow: true,
  });

  if (decision.action === 'ignore') return;

  await applyCurrentSubscriptionDecision(supabaseAdmin, decision, {
    fallbackCustomerId: customerId,
    fallbackTier: context.tier,
    logContext: 'customer.subscription.deleted',
  });
}

async function handleSubscriptionUpdated(
  stripe: Stripe,
  supabaseAdmin: SupabaseClient,
  subscription: Stripe.Subscription
) {
  const subscriptionId = subscription.id;
  const customerId = getStripeObjectId(subscription.customer);
  const context = await resolveBillingContext(supabaseAdmin, {
    metadata: subscription.metadata,
    subscriptionId,
    email: null,
    logContext: 'customer.subscription.updated',
  });

  if (!context.userId || !customerId) {
    console.warn('stripe-webhook: updated subscription missing resolvable billing data.', {
      hasSubscriptionId: Boolean(subscriptionId),
      hasCustomerId: Boolean(customerId),
      hasUserId: Boolean(context.userId),
    });
    return;
  }

  const decision = await prepareCurrentSubscriptionDecision(stripe, supabaseAdmin, {
    userId: context.userId,
    subscriptionId,
    logContext: 'customer.subscription.updated',
    requireCurrentRow: true,
  });

  if (decision.action === 'ignore') return;

  await applyCurrentSubscriptionDecision(supabaseAdmin, decision, {
    fallbackCustomerId: customerId,
    fallbackTier: context.tier,
    logContext: 'customer.subscription.updated',
  });
}

async function handleInvoicePaymentFailed(
  stripe: Stripe,
  supabaseAdmin: SupabaseClient,
  invoice: Stripe.Invoice
) {
  const subscriptionId = getInvoiceSubscriptionId(invoice);
  const customerId = getStripeObjectId(invoice.customer);
  const metadata = invoice.parent?.subscription_details?.metadata ?? invoice.metadata;
  const context = await resolveBillingContext(supabaseAdmin, {
    metadata,
    subscriptionId,
    email: invoice.customer_email,
    logContext: 'invoice.payment_failed',
  });

  if (!subscriptionId || !customerId || !context.userId) {
    console.warn('stripe-webhook: failed invoice missing resolvable billing data.', {
      hasInvoiceId: Boolean(invoice.id),
      hasSubscriptionId: Boolean(subscriptionId),
      hasCustomerId: Boolean(customerId),
      hasUserId: Boolean(context.userId),
      hasEmailFallback: Boolean(invoice.customer_email),
    });
    return;
  }

  const decision = await prepareCurrentSubscriptionDecision(stripe, supabaseAdmin, {
    userId: context.userId,
    subscriptionId,
    logContext: 'invoice.payment_failed',
    requireCurrentRow: true,
  });

  if (decision.action === 'ignore') return;

  await applyCurrentSubscriptionDecision(supabaseAdmin, decision, {
    fallbackCustomerId: customerId,
    fallbackTier: context.tier,
    logContext: 'invoice.payment_failed',
  });
}

async function handleInvoicePaid(
  stripe: Stripe,
  supabaseAdmin: SupabaseClient,
  invoice: Stripe.Invoice
) {
  const subscriptionId = getInvoiceSubscriptionId(invoice);
  const customerId = getStripeObjectId(invoice.customer);
  const metadata = invoice.parent?.subscription_details?.metadata ?? invoice.metadata;
  const context = await resolveBillingContext(supabaseAdmin, {
    metadata,
    subscriptionId,
    email: invoice.customer_email,
    logContext: 'invoice.paid',
  });

  if (!subscriptionId || !customerId || !context.userId) {
    console.warn('stripe-webhook: paid invoice missing required billing data.', {
      hasInvoiceId: Boolean(invoice.id),
      hasSubscriptionId: Boolean(subscriptionId),
      hasCustomerId: Boolean(customerId),
      hasUserId: Boolean(context.userId),
      hasTier: Boolean(context.tier),
      hasEmailFallback: Boolean(invoice.customer_email),
    });
    return;
  }

  const decision = await prepareCurrentSubscriptionDecision(stripe, supabaseAdmin, {
    userId: context.userId,
    subscriptionId,
    logContext: 'invoice.paid',
    requireCurrentRow: true,
  });

  if (decision.action === 'ignore') return;

  await applyCurrentSubscriptionDecision(supabaseAdmin, decision, {
    fallbackCustomerId: customerId,
    fallbackTier: context.tier,
    logContext: 'invoice.paid',
  });
}

async function resolveBillingContext(
  supabaseAdmin: SupabaseClient,
  options: {
    metadata: Stripe.Metadata | null | undefined;
    subscriptionId: string | null;
    email: string | null | undefined;
    logContext: string;
  }
): Promise<BillingContext> {
  const metadataUserId = getMetadataString(options.metadata, 'supabase_user_id');
  const metadataTier = getTierFromMetadata(options.metadata);
  const existingSubscription = options.subscriptionId
    ? await findSubscriptionByStripeId(supabaseAdmin, options.subscriptionId, options.logContext)
    : null;

  let userId: string | null = null;

  if (metadataUserId) {
    const profileExists = await hasProfile(supabaseAdmin, metadataUserId, options.logContext);

    if (profileExists) {
      userId = metadataUserId;
    } else {
      console.warn('stripe-webhook: metadata user ID did not match a profile.', {
        logContext: options.logContext,
        hasSubscriptionId: Boolean(options.subscriptionId),
      });
    }
  }

  if (!userId && existingSubscription?.user_id) {
    userId = existingSubscription.user_id;
  }

  if (!userId && options.email) {
    // Legacy fallback for Checkout Sessions created before supabase_user_id metadata existed.
    console.warn('stripe-webhook: using legacy email fallback for user lookup.', {
      logContext: options.logContext,
      hasSubscriptionId: Boolean(options.subscriptionId),
    });
    userId = await findProfileIdByEmail(supabaseAdmin, options.email, options.logContext);
  }

  const tier = metadataTier ?? normalizeExistingTier(existingSubscription?.tier);

  return {
    userId,
    tier,
    existingSubscription,
  };
}

async function prepareCurrentSubscriptionDecision(
  stripe: Stripe,
  supabaseAdmin: SupabaseClient,
  options: {
    userId: string;
    subscriptionId: string;
    logContext: string;
    requireCurrentRow: boolean;
  }
): Promise<CurrentSubscriptionDecision> {
  const currentRow = await findSubscriptionByUserId(
    supabaseAdmin,
    options.userId,
    options.logContext
  );

  if (
    currentRow?.stripe_subscription_id &&
    currentRow.stripe_subscription_id !== options.subscriptionId
  ) {
    console.info('stripe-webhook: ignored stale event for replaced subscription.', {
      logContext: options.logContext,
      hasCurrentSubscription: true,
    });
    return { action: 'ignore' };
  }

  if (options.requireCurrentRow && !currentRow?.stripe_subscription_id) {
    console.warn('stripe-webhook: ignored event because no current subscription row exists.', {
      logContext: options.logContext,
      hasCurrentRow: Boolean(currentRow),
    });
    return { action: 'ignore' };
  }

  const currentSubscription = await retrieveCurrentSubscription(
    stripe,
    options.subscriptionId,
    options.logContext
  );
  const access = classifySubscriptionAccess(
    currentSubscription.status,
    options.subscriptionId,
    options.logContext
  );

  return {
    action: 'apply',
    access,
    currentRow,
    currentSubscription,
    userId: options.userId,
  };
}

async function applyCurrentSubscriptionDecision(
  supabaseAdmin: SupabaseClient,
  decision: Extract<CurrentSubscriptionDecision, { action: 'apply' }>,
  options: {
    fallbackCustomerId: string;
    fallbackTier: TierName | null;
    logContext: string;
  }
) {
  const currentCustomerId =
    getStripeObjectId(decision.currentSubscription.customer) ?? options.fallbackCustomerId;
  const membership = resolveSubscriptionMembership(
    decision.currentSubscription,
    decision.currentRow?.tier
  );
  const periodEndIso = getSubscriptionPeriodEnd(decision.currentSubscription);

  if (!currentCustomerId) {
    console.warn('stripe-webhook: current subscription is missing customer ID.', {
      logContext: options.logContext,
      hasSubscriptionId: Boolean(decision.currentSubscription.id),
    });
    return;
  }

  if (membership.kind === 'configuration_error') {
    console.error('stripe-webhook: membership Price configuration is invalid; leaving access unchanged for retry.', {
      logContext: options.logContext,
      hasSubscriptionId: Boolean(decision.currentSubscription.id),
    });
    throw new Error('Membership Price configuration is invalid.');
  }

  if (membership.kind === 'unknown_price') {
    console.warn('stripe-webhook: configured membership tier was not found for subscription Price ID; access fails closed.', {
      logContext: options.logContext,
      hasSubscriptionId: Boolean(decision.currentSubscription.id),
      status: decision.currentSubscription.status,
    });
    await deactivateSubscriptionAccess(supabaseAdmin, {
      userId: decision.userId,
      tier: null,
      subscriptionId: decision.currentSubscription.id,
      customerId: currentCustomerId,
      status: decision.currentSubscription.status,
      logContext: options.logContext,
    });
    return;
  }

  const currentTier = membership.tier;

  if (decision.access === 'grant') {
    if (!currentTier) {
      console.warn('stripe-webhook: current entitled subscription is missing tier metadata.', {
        logContext: options.logContext,
        hasSubscriptionId: Boolean(decision.currentSubscription.id),
        status: decision.currentSubscription.status,
      });
      return;
    }

    await activateSubscriptionAccess(supabaseAdmin, {
      userId: decision.userId,
      tier: currentTier,
      subscriptionId: decision.currentSubscription.id,
      customerId: currentCustomerId,
      status: decision.currentSubscription.status,
      periodEndIso,
      logContext: options.logContext,
    });
    return;
  }

  await deactivateSubscriptionAccess(supabaseAdmin, {
    userId: decision.userId,
    tier: currentTier,
    subscriptionId: decision.currentSubscription.id,
    customerId: currentCustomerId,
    status: decision.currentSubscription.status,
    logContext: options.logContext,
  });
}

async function activateSubscriptionAccess(
  supabaseAdmin: SupabaseClient,
  options: {
    userId: string;
    tier: TierName;
    subscriptionId: string;
    customerId: string;
    status: string;
    periodEndIso: string | null;
    logContext: string;
  }
) {
  await updateProfileSubscription(supabaseAdmin, {
    userId: options.userId,
    tier: options.tier,
    status: 'active',
    logContext: options.logContext,
  });

  await upsertSubscription(supabaseAdmin, {
    userId: options.userId,
    tier: options.tier,
    subscriptionId: options.subscriptionId,
    customerId: options.customerId,
    status: options.status,
    periodEndIso: options.periodEndIso,
    logContext: options.logContext,
  });
}

async function deactivateSubscriptionAccess(
  supabaseAdmin: SupabaseClient,
  options: {
    userId: string;
    tier: TierName | null;
    subscriptionId: string;
    customerId: string;
    status: string;
    logContext: string;
  }
) {
  await updateProfileSubscription(supabaseAdmin, {
    userId: options.userId,
    tier: 'Seeker',
    status: 'inactive',
    logContext: options.logContext,
  });

  await upsertSubscription(supabaseAdmin, {
    userId: options.userId,
    tier: options.tier ?? 'Seeker',
    subscriptionId: options.subscriptionId,
    customerId: options.customerId,
    status: options.status,
    periodEndIso: null,
    logContext: options.logContext,
  });
}

async function updateProfileSubscription(
  supabaseAdmin: SupabaseClient,
  options: {
    userId: string;
    tier: TierName | 'Seeker';
    status: 'active' | 'inactive';
    logContext: string;
  }
) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription_tier: options.tier,
      subscription_status: options.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', options.userId)
    .select('id')
    .single();

  if (error) {
    console.error(`stripe-webhook: ${options.logContext} profile update failed.`, {
      code: error.code,
      message: error.message,
    });
    throw new Error('Profile update failed.');
  }
}

async function upsertSubscription(
  supabaseAdmin: SupabaseClient,
  options: {
    userId: string;
    tier: TierName | 'Seeker';
    subscriptionId: string;
    customerId: string;
    status: string;
    periodEndIso: string | null;
    logContext: string;
  }
) {
  const subscriptionRecord: Record<string, string> = {
    user_id: options.userId,
    tier: options.tier,
    status: options.status,
    stripe_subscription_id: options.subscriptionId,
    stripe_customer_id: options.customerId,
    updated_at: new Date().toISOString(),
  };

  if (options.periodEndIso) {
    subscriptionRecord.current_period_end = options.periodEndIso;
  }

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .upsert(subscriptionRecord, { onConflict: 'user_id' })
    .select('user_id')
    .single();

  if (error) {
    console.error(`stripe-webhook: ${options.logContext} subscription upsert failed.`, {
      code: error.code,
      message: error.message,
    });
    throw new Error('Subscription upsert failed.');
  }
}

async function findSubscriptionByUserId(
  supabaseAdmin: SupabaseClient,
  userId: string,
  logContext: string
) {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id, tier, status, stripe_customer_id, stripe_subscription_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error(`stripe-webhook: ${logContext} current subscription lookup failed.`, {
      code: error.code,
      message: error.message,
    });
    throw new Error('Current subscription lookup failed.');
  }

  return data as SubscriptionLookupRow | null;
}

async function findSubscriptionByStripeId(
  supabaseAdmin: SupabaseClient,
  subscriptionId: string,
  logContext: string
) {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id, tier, status, stripe_customer_id, stripe_subscription_id')
    .eq('stripe_subscription_id', subscriptionId)
    .maybeSingle();

  if (error) {
    console.error(`stripe-webhook: ${logContext} subscription lookup failed.`, {
      code: error.code,
      message: error.message,
    });
    throw new Error('Subscription lookup failed.');
  }

  return data as SubscriptionLookupRow | null;
}

async function retrieveCurrentSubscription(
  stripe: Stripe,
  subscriptionId: string,
  logContext: string
) {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error: unknown) {
    if (error instanceof Stripe.errors.StripeError) {
      console.error(`stripe-webhook: ${logContext} current Stripe subscription lookup failed.`, {
        type: error.type,
        code: error.code,
        statusCode: error.statusCode,
        requestId: error.requestId,
      });
    } else {
      console.error(`stripe-webhook: ${logContext} current Stripe subscription lookup failed.`, {
        errorName: error instanceof Error ? error.name : 'UnknownError',
      });
    }

    throw new Error('Current Stripe subscription lookup failed.');
  }
}

function classifySubscriptionAccess(status: string, _subscriptionId: string, logContext: string): SubscriptionAccessDecision {
  if (ACCESS_GRANTING_SUBSCRIPTION_STATUSES.has(status)) {
    return 'grant';
  }

  if (ACCESS_REVOKING_SUBSCRIPTION_STATUSES.has(status)) {
    return 'revoke';
  }

  console.warn('stripe-webhook: unknown subscription status defaults to no access.', {
    logContext,
    status,
  });
  return 'revoke';
}

async function hasProfile(supabaseAdmin: SupabaseClient, userId: string, logContext: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error(`stripe-webhook: ${logContext} profile lookup failed.`, {
      code: error.code,
      message: error.message,
    });
    throw new Error('Profile lookup failed.');
  }

  return Boolean(data);
}

async function findProfileIdByEmail(
  supabaseAdmin: SupabaseClient,
  email: string,
  logContext: string
) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(`stripe-webhook: ${logContext} email fallback lookup failed.`, {
      code: error.code,
      message: error.message,
    });
    throw new Error('Email fallback lookup failed.');
  }

  return typeof data?.id === 'string' ? data.id : null;
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice) {
  const legacyInvoice = invoice as InvoiceWithLegacySubscription;
  const legacySubscription = legacyInvoice.subscription;
  const currentSubscription = invoice.parent?.subscription_details?.subscription;

  return getStripeObjectId(legacySubscription) ?? getStripeObjectId(currentSubscription);
}

function getStripeObjectId(value: string | { id: string } | null | undefined) {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  if (value && typeof value === 'object' && typeof value.id === 'string' && value.id.trim()) {
    return value.id;
  }

  return null;
}

function getTierFromMetadata(metadata: Stripe.Metadata | null | undefined): TierName | null {
  const requestedTier = getMetadataString(metadata, 'requested_tier');
  const tierName = requestedTier ?? getMetadataString(metadata, 'tier_name');
  const tier = normalizeTierName(tierName);

  return tier.ok ? tier.value : null;
}

function getMetadataString(metadata: Stripe.Metadata | null | undefined, key: string) {
  const value = metadata?.[key];

  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeExistingTier(tier: string | null | undefined): TierName | null {
  const normalized = normalizeTierName(tier);
  return normalized.ok ? normalized.value : null;
}

function getSubscriptionPeriodEnd(subscription: Stripe.Subscription) {
  const recurringItems = subscription.items.data.filter(
    (item) => item.price.recurring?.interval === 'month'
  );
  const periodEnd = recurringItems.length === 1 ? recurringItems[0].current_period_end : null;
  return unixToIso(periodEnd);
}

function unixToIso(timestamp: number | null | undefined) {
  if (typeof timestamp !== 'number') {
    return null;
  }

  return new Date(timestamp * 1000).toISOString();
}
