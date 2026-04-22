import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe securely
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as any, 
});

// Admin client to bypass RLS during automated updates
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string 
);

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  // Handle successful checkout
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Stripe captures the email the user entered at checkout
    const customerEmail = session.customer_details?.email;
    // The Webhook pulls the tier name that we hid inside the session metadata
    const newTier = session.metadata?.tier_name; 

    if (customerEmail && newTier) {
      console.log(`🔔 Webhook: Processing ${newTier} for ${customerEmail}`);

      // 1. Find the user ID in Supabase using the email
      const { data: userData, error: userError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', customerEmail)
        .single();

      if (userData?.id && !userError) {
        
        // 2. The Golden Ticket: Update their profile for website access!
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({ 
            subscription_tier: newTier,
            updated_at: new Date().toISOString()
          })
          .eq('id', userData.id);

        // 3. Keep the receipt in subscriptions (Will quietly fail if table doesn't exist, but profile still upgrades)
        await supabaseAdmin
          .from('subscriptions')
          .upsert({ 
            user_id: userData.id, 
            tier: newTier, 
            status: 'active',
            stripe_subscription_id: session.subscription as string,
            stripe_customer_id: session.customer as string,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });

        if (profileError) {
          console.error(`❌ Profile Update Error:`, profileError);
        } else {
          console.log(`✅ Success: ${customerEmail} is now a ${newTier} and profile is unlocked!`);
        }
      } else {
        console.error(`❌ User not found for email: ${customerEmail}. They likely used a different email on Stripe.`);
      }
    } else {
       console.error('❌ Missing customer email or tier metadata from Stripe.');
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