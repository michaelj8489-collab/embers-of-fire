import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia', 
});

export async function POST(req: Request) {
  try {
    const { tierName } = await req.json();

    // TO DO: Replace these placeholder strings with your actual 'price_...' IDs from Stripe
    const priceMap: Record<string, string> = {
      "Keepers of the Embers": "price_INSERT_YOUR_ID_HERE", 
      "Flame Bearers": "price_INSERT_YOUR_ID_HERE",
      "Phoenix Circle": "price_INSERT_YOUR_ID_HERE",
      "Wings of the Phoenix": "price_INSERT_YOUR_ID_HERE",
      "Phoenix Ascending": "price_INSERT_YOUR_ID_HERE",
    };

    const priceId = priceMap[tierName];

    if (!priceId) {
      return NextResponse.json({ error: 'Invalid tier selected' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      // This sends them back to your dashboard after they pay
      success_url: `${req.headers.get('origin')}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/`,
      metadata: {
        // This is the "hidden note" the Webhook looks for!
        tier_name: tierName.toLowerCase().replace(/ /g, '-'), 
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err: any) {
    console.error("Stripe Session Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}