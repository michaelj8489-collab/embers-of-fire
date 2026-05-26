import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// 1. Configure the Push Service with your Keys
webpush.setVapidDetails(
  'mailto:admin@embersoflight.net', // Just needs to be a valid admin email
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  try {
    // We expect a Title, Body, and URL from whoever clicks the "Send" button
    const { title, body, url } = await req.json();

    // 2. Use the Service Role Key to bypass RLS and fetch ALL devices
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    );

    const { data: subscriptions, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('subscription');

    if (error) throw error;
    if (!subscriptions || subscriptions.length === 0) {
        return NextResponse.json({ success: true, message: 'No devices registered yet.' });
    }

    // 3. Package the payload
    const payload = JSON.stringify({ 
        title: title || "Embers of Light", 
        body: body || "A new event has begun.", 
        url: url || "/dashboard" 
    });

    // 4. Fire the flare to all devices!
    const sendPromises = subscriptions.map((sub) =>
      webpush.sendNotification(sub.subscription, payload).catch((err) => {
        // If a user revokes permission on their phone, it will throw an error here.
        // In the future, we can add logic here to delete dead tokens!
        console.error('Failed to send to a specific device.', err);
      })
    );

    // Wait for all messages to be sent
    await Promise.all(sendPromises);

    return NextResponse.json({ 
        success: true, 
        message: `Flare fired successfully to ${subscriptions.length} devices!` 
    });

  } catch (error: any) {
    console.error('Broadcast Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}