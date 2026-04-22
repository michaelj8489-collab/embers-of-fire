import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe securely
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as any, 
});

export async function POST(req: Request) {
  try {
    // 1. ADDED userEmail HERE so the API knows to look for it
    const { tierName, userEmail } = await req.json();

    // 1. Map the Tier to the correct price in cents
    let priceInCents = 0;
    if (tierName === 'Keepers of the Embers') priceInCents = 500;
    else if (tierName === 'Flame Bearers') priceInCents = 1500;
    else if (tierName === 'Phoenix Circle') priceInCents = 3300;
    else if (tierName === 'Wings of the Phoenix') priceInCents = 7500;
    else if (tierName === 'Phoenix Ascending') priceInCents = 15000;
    else {
      return NextResponse.json({ error: 'Invalid Tier' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || 'https://www.embersoflight.net';

    // 2. Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      // 2. ADDED THIS LINE: Locks the user's email into the Stripe checkout
      customer_email: userEmail, 
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: tierName,
            },
            unit_amount: priceInCents,
            // THE FIX: We lock in the exact string literal so TypeScript doesn't panic
            recurring: {
              interval: 'month' as 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard`,
      metadata: {
        tier_name: tierName, // This is what your Webhook reads!
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err: any) {
    console.error('Checkout Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}