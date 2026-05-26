import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

webpush.setVapidDetails(
  'mailto:admin@embersoflight.net',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  try {
    const { targetUserId, title, body, url } = await req.json();

    // 1. Initialize admin client to find the user's subscription
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 2. Find the device subscription for THIS specific user
    const { data: userSubs, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', targetUserId);

    if (error) throw error;
    if (!userSubs || userSubs.length === 0) {
        return NextResponse.json({ success: false, message: 'User has no registered devices.' });
    }

    // 3. Send to all devices owned by this user
    const payload = JSON.stringify({ title, body, url });
    const sendPromises = userSubs.map((sub) =>
      webpush.sendNotification(sub.subscription, payload).catch((err) => {
        console.error('Failed to send to device:', err);
      })
    );

    await Promise.all(sendPromises);

    return NextResponse.json({ success: true, message: 'Notification sent to user.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}