import type { SupabaseClient } from '@supabase/supabase-js';
import {
  configureWebPush,
  sendPushNotifications,
  type NotificationPayload,
  type PushDeliverySummary,
  type PushSubscriptionRow,
} from '@/utils/api/security';
import { getShowById, type ShowDefinition, type ShowLivePlatform } from '@/utils/showRegistry';

export const SHOW_LIVE_STORAGE_ERROR_CODE = 'SHOW_LIVE_SESSION_STORAGE_REQUIRED';

const SHOW_LIVE_TABLE = 'show_live_sessions';
const STORAGE_MISSING_CODES = new Set(['42P01', 'PGRST116', 'PGRST205']);

type SupabaseErrorLike = {
  code?: string;
  message?: string;
};

type ShowLiveSessionRow = {
  id: string;
  show_id: string;
  platform: ShowLivePlatform;
  external_session_id: string | null;
  started_at: string;
  ended_at: string | null;
  created_by: string | null;
  notification_event_id: string | null;
  notification_attempted_at: string | null;
  notification_sent_at: string | null;
  notification_summary: PushDeliverySummary | null;
  notification_last_error: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicLiveShowSession = {
  id: string;
  showId: string;
  showName: string;
  showHref: string;
  platform: ShowLivePlatform;
  twitchChannel: string | null;
  startedAt: string;
  notificationEventId: string | null;
};

export type LiveStatusResult =
  | { ok: true; unavailable: false; activeSessions: PublicLiveShowSession[] }
  | { ok: true; unavailable: true; activeSessions: [] }
  | { ok: false; status: number; error: string; code?: string };

export type StartShowLiveSessionInput = {
  show: ShowDefinition;
  platform: ShowLivePlatform;
  externalSessionId: string | null;
  createdBy: string;
  notificationRecipientUserId?: string;
};

export type StartShowLiveSessionResult =
  | {
      ok: true;
      status: 'started' | 'already-active';
      session: PublicLiveShowSession;
      notification: LiveNotificationResult | null;
    }
  | { ok: false; statusCode: number; error: string; code?: string };

export type EndShowLiveSessionResult =
  | {
      ok: true;
      status: 'ended' | 'not-active';
      session: PublicLiveShowSession | null;
    }
  | { ok: false; statusCode: number; error: string; code?: string };

type LiveNotificationResult =
  | {
      attempted: true;
      configured: true;
      recipientScope: LiveNotificationRecipientScope;
      summary: PushDeliverySummary;
      eventId: string;
      recordUpdated: boolean;
    }
  | {
      attempted: false;
      configured: false;
      recipientScope: LiveNotificationRecipientScope;
      error: string;
      eventId: string;
      recordUpdated: boolean;
    }
  | {
      attempted: false;
      configured: true;
      recipientScope: LiveNotificationRecipientScope;
      summary: PushDeliverySummary;
      eventId: string;
      recordUpdated: boolean;
    };

type LiveNotificationRecipientScope = 'all-subscribers' | 'authenticated-admin';

export async function getCurrentLiveStatus(
  supabaseAdmin: SupabaseClient
): Promise<LiveStatusResult> {
  const { data, error } = await supabaseAdmin
    .from(SHOW_LIVE_TABLE)
    .select(SESSION_COLUMNS)
    .is('ended_at', null)
    .order('started_at', { ascending: false });

  if (error) {
    if (isShowLiveStorageMissing(error)) {
      return { ok: true, unavailable: true, activeSessions: [] };
    }

    console.error('show-live: failed to load live status.', {
      code: error.code,
      message: error.message,
    });
    return { ok: false, status: 500, error: 'Unable to load live status.' };
  }

  return {
    ok: true,
    unavailable: false,
    activeSessions: toPublicSessions((data ?? []) as ShowLiveSessionRow[]),
  };
}

export async function startShowLiveSession(
  supabaseAdmin: SupabaseClient,
  input: StartShowLiveSessionInput
): Promise<StartShowLiveSessionResult> {
  const activeSession = await loadActiveSession(supabaseAdmin, input.show.id);
  if (!activeSession.ok) return activeSession;

  if (activeSession.session) {
    return {
      ok: true,
      status: 'already-active',
      session: toPublicSession(activeSession.session, input.show),
      notification: null,
    };
  }

  const { data, error } = await supabaseAdmin
    .from(SHOW_LIVE_TABLE)
    .insert({
      show_id: input.show.id,
      platform: input.platform,
      external_session_id: input.externalSessionId,
      created_by: input.createdBy,
    })
    .select(SESSION_COLUMNS)
    .single();

  if (error) {
    if (isUniqueViolation(error)) {
      const raceSession = await loadActiveSession(supabaseAdmin, input.show.id);
      if (!raceSession.ok) return raceSession;

      if (raceSession.session) {
        return {
          ok: true,
          status: 'already-active',
          session: toPublicSession(raceSession.session, input.show),
          notification: null,
        };
      }
    }

    if (isShowLiveStorageMissing(error)) {
      return storageUnavailableResult();
    }

    console.error('show-live: failed to create live session.', {
      code: error.code,
      message: error.message,
      showId: input.show.id,
      platform: input.platform,
    });
    return { ok: false, statusCode: 500, error: 'Unable to start live session.' };
  }

  const session = data as ShowLiveSessionRow;
  const notification = await notifyLiveSessionStarted(supabaseAdmin, session, input.show, {
    recipientUserId: input.notificationRecipientUserId,
  });

  return {
    ok: true,
    status: 'started',
    session: toPublicSession(session, input.show),
    notification,
  };
}

export async function endShowLiveSession(
  supabaseAdmin: SupabaseClient,
  show: ShowDefinition
): Promise<EndShowLiveSessionResult> {
  const activeSession = await loadActiveSession(supabaseAdmin, show.id);
  if (!activeSession.ok) return activeSession;

  if (!activeSession.session) {
    return { ok: true, status: 'not-active', session: null };
  }

  const endedAt = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from(SHOW_LIVE_TABLE)
    .update({ ended_at: endedAt })
    .eq('id', activeSession.session.id)
    .is('ended_at', null)
    .select(SESSION_COLUMNS)
    .maybeSingle();

  if (error) {
    if (isShowLiveStorageMissing(error)) {
      return storageUnavailableResult();
    }

    console.error('show-live: failed to end live session.', {
      code: error.code,
      message: error.message,
      showId: show.id,
    });
    return { ok: false, statusCode: 500, error: 'Unable to end live session.' };
  }

  return {
    ok: true,
    status: data ? 'ended' : 'not-active',
    session: data ? toPublicSession(data as ShowLiveSessionRow, show) : null,
  };
}

async function loadActiveSession(
  supabaseAdmin: SupabaseClient,
  showId: string
): Promise<
  | { ok: true; session: ShowLiveSessionRow | null }
  | { ok: false; statusCode: number; error: string; code?: string }
> {
  const { data, error } = await supabaseAdmin
    .from(SHOW_LIVE_TABLE)
    .select(SESSION_COLUMNS)
    .eq('show_id', showId)
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isShowLiveStorageMissing(error)) {
      return storageUnavailableResult();
    }

    console.error('show-live: failed to load active session.', {
      code: error.code,
      message: error.message,
      showId,
    });
    return { ok: false, statusCode: 500, error: 'Unable to load live session.' };
  }

  return { ok: true, session: data ? (data as ShowLiveSessionRow) : null };
}

