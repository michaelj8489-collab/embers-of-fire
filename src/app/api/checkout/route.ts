import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';
import {
  STRIPE_API_VERSION,
  createSupabaseServiceRoleClient,
  jsonError,
  normalizeTierName,
  normalizeTrustedAppUrl,
  readJsonObject,
  getRequiredEnv,
} from '@/utils/api/security';
import { validateTierName } from '@/utils/membership';
import { retrieveValidatedStripePrice } from '@/utils/membership.server';

type ProfileSubscriptionRow = {
  subscription_tier: string | null;
  subscription_status: string | null;
};

type SubscriptionCheckoutRow = {
  tier: string | null;
  status: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
};

const ACTIVE_SUBSCRIPTION_STATUSES = new Set<string>(['active', 'trialing']);
const LOCAL_PROCESSING_SUBSCRIPTION_STATUSES = new Set<string>([
  'incomplete',
  'past_due',
  'unpaid',
  'paused',
]);
const STRIPE_BLOCKING_SUBSCRIPTION_STATUSES = new Set<Stripe.Subscription.Status>([
  'active',
  'trialing',
  'incomplete',
  'past_due',
  'unpaid',
  'paused',
]);
const STRIPE_ENTITLED_SUBSCRIPTION_STATUSES = new Set<Stripe.Subscription.Status>([
  'active',
  'trialing',
]);

type StripeCustomerResult =
  | { ok: true; customerId: string }
  | { ok: false; response: NextResponse };

type StripeBillingGateResult =
  | { action: 'allow' }
  | { action: 'reuse_checkout'; sessionId: string; url: string }
  | { action: 'block'; status: number; code: string; message: string };

