import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';
import {
  CHECKOUT_TIERS,
  STRIPE_API_VERSION,
  jsonError,
  normalizeTierName,
  normalizeTrustedAppUrl,
  readJsonObject,
  getRequiredEnv,
} from '@/utils/api/security';

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
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: tierName,
            },
            unit_amount: CHECKOUT_TIERS[tierName],
            recurring: {
              interval: 'month',
            },
          },
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
    });

    return NextResponse.json({ sessionId: session.id });
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
