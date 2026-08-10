import { NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/utils/supabase/server';
import { createSupabaseServiceRoleClient } from '@/utils/api/security';

const ALLOWED_EVENTS = new Set([
  'page_view',
  'external_link_click',
  'live_opened',
  'membership_opened',
  'show_opened',
]);

const BLOCKED_PREFIXES = [
  '/api',
  '/auth',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/dashboard/admin',
];

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid analytics payload.' }, { status: 400 });
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ success: false, error: 'Invalid analytics payload.' }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const eventName = typeof input.eventName === 'string' ? input.eventName.trim() : '';
  const path = normalizePath(input.path);
  const visitorId = typeof input.visitorId === 'string' ? input.visitorId.trim() : '';
  const sessionId = typeof input.sessionId === 'string' ? input.sessionId.trim() : '';

  if (!ALLOWED_EVENTS.has(eventName) || !path || !UUID_PATTERN.test(visitorId) || !UUID_PATTERN.test(sessionId)) {
    return NextResponse.json({ success: false, error: 'Invalid analytics payload.' }, { status: 400 });
  }

  if (BLOCKED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return new NextResponse(null, { status: 204 });
  }

  const serviceRole = createSupabaseServiceRoleClient();
  if (!serviceRole.ok) return serviceRole.response;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const metadata = sanitizeMetadata(input.metadata);
  const { error } = await serviceRole.client.from('site_analytics_events').insert({
    event_name: eventName,
    path,
    visitor_id: visitorId,
    session_id: sessionId,
    user_id: user?.id ?? null,
    metadata,
  });

  if (error) {
    console.error('site-analytics: insert failed.', { code: error.code, message: error.message });
    return NextResponse.json({ success: false, error: 'Unable to record analytics event.' }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}

function normalizePath(value: unknown) {
  if (typeof value !== 'string') return null;
  const raw = value.trim();
  if (!raw.startsWith('/')) return null;

  const clean = raw.split('?')[0].split('#')[0];
  if (!clean || clean.length > 300) return null;
  return clean;
}

function sanitizeMetadata(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  const source = value as Record<string, unknown>;
  const allowedKeys = ['platform', 'target', 'showId', 'category'];
  const output: Record<string, string> = {};

  for (const key of allowedKeys) {
    const item = source[key];
    if (typeof item !== 'string') continue;
    const clean = item.trim().slice(0, 100);
    if (clean) output[key] = clean;
  }

  return output;
}
