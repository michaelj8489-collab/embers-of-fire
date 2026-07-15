import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import webpush, { WebPushError, type PushSubscription } from 'web-push';
import { createClient as createSupabaseServerClient } from '@/utils/supabase/server';

export const STRIPE_API_VERSION = '2026-03-25.dahlia' as const;

export const CHECKOUT_TIERS = {
  'Keepers of the Embers': 500,
  'Flame Bearers': 1500,
  'Phoenix Circle': 3300,
  'Wings of the Phoenix': 7500,
  'Phoenix Ascending': 15000,
} as const;

const TIER_SLUGS: Record<string, TierName> = {
  'keepers-of-the-embers': 'Keepers of the Embers',
  'flame-bearers': 'Flame Bearers',
  'phoenix-circle': 'Phoenix Circle',
  'wings-of-the-phoenix': 'Wings of the Phoenix',
  'phoenix-ascending': 'Phoenix Ascending',
};

const MAX_TITLE_LENGTH = 120;
const MAX_NOTIFICATION_BODY_LENGTH = 500;
const MAX_BROADCAST_CONTENT_LENGTH = 1000;
const MAX_URL_LENGTH = 2048;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type TierName = keyof typeof CHECKOUT_TIERS;

type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export type NotificationPayload = {
  title: string;
  body: string;
  url: string;
  eventId?: string;
  tag?: string;
};

export type PushSubscriptionRow = {
  subscription: unknown;
};

export type PushDeliverySummary = {
  attempted: number;
  sent: number;
  failed: number;
  expiredRemoved: number;
  malformed: number;
};

type AdminAuthResult =
  | {
      ok: true;
      user: User;
      profile: {
        id: string;
        role: string | null;
      };
    }
  | { ok: false; response: NextResponse };

type SupabaseAdminResult =
  | { ok: true; client: SupabaseClient }
  | { ok: false; response: NextResponse };

export function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function getRequiredEnv(name: string): ValidationResult<string> {
  const value = process.env[name]?.trim();

  if (!value) {
    return { ok: false, error: `${name} is not configured.` };
  }

  return { ok: true, value };
}

export function createSupabaseServiceRoleClient(): SupabaseAdminResult {
  const url = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
  const serviceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');

  if (!url.ok || !serviceRoleKey.ok) {
    return {
      ok: false,
      response: jsonError('Server configuration is incomplete.', 500),
    };
  }

  return {
    ok: true,
    client: createSupabaseAdminClient(url.value, serviceRoleKey.value, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }),
  };
}

export async function requireAdminUser(): Promise<AdminAuthResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.warn('Admin authorization failed during user lookup.', {
      message: userError.message,
      status: userError.status,
    });
    return { ok: false, response: jsonError('Authentication required.', 401) };
  }

  if (!user) {
    return { ok: false, response: jsonError('Authentication required.', 401) };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('Admin authorization failed during profile lookup.', {
      code: profileError.code,
      message: profileError.message,
    });
    return {
      ok: false,
      response: jsonError('Unable to verify administrator permissions.', 500),
    };
  }

  if (!profile || profile.role !== 'admin') {
    return {
      ok: false,
      response: jsonError('Administrator access required.', 403),
    };
  }

  return {
    ok: true,
    user,
    profile: {
      id: profile.id,
      role: profile.role,
    },
  };
}

export async function readJsonObject(req: Request): Promise<ValidationResult<Record<string, unknown>>> {
  try {
    const parsed: unknown = await req.json();

    if (!isPlainObject(parsed)) {
      return { ok: false, error: 'Request body must be a JSON object.' };
    }

    return { ok: true, value: parsed };
  } catch {
    return { ok: false, error: 'Request body must be valid JSON.' };
  }
}

