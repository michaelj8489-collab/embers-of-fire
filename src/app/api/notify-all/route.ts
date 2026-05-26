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
    const { title, body, url } = await req.json();

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get all subscriptions
    const { data: allSubs, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('subscription');

    if (error) throw error;
    if (!allSubs || allSubs.length === 0) return NextResponse.json({ success: true });

    // Send to everyone (This is a simplified broadcast)
    const payload = JSON.stringify({ title, body, url });
    await Promise.all(allSubs.map((sub) => 
        webpush.sendNotification(sub.subscription, payload).catch(() => null)
    ));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}