function checkoutError(message: string, status: number, code: string) {
  return NextResponse.json({ success: false, code, error: message }, { status });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.warn('checkout: failed to authenticate user.', {
      message: userError.message,
      status: userError.status,
    });
    return jsonError('Authentication required.', 401);
  }

  if (!user) {
    return jsonError('Authentication required.', 401);
  }

  if (!user.email) {
    return jsonError('Authenticated user must have an email address.', 400);
  }

  const body = await readJsonObject(req);
  if (!body.ok) return jsonError(body.error, 400);

  const tier = normalizeTierName(body.value.tierName);
  if (!tier.ok) return jsonError(tier.error, 400);

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('checkout: profile lookup failed.', {
      code: profileError.code,
      message: profileError.message,
    });
    return jsonError('Unable to verify membership status.', 500);
  }

  if (!profile) {
    return checkoutError(
      'Your membership profile is not ready yet. Please try again shortly.',
      409,
      'MEMBERSHIP_PROFILE_REQUIRED'
    );
  }

  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('tier, status, stripe_customer_id, stripe_subscription_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (subscriptionError) {
    console.error('checkout: subscription lookup failed.', {
      code: subscriptionError.code,
      message: subscriptionError.message,
    });
    return jsonError('Unable to verify billing status.', 500);
  }

  const profileSubscription = profile as ProfileSubscriptionRow;
  const currentSubscription = subscription as SubscriptionCheckoutRow | null;

  if (hasActivePaidSubscription(profileSubscription, currentSubscription)) {
    return checkoutError(
      'You already have an active paid membership. Please manage billing instead.',
      409,
      'ACTIVE_SUBSCRIPTION_EXISTS'
    );
  }

  if (hasLocalProcessingSubscription(currentSubscription)) {
    return checkoutError(
      'Your membership is still processing. Please wait a few minutes before trying again.',
      409,
      'SUBSCRIPTION_PROCESSING'
    );
  }

  const stripeSecretKey = getRequiredEnv('STRIPE_SECRET_KEY');
  const appUrl = normalizeTrustedAppUrl();

  if (!stripeSecretKey.ok || !appUrl.ok) {
    console.error('checkout: missing required server configuration.', {
      missingStripeKey: !stripeSecretKey.ok,
      appUrlError: appUrl.ok ? null : appUrl.error,
    });
    return jsonError('Checkout is not configured.', 500);
  }

  const stripe = new Stripe(stripeSecretKey.value, {
    apiVersion: STRIPE_API_VERSION,
  });

  const tierName = tier.value;
  const metadata = {
    supabase_user_id: user.id,
    requested_tier: tierName,
    tier_name: tierName,
  };

  try {
    const stripePrice = await retrieveValidatedStripePrice(stripe, tierName);
    if (!stripePrice.ok) {
      console.error('checkout: configured Stripe Price is invalid.', { configurationError: stripePrice.error });
      return checkoutError('Checkout is not configured.', 500, 'BILLING_NOT_CONFIGURED');
    }

    const customer = await getOrCreateStripeCustomerId(stripe, {
      userId: user.id,
      userEmail: user.email,
      currentSubscription,
      metadata,
    });

    if (!customer.ok) {
      return customer.response;
    }

    const billingGate = await checkStripeBillingState(stripe, {
      customerId: customer.customerId,
      userId: user.id,
      requestedTier: tierName,
    });

    if (billingGate.action === 'reuse_checkout') {
      return NextResponse.json({
        sessionId: billingGate.sessionId,
        url: billingGate.url,
        code: 'CHECKOUT_ALREADY_PENDING',
      });
    }

    if (billingGate.action === 'block') {
      return checkoutError(billingGate.message, billingGate.status, billingGate.code);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customer.customerId,
      client_reference_id: user.id,
      line_items: [
        {
          price: stripePrice.value,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${appUrl.value}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl.value}/dashboard`,
      metadata,
      subscription_data: {
        metadata,
      },
    }, {
      idempotencyKey: buildCheckoutIdempotencyKey(user.id, tierName),
    });

    if (!session.url) {
      console.error('checkout: Stripe session was created without a hosted checkout URL.', {
        sessionId: session.id,
      });
      return jsonError('Unable to start checkout.', 500);
    }

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: unknown) {
    if (error instanceof Stripe.errors.StripeError) {
      console.error('checkout: Stripe session creation failed.', {
        type: error.type,
        code: error.code,
        statusCode: error.statusCode,
        requestId: error.requestId,
      });
    } else {
      console.error('checkout: unexpected session creation failure.', {
        errorName: error instanceof Error ? error.name : 'UnknownError',
      });
    }

    return jsonError('Unable to start checkout.', 500);
  }
}

function hasActivePaidSubscription(
  profile: ProfileSubscriptionRow,
  subscription: SubscriptionCheckoutRow | null
) {
  const profileHasActivePaidTier =
    profile.subscription_status === 'active' && isPaidTier(profile.subscription_tier);
  const subscriptionHasActivePaidTier =
    subscription !== null &&
    ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status ?? '') &&
    isPaidTier(subscription.tier);

  return profileHasActivePaidTier || subscriptionHasActivePaidTier;
}

function hasLocalProcessingSubscription(subscription: SubscriptionCheckoutRow | null) {
  return (
    subscription !== null &&
    LOCAL_PROCESSING_SUBSCRIPTION_STATUSES.has(subscription.status ?? '') &&
    isPaidTier(subscription.tier)
  );
}

function isPaidTier(tier: string | null | undefined) {
  return validateTierName(tier).ok;
}

async function getOrCreateStripeCustomerId(
  stripe: Stripe,
  options: {
    userId: string;
    userEmail: string;
    currentSubscription: SubscriptionCheckoutRow | null;
    metadata: Record<string, string>;
  }
): Promise<StripeCustomerResult> {
  if (options.currentSubscription?.stripe_customer_id) {
    const verifiedCustomer = await verifyStripeCustomer(
      stripe,
      options.currentSubscription.stripe_customer_id
    );

    if (!verifiedCustomer.ok) {
      return verifiedCustomer;
    }

    return { ok: true, customerId: options.currentSubscription.stripe_customer_id };
  }

  const supabaseAdmin = createSupabaseServiceRoleClient();
  if (!supabaseAdmin.ok) return supabaseAdmin;

  try {
    const customer = await stripe.customers.create(
      {
        email: options.userEmail,
        metadata: options.metadata,
      },
      {
        idempotencyKey: `embers-customer-${options.userId}`,
      }
    );

    const persisted = await persistStripeCustomerId(supabaseAdmin.client, {
      userId: options.userId,
      customerId: customer.id,
      currentSubscription: options.currentSubscription,
    });

    if (!persisted.ok) {
      return persisted;
    }

    return { ok: true, customerId: customer.id };
  } catch (error: unknown) {
    if (error instanceof Stripe.errors.StripeError) {
      console.error('checkout: Stripe customer creation failed.', {
        type: error.type,
        code: error.code,
        statusCode: error.statusCode,
        requestId: error.requestId,
      });
    } else {
      console.error('checkout: unexpected Stripe customer creation failure.', {
        errorName: error instanceof Error ? error.name : 'UnknownError',
      });
    }

    return {
      ok: false,
      response: checkoutError(
        'Unable to verify billing status right now. Please try again shortly.',
        503,
        'BILLING_VERIFICATION_FAILED'
      ),
    };
  }
}

async function verifyStripeCustomer(
  stripe: Stripe,
  customerId: string
): Promise<StripeCustomerResult> {
  try {
    const customer = await stripe.customers.retrieve(customerId);

    if ('deleted' in customer && customer.deleted) {
      console.warn('checkout: stored Stripe customer has been deleted.', {
        customerIdPresent: Boolean(customerId),
      });
      return {
        ok: false,
        response: checkoutError(
          'Your billing record needs attention before checkout can continue.',
          409,
          'BILLING_CUSTOMER_UNAVAILABLE'
        ),
      };
    }

    return { ok: true, customerId };
  } catch (error: unknown) {
    if (error instanceof Stripe.errors.StripeError) {
      console.error('checkout: stored Stripe customer lookup failed.', {
        type: error.type,
        code: error.code,
        statusCode: error.statusCode,
        requestId: error.requestId,
      });
    } else {
      console.error('checkout: unexpected Stripe customer lookup failure.', {
        errorName: error instanceof Error ? error.name : 'UnknownError',
      });
    }

    return {
      ok: false,
      response: checkoutError(
        'Unable to verify billing status right now. Please try again shortly.',
        503,
        'BILLING_VERIFICATION_FAILED'
      ),
    };
  }
}

async function persistStripeCustomerId(
  supabaseAdmin: SupabaseClient,
  options: {
    userId: string;
    customerId: string;
    currentSubscription: SubscriptionCheckoutRow | null;
  }
): Promise<StripeCustomerResult> {
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .upsert(
      {
        user_id: options.userId,
        stripe_customer_id: options.customerId,
        tier: normalizeSubscriptionTierForRow(options.currentSubscription?.tier),
        status: options.currentSubscription?.status || 'inactive',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select('user_id')
    .single();

  if (error) {
    console.error('checkout: failed to persist Stripe customer ID before checkout.', {
      code: error.code,
      message: error.message,
    });
    return {
      ok: false,
      response: jsonError('Unable to prepare checkout.', 500),
    };
  }

  return { ok: true, customerId: options.customerId };
}

async function checkStripeBillingState(
  stripe: Stripe,
  options: {
    customerId: string;
    userId: string;
    requestedTier: string;
  }
): Promise<StripeBillingGateResult> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: options.customerId,
      status: 'all',
      limit: 10,
    });

    const blockingSubscription = subscriptions.data.find((subscription) =>
      STRIPE_BLOCKING_SUBSCRIPTION_STATUSES.has(subscription.status)
    );

    if (blockingSubscription) {
      if (STRIPE_ENTITLED_SUBSCRIPTION_STATUSES.has(blockingSubscription.status)) {
        return {
          action: 'block',
          status: 409,
          code: 'ACTIVE_SUBSCRIPTION_EXISTS',
          message: 'You already have an active paid membership. Please manage billing instead.',
        };
      }

      return {
        action: 'block',
        status: 409,
        code: 'SUBSCRIPTION_PROCESSING',
        message: 'Your membership is still processing. Please wait a few minutes before trying again.',
      };
    }

    const openSessions = await stripe.checkout.sessions.list({
      customer: options.customerId,
      status: 'open',
      limit: 10,
    });

    const openSession = openSessions.data.find((session) =>
      isRelevantOpenSubscriptionCheckout(session, options.userId)
    );

    if (!openSession) {
      return { action: 'allow' };
    }

    if (getSessionTier(openSession) === options.requestedTier && openSession.url) {
      return {
        action: 'reuse_checkout',
        sessionId: openSession.id,
        url: openSession.url,
      };
    }

    return {
      action: 'block',
      status: 409,
      code: 'CHECKOUT_ALREADY_PENDING',
      message: 'A membership checkout is already pending. Please finish or abandon that checkout before starting another.',
    };
  } catch (error: unknown) {
    if (error instanceof Stripe.errors.StripeError) {
      console.error('checkout: Stripe billing-state verification failed.', {
        type: error.type,
        code: error.code,
        statusCode: error.statusCode,
        requestId: error.requestId,
      });
    } else {
      console.error('checkout: unexpected billing-state verification failure.', {
        errorName: error instanceof Error ? error.name : 'UnknownError',
      });
    }

    return {
      action: 'block',
      status: 503,
      code: 'BILLING_VERIFICATION_FAILED',
      message: 'Unable to verify billing status right now. Please try again shortly.',
    };
  }
}

function isRelevantOpenSubscriptionCheckout(session: Stripe.Checkout.Session, userId: string) {
  return (
    session.mode === 'subscription' &&
    session.status === 'open' &&
    session.client_reference_id === userId &&
    session.metadata?.supabase_user_id === userId &&
    session.expires_at > Math.floor(Date.now() / 1000)
  );
}

function getSessionTier(session: Stripe.Checkout.Session) {
  return session.metadata?.requested_tier ?? session.metadata?.tier_name ?? null;
}

function normalizeSubscriptionTierForRow(tier: string | null | undefined) {
  if (tier === 'Seeker' || isPaidTier(tier)) {
    return tier;
  }

  return 'Seeker';
}

function buildCheckoutIdempotencyKey(userId: string, tierName: string) {
  const tierSlug = tierName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const fiveMinuteBucket = Math.floor(Date.now() / 300000);

  return `embers-checkout-${userId}-${tierSlug}-${fiveMinuteBucket}`;
}