async function notifyLiveSessionStarted(
  supabaseAdmin: SupabaseClient,
  session: ShowLiveSessionRow,
  show: ShowDefinition,
  options: {
    recipientUserId?: string;
  }
): Promise<LiveNotificationResult> {
  const eventId = `show-live:${session.id}`;
  const recipientScope: LiveNotificationRecipientScope = options.recipientUserId
    ? 'authenticated-admin'
    : 'all-subscribers';
  const configured = configureWebPush();

  if (!configured.ok) {
    console.warn('show-live: push notification service is not configured for live starts.');
    const recordUpdated = await recordNotificationAttempt(supabaseAdmin, session.id, {
      eventId,
      summary: null,
      sentAt: null,
      lastError: configured.error,
    });

    return {
      attempted: false,
      configured: false,
      recipientScope,
      error: configured.error,
      eventId,
      recordUpdated,
    };
  }

  let subscriptionQuery = supabaseAdmin
    .from('push_subscriptions')
    .select('subscription');

  if (options.recipientUserId) {
    subscriptionQuery = subscriptionQuery.eq('user_id', options.recipientUserId);
  }

  const { data: subscriptions, error } = await subscriptionQuery;

  if (error) {
    console.error('show-live: failed to load push subscriptions.', {
      code: error.code,
      message: error.message,
    });
    const recordUpdated = await recordNotificationAttempt(supabaseAdmin, session.id, {
      eventId,
      summary: null,
      sentAt: null,
      lastError: 'Unable to load notification recipients.',
    });

    return {
      attempted: false,
      configured: true,
      recipientScope,
      summary: emptyDeliverySummary(),
      eventId,
      recordUpdated,
    };
  }

  const rows = (subscriptions ?? []) as PushSubscriptionRow[];
  const payload: NotificationPayload = {
    title: show.notification.title,
    body: show.notification.body,
    icon: show.notification.iconPath,
    image: show.imagePath,
    url: show.notification.url,
    eventId,
    tag: eventId,
  };

  if (rows.length === 0) {
    const summary = emptyDeliverySummary();
    const recordUpdated = await recordNotificationAttempt(supabaseAdmin, session.id, {
      eventId,
      summary,
      sentAt: null,
      lastError: null,
    });

    return {
      attempted: false,
      configured: true,
      recipientScope,
      summary,
      eventId,
      recordUpdated,
    };
  }

  const summary = await sendPushNotifications(supabaseAdmin, rows, payload, 'show-live');
  const recordUpdated = await recordNotificationAttempt(supabaseAdmin, session.id, {
    eventId,
    summary,
    sentAt: summary.sent > 0 ? new Date().toISOString() : null,
    lastError: summary.failed > 0 ? 'Some live-start notifications failed.' : null,
  });

  return {
    attempted: true,
    configured: true,
    recipientScope,
    summary,
    eventId,
    recordUpdated,
  };
}

