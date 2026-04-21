import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia', 
});

export async function POST(req: Request) {
  try {
    const { tierName } = await req.json();

    // Mapping frontend names to your specific Stripe Price IDs
    const priceMap: Record<string, string> = {
      "Keepers of the Embers": "price_1TKYLtBAi5oU9zpeG6IJz4Zf", 
      "Flame Bearers": "price_1TKYUrBAi5oU9zpegt6H0RNl",
      "Phoenix Circle": "price_1TKYYoBAi5oU9zpeidMJTQsl",
      "Wings of the Phoenix": "price_1TKYbuBAi5oU9zpeHr8quMGD",
      "Phoenix Ascending": "price_1TKYeXBAi5oU9zpeDmB6wKpt",
    };

    const priceId = priceMap[tierName];

    if (!priceId) {
      return NextResponse.json({ error: 'Invalid tier selected' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      // Return user to dashboard on success, or home on cancel
      success_url: `${req.headers.get('origin')}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/`,
      metadata: {
        // FIXED: Now sends the exact name (e.g., "Keepers of the Embers") 
        // instead of "keepers-of-the-embers"
        tier_name: tierName, 
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err: any) {
    console.error("Stripe Session Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}