export function normalizeTierName(value: unknown): ValidationResult<TierName> {
  if (typeof value !== 'string') {
    return { ok: false, error: 'tierName must be a string.' };
  }

  const trimmed = value.trim();

  if (isTierName(trimmed)) {
    return { ok: true, value: trimmed };
  }

  const slugMatch = TIER_SLUGS[trimmed.toLowerCase()];
  if (slugMatch) {
    return { ok: true, value: slugMatch };
  }

  return { ok: false, error: 'Invalid subscription tier.' };
}

export function normalizeTrustedAppUrl(): ValidationResult<string> {
  const appUrl = getRequiredEnv('APP_URL');

  if (!appUrl.ok) {
    return appUrl;
  }

  try {
    const parsed = new URL(appUrl.value);

    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return { ok: false, error: 'APP_URL must use http or https.' };
    }

    if (parsed.username || parsed.password) {
      return { ok: false, error: 'APP_URL must not include credentials.' };
    }

    parsed.hash = '';
    parsed.search = '';

    return { ok: true, value: parsed.toString().replace(/\/+$/, '') };
  } catch {
    return { ok: false, error: 'APP_URL must be a valid URL.' };
  }
}

export function validateTargetUserId(value: unknown): ValidationResult<string> {
  if (typeof value !== 'string') {
    return { ok: false, error: 'targetUserId must be a string.' };
  }

  const trimmed = value.trim();

  if (!UUID_PATTERN.test(trimmed)) {
    return { ok: false, error: 'targetUserId must be a valid user ID.' };
  }

  return { ok: true, value: trimmed };
}

export function parseNotificationPayload(
  input: Record<string, unknown>,
  options?: {
    defaultTitle?: string;
    defaultBody?: string;
    defaultUrl?: string;
    allowContentField?: boolean;
    bodyMaxLength?: number;
  }
): ValidationResult<NotificationPayload> {
  const title = validateTextField(input.title, 'title', MAX_TITLE_LENGTH, options?.defaultTitle);
  if (!title.ok) return title;

  const bodyValue =
    input.body === undefined && options?.allowContentField ? input.content : input.body;
  const body = validateTextField(
    bodyValue,
    options?.allowContentField ? 'body or content' : 'body',
    options?.bodyMaxLength ?? MAX_NOTIFICATION_BODY_LENGTH,
    options?.defaultBody
  );
  if (!body.ok) return body;

  const url = validateNotificationUrl(input.url, options?.defaultUrl ?? '/dashboard');
  if (!url.ok) return url;

  return {
    ok: true,
    value: {
      title: title.value,
      body: body.value,
      url: url.value,
    },
  };
}

export function parseBroadcastPayload(input: Record<string, unknown>) {
  return parseNotificationPayload(input, {
    defaultTitle: 'Embers of Light',
    defaultBody: 'A new event has begun.',
    defaultUrl: '/dashboard',
    allowContentField: true,
    bodyMaxLength: MAX_BROADCAST_CONTENT_LENGTH,
  });
}

export function configureWebPush(): ValidationResult<void> {
  const publicKey = getRequiredEnv('NEXT_PUBLIC_VAPID_PUBLIC_KEY');
  const privateKey = getRequiredEnv('VAPID_PRIVATE_KEY');

  if (!publicKey.ok || !privateKey.ok) {
    return { ok: false, error: 'Push notification service is not configured.' };
  }

  webpush.setVapidDetails('mailto:admin@embersoflight.net', publicKey.value, privateKey.value);
  return { ok: true, value: undefined };
}