async function recordNotificationAttempt(
  supabaseAdmin: SupabaseClient,
  sessionId: string,
  params: {
    eventId: string;
    summary: PushDeliverySummary | null;
    sentAt: string | null;
    lastError: string | null;
  }
): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from(SHOW_LIVE_TABLE)
    .update({
      notification_event_id: params.eventId,
      notification_attempted_at: new Date().toISOString(),
      notification_sent_at: params.sentAt,
      notification_summary: params.summary,
      notification_last_error: params.lastError,
    })
    .eq('id', sessionId);

  if (error) {
    console.error('show-live: failed to record notification attempt.', {
      code: error.code,
      message: error.message,
      sessionId,
    });
    return false;
  }

  return true;
}

function toPublicSessions(rows: ShowLiveSessionRow[]): PublicLiveShowSession[] {
  return rows
    .map((row) => {
      const show = getShowById(row.show_id);
      return show ? toPublicSession(row, show) : null;
    })
    .filter((session): session is PublicLiveShowSession => session !== null);
}

function toPublicSession(
  row: ShowLiveSessionRow,
  show: ShowDefinition
): PublicLiveShowSession {
  return {
    id: row.id,
    showId: row.show_id,
    showName: show.name,
    showHref: show.href,
    platform: row.platform,
    twitchChannel: show.twitchChannel ?? null,
    startedAt: row.started_at,
    notificationEventId: row.notification_event_id,
  };
}

function isShowLiveStorageMissing(error: SupabaseErrorLike): boolean {
  return (
    (typeof error.code === 'string' && STORAGE_MISSING_CODES.has(error.code)) ||
    Boolean(error.message?.includes(SHOW_LIVE_TABLE))
  );
}

function isUniqueViolation(error: SupabaseErrorLike): boolean {
  return error.code === '23505';
}

function storageUnavailableResult(): {
  ok: false;
  statusCode: 503;
  error: string;
  code: typeof SHOW_LIVE_STORAGE_ERROR_CODE;
} {
  return {
    ok: false,
    statusCode: 503,
    error: 'Live-session storage is not configured.',
    code: SHOW_LIVE_STORAGE_ERROR_CODE,
  };
}

function emptyDeliverySummary(): PushDeliverySummary {
  return {
    attempted: 0,
    sent: 0,
    failed: 0,
    expiredRemoved: 0,
    malformed: 0,
  };
}

const SESSION_COLUMNS =
  'id, show_id, platform, external_session_id, started_at, ended_at, created_by, notification_event_id, notification_attempted_at, notification_sent_at, notification_summary, notification_last_error, created_at, updated_at';
