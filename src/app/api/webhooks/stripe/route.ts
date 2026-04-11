import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe securely with the exact 2026 version your system downloaded
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia', 
});

// We need a special Supabase client to bypass security rules when doing automated backend updates
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event;

  try {
    // Verify that this message actually came from Stripe and not a hacker
    event = stripe.webhooks.constructEvent(
      payload,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  // Handle the event when a checkout is successfully completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Grab the customer's email from the checkout session
    const customerEmail = session.customer_details?.email;
    
    // Find out which tier they bought based on the Stripe Product ID or Metadata
    const newTier = session.metadata?.tier_name; 

    if (customerEmail && newTier) {
      console.log(`Upgrading ${customerEmail} to ${newTier}`);

      // 1. Find the user ID in Supabase based on their email
      const { data: userData, error: userError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', customerEmail)
        .single();

      if (userData?.id && !userError) {
        // 2. Update their subscription tier
        await supabaseAdmin
          .from('profiles')
          .update({ subscription_tier: newTier })
          .eq('id', userData.id);
      }
    }
  }

  // Acknowledge receipt to Stripe
  return NextResponse.json({ received: true }, { status: 200 });
}