import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe securely
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia', 
});

// Admin client to bypass RLS during automated updates
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  // Handle successful checkout
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const customerEmail = session.customer_details?.email;
    const newTier = session.metadata?.tier_name; 

    if (customerEmail && newTier) {
      console.log(`🔔 Webhook: Processing ${newTier} for ${customerEmail}`);

      // 1. Find the user ID in Supabase
      const { data: userData, error: userError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', customerEmail)
        .single();

      if (userData?.id && !userError) {
        
        // 1. Keep the receipt: Log the billing data in the subscriptions table
        const { error: subError } = await supabaseAdmin
          .from('subscriptions')
          .upsert({ 
            user_id: userData.id, 
            tier: newTier, 
            status: 'active',
            stripe_subscription_id: session.subscription as string,
            stripe_customer_id: session.customer as string,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });

        // 2. Hand them the VIP wristband: Update their profile for website access!
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({ 
            subscription_tier: newTier,
            updated_at: new Date().toISOString()
          })
          .eq('id', userData.id);

        if (subError || profileError) {
          console.error(`❌ Database Error:`, subError || profileError);
        } else {
          console.log(`✅ Success: ${customerEmail} is now a ${newTier} and profile is unlocked!`);
        }
      } else {
        console.error(`❌ User not found for email: ${customerEmail}`);
      }
    }
  }

  // Handle subscription cancellations or payment failures
  if (event.type === 'customer.subscription.deleted' || event.type === 'invoice.payment_failed') {
    const subscription = event.data.object as Stripe.Subscription;
    
    // Deactivate their access in the database
    await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'inactive' })
      .eq('stripe_subscription_id', subscription.id);
      
    console.log(`🚫 Access revoked for subscription: ${subscription.id}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}