export async function sendPushNotifications(
  supabaseAdmin: SupabaseClient,
  rows: PushSubscriptionRow[],
  payload: NotificationPayload,
  logContext: string
): Promise<PushDeliverySummary> {
  const summary: PushDeliverySummary = {
    attempted: rows.length,
    sent: 0,
    failed: 0,
    expiredRemoved: 0,
    malformed: 0,
  };

  const serializedPayload = JSON.stringify(payload);

  await Promise.all(
    rows.map(async (row) => {
      const subscription = toPushSubscription(row.subscription);

      if (!subscription) {
        summary.malformed += 1;
        console.warn(`${logContext}: skipped malformed push subscription.`);
        return;
      }

      try {
        await webpush.sendNotification(subscription, serializedPayload);
        summary.sent += 1;
      } catch (error: unknown) {
        summary.failed += 1;
        const statusCode = error instanceof WebPushError ? error.statusCode : null;
        const expired = statusCode === 404 || statusCode === 410;

        console.warn(`${logContext}: push delivery failed.`, {
          statusCode,
          expired,
          errorName: error instanceof Error ? error.name : 'UnknownError',
        });

        if (expired) {
          const removed = await removeExpiredPushSubscription(
            supabaseAdmin,
            subscription.endpoint,
            logContext
          );

          if (removed) {
            summary.expiredRemoved += 1;
          }
        }
      }
    })
  );

  return summary;
}

function validateTextField(
  value: unknown,
  fieldName: string,
  maxLength: number,
  defaultValue?: string
): ValidationResult<string> {
  if (value === undefined || value === null || value === '') {
    if (defaultValue !== undefined) {
      return { ok: true, value: defaultValue };
    }

    return { ok: false, error: `${fieldName} is required.` };
  }

  if (typeof value !== 'string') {
    return { ok: false, error: `${fieldName} must be a string.` };
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return { ok: false, error: `${fieldName} cannot be empty.` };
  }

  if (trimmed.length > maxLength) {
    return { ok: false, error: `${fieldName} must be ${maxLength} characters or fewer.` };
  }

  return { ok: true, value: trimmed };
}

function validateNotificationUrl(value: unknown, defaultUrl: string): ValidationResult<string> {
  if (value === undefined || value === null || value === '') {
    return { ok: true, value: defaultUrl };
  }

  if (typeof value !== 'string') {
    return { ok: false, error: 'url must be a string.' };
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return { ok: true, value: defaultUrl };
  }

  if (trimmed.length > MAX_URL_LENGTH) {
    return { ok: false, error: `url must be ${MAX_URL_LENGTH} characters or fewer.` };
  }

  if (/[\u0000-\u001f\u007f]/.test(trimmed)) {
    return { ok: false, error: 'url contains invalid characters.' };
  }

  if (trimmed.startsWith('/')) {
    if (trimmed.startsWith('//') || trimmed.includes('\\')) {
      return { ok: false, error: 'url must be a safe relative path.' };
    }

    return { ok: true, value: trimmed };
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return { ok: false, error: 'url must use http or https.' };
    }

    if (parsed.username || parsed.password) {
      return { ok: false, error: 'url must not include credentials.' };
    }

    return { ok: true, value: parsed.toString() };
  } catch {
    return { ok: false, error: 'url must be a valid URL or relative path.' };
  }
}

export function toPushSubscription(value: unknown): PushSubscription | null {
  if (!isPlainObject(value)) {
    return null;
  }

  const { endpoint, keys } = value;

  if (typeof endpoint !== 'string' || !isPlainObject(keys)) {
    return null;
  }

  const { p256dh, auth } = keys;

  if (typeof p256dh !== 'string' || typeof auth !== 'string') {
    return null;
  }

  return {
    endpoint,
    keys: {
      p256dh,
      auth,
    },
  };
}

export async function removeExpiredPushSubscription(
  supabaseAdmin: SupabaseClient,
  endpoint: string,
  logContext: string
) {
  const { error } = await supabaseAdmin
    .from('push_subscriptions')
    .delete()
    .eq('subscription->>endpoint', endpoint);

  if (error) {
    console.error(`${logContext}: failed to remove expired push subscription.`, {
      code: error.code,
      message: error.message,
    });
    return false;
  }

  return true;
}

function isTierName(value: string): value is TierName {
  return Object.hasOwn(CHECKOUT_TIERS, value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
