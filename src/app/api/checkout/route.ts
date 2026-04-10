import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any, // Standard stable version
});

export async function POST(req: Request) {
  try {
    const { tierName } = await req.json();

    // MAP YOUR TIERS TO YOUR STRIPE PRICE IDs
    const priceMap: Record<string, string> = {
      "KEEPERS OF THE EMBERS": "price_1TKYLtBAi5oU9zpeG6IJz4Zf", 
      "FLAME BEARERS": "price_1TKYUrBAi5oU9zpegt6H0RNl",
      "PHOENIX CIRCLE": "price_1TKYYoBAi5oU9zpeidMJTQsl",
      "WINGS OF THE PHOENIX": "price_1TKYbuBAi5oU9zpeHr8quMGD",
      "PHOENIX ASCENDING": "price_1TKYeXBAi5oU9zpeDmB6wKpt"
    };

    // We convert the incoming tierName to uppercase to ensure it matches the keys above
    const priceId = priceMap[tierName.toUpperCase()];

    if (!priceId) {
      console.error(`Price ID not found for tier: ${tierName}`);
      return NextResponse.json({ error: 'Invalid Tier Name' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      // After successful payment, they go to your dashboard
      success_url: `${req.headers.get('origin')}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      // If they hit the back button, they return to the landing page
      cancel_url: `${req.headers.get('origin')}/`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err: any) {
    console.error("Stripe API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}