import { NextResponse } from 'next/server';
import {
  createSupabaseServiceRoleClient,
  jsonError,
  requireAdminUser,
} from '@/utils/api/security';
import {
  endShowLiveSession,
  getCurrentLiveStatus,
  startShowLiveSession,
} from '@/utils/api/showLive';
import {
  getShowById,
  isPlatformSupportedForShow,
  isShowLivePlatform,
  type ShowLivePlatform,
} from '@/utils/showRegistry';

export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 2048;
const MAX_EXTERNAL_SESSION_ID_LENGTH = 160;

type ShowLiveAction = 'start' | 'end';

type JsonObjectResult =
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; error: string };

export async function GET() {
  const supabaseAdmin = createSupabaseServiceRoleClient();
  if (!supabaseAdmin.ok) return supabaseAdmin.response;

  const status = await getCurrentLiveStatus(supabaseAdmin.client);
  if (!status.ok) return jsonError(status.error, status.status);

  return NextResponse.json({
    success: true,
    live: status.activeSessions.length > 0,
    unavailable: status.unavailable,
    activeSessions: status.activeSessions,
  });
}

export async function POST(req: Request) {
  const auth = await requireAdminUser();
  if (!auth.ok) return auth.response;

  const body = await readBoundedJsonObject(req);
  if (!body.ok) return jsonError(body.error, 400);

  const action = parseAction(body.value.action);
  if (!action.ok) return jsonError(action.error, 400);

  const showId = parseRequiredString(body.value.showId, 'showId', 80);
  if (!showId.ok) return jsonError(showId.error, 400);

  const show = getShowById(showId.value);
  if (!show) return jsonError('Unknown show ID.', 400);

  const supabaseAdmin = createSupabaseServiceRoleClient();
  if (!supabaseAdmin.ok) return supabaseAdmin.response;

  if (action.value === 'end') {
    const result = await endShowLiveSession(supabaseAdmin.client, show);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error, code: result.code },
        { status: result.statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      action: 'end',
      status: result.status,
      session: result.session,
    });
  }

  const platform = parsePlatform(body.value.platform, 'manual');
  if (!platform.ok) return jsonError(platform.error, 400);

  if (!isPlatformSupportedForShow(show, platform.value)) {
    return jsonError('Platform is not registered for this show.', 400);
  }

  const externalSessionId = parseOptionalString(
    body.value.externalSessionId,
    'externalSessionId',
    MAX_EXTERNAL_SESSION_ID_LENGTH
  );
  if (!externalSessionId.ok) return jsonError(externalSessionId.error, 400);

  const result = await startShowLiveSession(supabaseAdmin.client, {
    show,
    platform: platform.value,
    externalSessionId: externalSessionId.value,
    createdBy: auth.profile.id,
  });

  if (!result.ok) {
    return NextResponse.json(
      { success: false, error: result.error, code: result.code },
      { status: result.statusCode }
    );
  }

  return NextResponse.json(
    {
      success: true,
      action: 'start',
      status: result.status,
      session: result.session,
      notification: result.notification,
    },
    { status: result.status === 'started' ? 201 : 200 }
  );
}

async function readBoundedJsonObject(req: Request): Promise<JsonObjectResult> {
  const length = req.headers.get('content-length');
  if (length && Number(length) > MAX_BODY_BYTES) {
    return { ok: false, error: 'Request body is too large.' };
  }

  let text = '';
  try {
    text = await req.text();
  } catch {
    return { ok: false, error: 'Request body must be valid JSON.' };
  }

  if (text.length > MAX_BODY_BYTES) {
    return { ok: false, error: 'Request body is too large.' };
  }

  try {
    const parsed: unknown = text ? JSON.parse(text) : {};
    if (!isPlainObject(parsed)) {
      return { ok: false, error: 'Request body must be a JSON object.' };
    }

    return { ok: true, value: parsed };
  } catch {
    return { ok: false, error: 'Request body must be valid JSON.' };
  }
}

function parseAction(value: unknown): { ok: true; value: ShowLiveAction } | { ok: false; error: string } {
  if (value !== 'start' && value !== 'end') {
    return { ok: false, error: 'action must be start or end.' };
  }

  return { ok: true, value };
}

function parsePlatform(
  value: unknown,
  fallback: ShowLivePlatform
): { ok: true; value: ShowLivePlatform } | { ok: false; error: string } {
  if (value === undefined || value === null || value === '') {
    return { ok: true, value: fallback };
  }

  if (typeof value !== 'string') {
    return { ok: false, error: 'platform must be a string.' };
  }

  const normalized = value.trim().toLowerCase();
  if (!isShowLivePlatform(normalized)) {
    return { ok: false, error: 'platform is not supported.' };
  }

  return { ok: true, value: normalized };
}

function parseRequiredString(
  value: unknown,
  fieldName: string,
  maxLength: number
): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof value !== 'string') {
    return { ok: false, error: `${fieldName} must be a string.` };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: false, error: `${fieldName} is required.` };
  }

  if (trimmed.length > maxLength) {
    return { ok: false, error: `${fieldName} must be ${maxLength} characters or fewer.` };
  }

  if (/[\u0000-\u001f\u007f]/.test(trimmed)) {
    return { ok: false, error: `${fieldName} contains invalid characters.` };
  }

  return { ok: true, value: trimmed };
}

function parseOptionalString(
  value: unknown,
  fieldName: string,
  maxLength: number
): { ok: true; value: string | null } | { ok: false; error: string } {
  if (value === undefined || value === null || value === '') {
    return { ok: true, value: null };
  }

  const parsed = parseRequiredString(value, fieldName, maxLength);
  if (!parsed.ok) return parsed;

  return { ok: true, value: parsed.value };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
