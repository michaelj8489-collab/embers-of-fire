import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';
import {
  STRIPE_API_VERSION,
  getRequiredEnv,
  normalizeTrustedAppUrl,
} from '@/utils/api/security';

type SubscriptionBillingRow = {
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string | null;
  tier: string | null;
};

function billingError(message: string, status: number, code: string) {
  return NextResponse.json({ success: false, code, error: message }, { status });
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.warn('billing-portal: failed to authenticate user.', {
      message: userError.message,
      status: userError.status,
    });
    return billingError('Authentication required.', 401, 'AUTHENTICATION_REQUIRED');
  }

  if (!user) {
    return billingError('Authentication required.', 401, 'AUTHENTICATION_REQUIRED');
  }

  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id, stripe_subscription_id, status, tier')
    .eq('user_id', user.id)
    .maybeSingle();

  if (subscriptionError) {
    console.error('billing-portal: subscription lookup failed.', {
      code: subscriptionError.code,
      message: subscriptionError.message,
    });
    return billingError('Unable to load billing information.', 500, 'BILLING_LOOKUP_FAILED');
  }

  const billingRow = subscription as SubscriptionBillingRow | null;

  if (!billingRow) {
    return billingError('No billing account was found for this membership.', 404, 'BILLING_ACCOUNT_NOT_FOUND');
  }

  if (!billingRow.stripe_customer_id) {
    return billingError(
      'This membership does not have a billing customer record yet.',
      409,
      'BILLING_CUSTOMER_MISSING'
    );
  }

  const stripeSecretKey = getRequiredEnv('STRIPE_SECRET_KEY');
  const appUrl = normalizeTrustedAppUrl();

  if (!stripeSecretKey.ok || !appUrl.ok) {
    console.error('billing-portal: missing required server configuration.', {
      missingStripeKey: !stripeSecretKey.ok,
      appUrlError: appUrl.ok ? null : appUrl.error,
    });
    return billingError('Billing management is not configured.', 500, 'BILLING_NOT_CONFIGURED');
  }

  const stripe = new Stripe(stripeSecretKey.value, {
    apiVersion: STRIPE_API_VERSION,
  });

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: billingRow.stripe_customer_id,
      return_url: `${appUrl.value}/dashboard/membership?billing=return`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: unknown) {
    if (error instanceof Stripe.errors.StripeError) {
      console.error('billing-portal: Stripe portal session creation failed.', {
        type: error.type,
        code: error.code,
        statusCode: error.statusCode,
        requestId: error.requestId,
      });
    } else {
      console.error('billing-portal: unexpected portal session creation failure.', {
        errorName: error instanceof Error ? error.name : 'UnknownError',
      });
    }

    return billingError('Unable to open billing management.', 500, 'BILLING_PORTAL_FAILED');
  }
}
