import { NextResponse } from 'next/server';
import {
  configureWebPush,
  createSupabaseServiceRoleClient,
  jsonError,
  parseNotificationPayload,
  readJsonObject,
  requireAdminUser,
  sendPushNotifications,
  type PushSubscriptionRow,
} from '@/utils/api/security';

export async function POST(req: Request) {
  const auth = await requireAdminUser();
  if (!auth.ok) return auth.response;

  const body = await readJsonObject(req);
  if (!body.ok) return jsonError(body.error, 400);

  const payload = parseNotificationPayload(body.value);
  if (!payload.ok) return jsonError(payload.error, 400);

  const pushConfig = configureWebPush();
  if (!pushConfig.ok) return jsonError(pushConfig.error, 500);

  const supabaseAdmin = createSupabaseServiceRoleClient();
  if (!supabaseAdmin.ok) return supabaseAdmin.response;

  try {
    const { data: subscriptions, error } = await supabaseAdmin.client
      .from('push_subscriptions')
      .select('subscription');

    if (error) {
      console.error('notify-all: failed to fetch push subscriptions.', {
        code: error.code,
        message: error.message,
      });
      return jsonError('Unable to load notification recipients.', 500);
    }

    const rows = (subscriptions ?? []) as PushSubscriptionRow[];

    if (rows.length === 0) {
      return NextResponse.json({ success: true, sent: 0 });
    }

    const summary = await sendPushNotifications(
      supabaseAdmin.client,
      rows,
      payload.value,
      'notify-all'
    );

    return NextResponse.json({ success: true, ...summary });
  } catch (error: unknown) {
    console.error('notify-all: unexpected notification failure.', {
      errorName: error instanceof Error ? error.name : 'UnknownError',
    });
    return jsonError('Unable to send notifications.', 500);
  }
}
