import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import webpush, { WebPushError } from 'web-push';
import { createClient } from '@/utils/supabase/server';
import {
  configureWebPush,
  createSupabaseServiceRoleClient,
  jsonError,
  removeExpiredPushSubscription,
  toPushSubscription,
  type NotificationPayload,
  type PushDeliverySummary,
  type PushSubscriptionRow,
} from '@/utils/api/security';
import {
  normalizeUsernameForLookup,
  parseMentionTokens,
} from '@/utils/usernamePolicy';

type ChatMessageRow = {
  id: string;
  content: string | null;
  image_url: string | null;
  created_at: string | null;
  user_id: string | null;
  room_name: string | null;
  parent_id: string | null;
  recipient_id: string | null;
};

type ProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  role: string | null;
};

type RecipientSubscriptionRow = PushSubscriptionRow & {
  user_id: string;
};

type DeliveryPurpose = 'whisper' | 'mention' | 'all';
type DeliveryStatus = 'pending' | 'sent' | 'failed' | 'expired';

type RecipientPayload = {
  userId: string;
  purpose: DeliveryPurpose;
  title: string;
  body: string;
  url: string;
  eventId: string;
};

type DeliveryIdentity = {
  messageId: string;
  recipientId: string;
  purpose: DeliveryPurpose;
  endpoint: string;
};

type ChatPushDeliveryRow = {
  id: string;
  status: DeliveryStatus;
  attempts: number;
};

type ChatPushDeliverySummary = PushDeliverySummary & {
  claimed: number;
  skipped: number;
  retried: number;
  staleReclaimed: number;
  maxAttemptSkipped: number;
  finalizationFailed: number;
};

const CHAT_ROOMS: Record<string, string> = {
  global: 'Global Sanctuary',
  'smule-joins': 'Smule Joins (OC)',
  'group-songs': 'Group Songs',
  'voices-on-the-rise': 'Voices on the Rise',
  'brindles-vision': "Brindle's Vision",
  'honkytonk-heaven': 'Honkytonk Heaven',
  'defining-your-character': 'Defining Your Character',
  'mystic-mist': 'Mystic Mist',
  'admin-chat': 'Rise Admin Chat',
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;
const MAX_BODY_BYTES = 4096;
const MAX_MESSAGE_AGE_MS = 10 * 60 * 1000;
const MAX_FUTURE_SKEW_MS = 2 * 60 * 1000;
const MAX_MESSAGE_CONTENT_SCAN_CHARS = 4096;
const MAX_MENTION_CANDIDATES = 25;
const MAX_MENTION_QUERY_ROWS = 250;
const MAX_RECIPIENTS = 250;
const MAX_DELIVERY_ATTEMPTS = 3;
const STALE_PENDING_DELIVERY_MS = 5 * 60 * 1000;
const MAX_SANITIZE_SOURCE_CHARS = 2048;
const PREVIEW_LENGTH = 96;
const TITLE_LENGTH = 80;
const DANGEROUS_UNICODE_FORMAT_CONTROLS = /[\u202a-\u202e\u2066-\u2069\u200b\u2060\ufeff]/g;

export async function POST(req: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth.ok) return auth.response;

  const body = await readChatPushJsonObject(req);
  if (!body.ok) return jsonError(body.error, body.status);

  const messageId = validateMessageId(body.value.messageId);
  if (!messageId.ok) return jsonError(messageId.error, 400);

  const supabaseAdmin = createSupabaseServiceRoleClient();
  if (!supabaseAdmin.ok) return supabaseAdmin.response;

  const message = await fetchChatMessage(supabaseAdmin.client, messageId.value);
  if (!message.ok) return message.response;

  if (message.value.user_id !== auth.userId) {
    return jsonError('Unable to dispatch notifications for this message.', 403);
  }

  const timestamp = validateMessageTimestamp(message.value.created_at);
  if (!timestamp.ok) return jsonError(timestamp.error, timestamp.status);

  const senderProfile = await fetchProfile(supabaseAdmin.client, auth.userId);
  if (!senderProfile.ok) return senderProfile.response;

  const roomName = message.value.room_name ?? 'global';
  if (!CHAT_ROOMS[roomName]) {
    return jsonError('Message room is invalid.', 400);
  }

  if (isBotResponse(message.value.content)) {
    return NextResponse.json({ success: true, recipients: 0, sent: 0 });
  }

  if (roomName === 'admin-chat' && senderProfile.value.role !== 'admin') {
    return NextResponse.json({ success: true, recipients: 0, sent: 0 });
  }

  const recipients = await deriveRecipients(
    supabaseAdmin.client,
    message.value,
    senderProfile.value
  );
  if (!recipients.ok) return recipients.response;

  if (recipients.value.length === 0) {
    return NextResponse.json({ success: true, recipients: 0, sent: 0 });
  }

  const subscriptions = await fetchRecipientSubscriptions(
    supabaseAdmin.client,
    recipients.value.map((recipient) => recipient.userId)
  );
  if (!subscriptions.ok) return subscriptions.response;

  if (subscriptions.value.size === 0) {
    return NextResponse.json({
      success: true,
      recipients: recipients.value.length,
      sent: 0,
    });
  }

  const deliveryStorage = await ensureDeliveryStorageAvailable(supabaseAdmin.client);
  if (!deliveryStorage.ok) return deliveryStorage.response;

  const pushConfig = configureWebPush();
  if (!pushConfig.ok) return jsonError(pushConfig.error, 500);

  const summary = await sendRecipientNotifications(
    supabaseAdmin.client,
    message.value.id,
    recipients.value,
    subscriptions.value
  );
  if (!summary.ok) return summary.response;

  return NextResponse.json({
    success: true,
    recipients: recipients.value.length,
    ...summary.value,
  });
}

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.warn('chat-push: failed to authenticate user.', {
      message: error.message,
      status: error.status,
    });
    return { ok: false as const, response: jsonError('Authentication required.', 401) };
  }

  if (!user) {
    return { ok: false as const, response: jsonError('Authentication required.', 401) };
  }

  return { ok: true as const, userId: user.id };
}

async function readChatPushJsonObject(req: Request) {
  const contentType = req.headers.get('content-type');
  if (contentType && !contentType.toLowerCase().includes('application/json')) {
    return { ok: false as const, error: 'Request body must be valid JSON.', status: 400 };
  }

  const declaredLength = req.headers.get('content-length');
  if (declaredLength) {
    const parsedLength = Number.parseInt(declaredLength, 10);
    if (!Number.isFinite(parsedLength) || parsedLength < 0) {
      return { ok: false as const, error: 'Request body is invalid.', status: 400 };
    }

    if (parsedLength > MAX_BODY_BYTES) {
      return { ok: false as const, error: 'Request body is too large.', status: 413 };
    }
  }

  const reader = req.body?.getReader();
  if (!reader) {
    return { ok: false as const, error: 'Request body must be valid JSON.', status: 400 };
  }

  const decoder = new TextDecoder();
  let receivedBytes = 0;
  let text = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      receivedBytes += value.byteLength;
      if (receivedBytes > MAX_BODY_BYTES) {
        await reader.cancel();
        return { ok: false as const, error: 'Request body is too large.', status: 413 };
      }

      text += decoder.decode(value, { stream: true });
    }

    text += decoder.decode();
  } catch {
    return { ok: false as const, error: 'Request body must be valid JSON.', status: 400 };
  }

  try {
    const parsed: unknown = JSON.parse(text);
    if (!isPlainObject(parsed)) {
      return { ok: false as const, error: 'Request body must be a JSON object.', status: 400 };
    }

    const keys = Object.keys(parsed);
    if (keys.length !== 1 || !Object.hasOwn(parsed, 'messageId')) {
      return { ok: false as const, error: 'Request body fields are invalid.', status: 400 };
    }

    return { ok: true as const, value: parsed };
  } catch {
    return { ok: false as const, error: 'Request body must be valid JSON.', status: 400 };
  }
}

async function fetchChatMessage(supabaseAdmin: SupabaseClient, messageId: string) {
  const { data, error } = await supabaseAdmin
    .from('chat_messages')
    .select('id, content, image_url, created_at, user_id, room_name, parent_id, recipient_id')
    .eq('id', messageId)
    .maybeSingle();

  if (error) {
    console.error('chat-push: failed to load chat message.', {
      code: error.code,
      message: error.message,
    });
    return { ok: false as const, response: jsonError('Unable to load message.', 500) };
  }

  if (!data) {
    return { ok: false as const, response: jsonError('Message not found.', 404) };
  }

  return { ok: true as const, value: data as ChatMessageRow };
}

async function fetchProfile(supabaseAdmin: SupabaseClient, userId: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, username, full_name, role')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('chat-push: failed to load profile.', {
      code: error.code,
      message: error.message,
    });
    return { ok: false as const, response: jsonError('Unable to load sender profile.', 500) };
  }

  if (!data) {
    return { ok: false as const, response: jsonError('Sender profile not found.', 404) };
  }

  return { ok: true as const, value: data as ProfileRow };
}

async function deriveRecipients(
  supabaseAdmin: SupabaseClient,
  message: ChatMessageRow,
  senderProfile: ProfileRow
) {
  if (!message.user_id) {
    return { ok: true as const, value: [] };
  }

  const senderName = safeDisplayName(senderProfile);
  const roomName = message.room_name ?? 'global';
  const roomLabel = CHAT_ROOMS[roomName] ?? 'Chat';

  if (message.recipient_id) {
    if (message.recipient_id === message.user_id) {
      return { ok: true as const, value: [] };
    }

    const recipient = await fetchProfile(supabaseAdmin, message.recipient_id);
    if (!recipient.ok) return recipient;

    return {
      ok: true as const,
      value: [
        {
          userId: recipient.value.id,
          purpose: 'whisper' as const,
          title: truncateText(`New whisper from ${senderName}`, TITLE_LENGTH),
          body: privateMessageBody(message),
          url: senderProfile.username
            ? `/chat?whisper=${encodeURIComponent(senderProfile.username)}`
            : '/chat',
          eventId: `chat:${message.id}:${recipient.value.id}:whisper`,
        },
      ],
    };
  }

  const mentions = parseMentions(message.content);
  const hasAllMention = mentions.some((mention) => mention === 'all');
  const directMentions = mentions.filter((mention) => mention !== 'all');
  const isAdminBroadcast = hasAllMention && senderProfile.role === 'admin';

  if (isAdminBroadcast) {
    const broadcastRecipients = await fetchBroadcastRecipients(supabaseAdmin, message.user_id);
    if (!broadcastRecipients.ok) return broadcastRecipients;

    return {
      ok: true as const,
      value: broadcastRecipients.value.map((userId) => ({
        userId,
        purpose: 'all' as const,
        title: truncateText(`Announcement from ${senderName}`, TITLE_LENGTH),
        body: publicMessageBody(message, `Announcement in ${roomLabel}`),
        url: `/chat?room=${encodeURIComponent(roomName)}`,
        eventId: `chat:${message.id}:${userId}:all`,
      })),
    };
  }

  if (directMentions.length === 0) {
    return { ok: true as const, value: [] };
  }

  const mentionedProfiles = await fetchMentionedProfiles(supabaseAdmin, directMentions);
  if (!mentionedProfiles.ok) return mentionedProfiles;

  const recipients = new Map<string, RecipientPayload>();
  for (const profile of mentionedProfiles.value) {
    if (profile.id === message.user_id || recipients.has(profile.id)) {
      continue;
    }

    if (recipients.size >= MAX_RECIPIENTS) {
      break;
    }

    recipients.set(profile.id, {
      userId: profile.id,
      purpose: 'mention',
      title: truncateText(`You were mentioned by ${senderName}`, TITLE_LENGTH),
      body: publicMessageBody(message, `You were mentioned in ${roomLabel}`),
      url: `/chat?room=${encodeURIComponent(roomName)}`,
      eventId: `chat:${message.id}:${profile.id}:mention`,
    });
  }

  return { ok: true as const, value: Array.from(recipients.values()) };
}

async function fetchMentionedProfiles(supabaseAdmin: SupabaseClient, mentions: string[]) {
  const uniqueMentions = Array.from(
    new Set(mentions.map((mention) => normalizeUsernameForLookup(mention)).filter(Boolean))
  ).slice(0, MAX_MENTION_CANDIDATES);

  if (uniqueMentions.length === 0) {
    return { ok: true as const, value: [] };
  }

  const filters = uniqueMentions.map((mention) => `username.ilike.${mention}`).join(',');
  const mentionSet = new Set(uniqueMentions);
  const profilesByMention = new Map<string, ProfileRow[]>();

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, username, full_name, role')
    .or(filters)
    .limit(MAX_MENTION_QUERY_ROWS);

  if (error) {
    console.error('chat-push: failed to resolve mentions.', {
      code: error.code,
      message: error.message,
    });
    return { ok: false as const, response: jsonError('Unable to resolve mentions.', 500) };
  }

  for (const profile of (data ?? []) as ProfileRow[]) {
    const username = normalizeUsernameForLookup(profile.username);
    if (username && mentionSet.has(username)) {
      profilesByMention.set(username, [...(profilesByMention.get(username) ?? []), profile]);
    }
  }

  const profiles: ProfileRow[] = [];
  for (const matches of profilesByMention.values()) {
    const uniqueMatches = Array.from(new Map(matches.map((profile) => [profile.id, profile])).values());
    if (uniqueMatches.length > 1) {
      console.warn('chat-push: skipped ambiguous normalized username mention.', {
        candidateCount: uniqueMatches.length,
      });
      continue;
    }

    const [profile] = uniqueMatches;
    if (profile) {
      profiles.push(profile);
    }
  }

  return { ok: true as const, value: profiles };
}

async function fetchBroadcastRecipients(supabaseAdmin: SupabaseClient, senderId: string) {
  const { data, error } = await supabaseAdmin
    .from('push_subscriptions')
    .select('user_id')
    .neq('user_id', senderId);

  if (error) {
    console.error('chat-push: failed to load broadcast recipients.', {
      code: error.code,
      message: error.message,
    });
    return { ok: false as const, response: jsonError('Unable to load recipients.', 500) };
  }

  const recipients = new Set<string>();
  for (const row of (data ?? []) as { user_id: string | null }[]) {
    if (row.user_id && recipients.size < MAX_RECIPIENTS) {
      recipients.add(row.user_id);
    }
  }

  return { ok: true as const, value: Array.from(recipients) };
}

async function fetchRecipientSubscriptions(
  supabaseAdmin: SupabaseClient,
  recipientIds: string[]
) {
  const uniqueRecipientIds = Array.from(new Set(recipientIds)).slice(0, MAX_RECIPIENTS);
  if (uniqueRecipientIds.length === 0) {
    return { ok: true as const, value: new Map<string, RecipientSubscriptionRow[]>() };
  }

  const { data, error } = await supabaseAdmin
    .from('push_subscriptions')
    .select('user_id, subscription')
    .in('user_id', uniqueRecipientIds);

  if (error) {
    console.error('chat-push: failed to load push subscriptions.', {
      code: error.code,
      message: error.message,
    });
    return { ok: false as const, response: jsonError('Unable to load recipients.', 500) };
  }

  const subscriptionsByUser = new Map<string, RecipientSubscriptionRow[]>();
  for (const row of (data ?? []) as RecipientSubscriptionRow[]) {
    if (!uniqueRecipientIds.includes(row.user_id)) {
      continue;
    }

    const rows = subscriptionsByUser.get(row.user_id) ?? [];
    rows.push(row);
    subscriptionsByUser.set(row.user_id, rows);
  }

  return { ok: true as const, value: subscriptionsByUser };
}

async function ensureDeliveryStorageAvailable(supabaseAdmin: SupabaseClient) {
  const { error } = await supabaseAdmin
    .from('chat_push_deliveries')
    .select('id', { head: true })
    .limit(1);

  if (!error) {
    return { ok: true as const };
  }

  if (isMissingDeliveryStorageError(error)) {
    console.error('chat-push: delivery storage is not configured.', { code: error.code });
    return {
      ok: false as const,
      response: jsonError('CHAT_PUSH_DELIVERY_STORAGE_REQUIRED', 500),
    };
  }

  console.error('chat-push: failed to verify delivery storage.', {
    code: error.code,
    message: error.message,
  });
  return {
    ok: false as const,
    response: jsonError('Unable to verify delivery storage.', 500),
  };
}

async function sendRecipientNotifications(
  supabaseAdmin: SupabaseClient,
  messageId: string,
  recipients: RecipientPayload[],
  subscriptionsByUser: Map<string, RecipientSubscriptionRow[]>
) {
  const total: ChatPushDeliverySummary = {
    attempted: 0,
    sent: 0,
    failed: 0,
    expiredRemoved: 0,
    malformed: 0,
    claimed: 0,
    skipped: 0,
    retried: 0,
    staleReclaimed: 0,
    maxAttemptSkipped: 0,
    finalizationFailed: 0,
  };

  for (const recipient of recipients) {
    const rows = subscriptionsByUser.get(recipient.userId) ?? [];
    if (rows.length === 0) {
      continue;
    }

    for (const row of rows) {
      const subscription = toPushSubscription(row.subscription);
      if (!subscription) {
        total.malformed += 1;
        console.warn('chat-push: skipped malformed push subscription.');
        continue;
      }

      const claim = await claimDelivery(supabaseAdmin, {
        messageId,
        recipientId: recipient.userId,
        purpose: recipient.purpose,
        endpoint: subscription.endpoint,
      });

      if (!claim.ok) return claim;

      if (claim.action === 'skip') {
        total.skipped += 1;
        if (claim.reason === 'max_attempts') total.maxAttemptSkipped += 1;
        continue;
      }

      total.claimed += 1;
      if (claim.retried) total.retried += 1;
      if (claim.staleReclaimed) total.staleReclaimed += 1;
      total.attempted += 1;

      const payload: NotificationPayload = {
        title: recipient.title,
        body: recipient.body,
        url: recipient.url,
        eventId: recipient.eventId,
        // Stable tag/eventId lets clients collapse duplicate display if a
        // provider success is retried after a delivery-finalization failure.
        tag: recipient.eventId,
      };

      const delivery = await sendSingleNotification(supabaseAdmin, subscription, payload);
      if (delivery.status === 'sent') {
        total.sent += 1;
      } else if (delivery.status === 'expired') {
        total.failed += 1;
        if (delivery.expiredRemoved) total.expiredRemoved += 1;
      } else {
        total.failed += 1;
      }

      const finalized = await finalizeDelivery(
        supabaseAdmin,
        claim.deliveryId,
        delivery.status,
        delivery.errorCategory
      );
      if (!finalized.ok) {
        total.finalizationFailed += 1;
      }
    }
  }

  return { ok: true as const, value: total };
}

async function claimDelivery(supabaseAdmin: SupabaseClient, identity: DeliveryIdentity) {
  const now = new Date().toISOString();
  // attempts counts successful claims to try provider delivery. A crash after
  // this claim may consume one attempt before the provider result is recorded.
  const { data, error } = await supabaseAdmin
    .from('chat_push_deliveries')
    .insert({
      message_id: identity.messageId,
      recipient_id: identity.recipientId,
      purpose: identity.purpose,
      endpoint: identity.endpoint,
      status: 'pending',
      attempts: 1,
      last_error: null,
      updated_at: now,
    })
    .select('id, status, attempts')
    .single();

  if (!error && data) {
    return {
      ok: true as const,
      action: 'send' as const,
      deliveryId: (data as ChatPushDeliveryRow).id,
      retried: false,
      staleReclaimed: false,
    };
  }

  if (error && isMissingDeliveryStorageError(error)) {
    console.error('chat-push: delivery storage is not configured.', { code: error.code });
    return {
      ok: false as const,
      response: jsonError('CHAT_PUSH_DELIVERY_STORAGE_REQUIRED', 500),
    };
  }

  if (!error || error.code !== '23505') {
    console.error('chat-push: failed to claim delivery.', {
      code: error?.code,
      message: error?.message,
    });
    return { ok: false as const, response: jsonError('Unable to claim delivery.', 500) };
  }

  const existing = await fetchExistingDelivery(supabaseAdmin, identity);
  if (!existing.ok) return existing;

  if (!existing.value) {
    return { ok: true as const, action: 'skip' as const, reason: 'raced' as const };
  }

  if (existing.value.status === 'sent') {
    return { ok: true as const, action: 'skip' as const, reason: 'sent' as const };
  }

  if (existing.value.status === 'pending') {
    if (existing.value.attempts >= MAX_DELIVERY_ATTEMPTS) {
      return { ok: true as const, action: 'skip' as const, reason: 'max_attempts' as const };
    }

    const staleClaim = await reclaimStalePendingDelivery(supabaseAdmin, identity, existing.value);
    if (!staleClaim.ok) return staleClaim;
    if (staleClaim.claimed) {
      console.warn('chat-push: reclaimed stale pending delivery.', {
        purpose: identity.purpose,
      });
      return {
        ok: true as const,
        action: 'send' as const,
        deliveryId: staleClaim.deliveryId,
        retried: true,
        staleReclaimed: true,
      };
    }

    return { ok: true as const, action: 'skip' as const, reason: 'pending' as const };
  }

  if (existing.value.status === 'expired') {
    return { ok: true as const, action: 'skip' as const, reason: 'expired' as const };
  }

  if (existing.value.attempts >= MAX_DELIVERY_ATTEMPTS) {
    return { ok: true as const, action: 'skip' as const, reason: 'max_attempts' as const };
  }

  const retryAttempts = existing.value.attempts + 1;
  const retryClaim = await supabaseAdmin
    .from('chat_push_deliveries')
    .update({
      status: 'pending',
      attempts: retryAttempts,
      last_error: null,
      updated_at: now,
    })
    .eq('id', existing.value.id)
    .eq('status', 'failed')
    .lt('attempts', MAX_DELIVERY_ATTEMPTS)
    .select('id, status, attempts')
    .maybeSingle();

  if (retryClaim.error) {
    console.error('chat-push: failed to claim retry delivery.', {
      code: retryClaim.error.code,
      message: retryClaim.error.message,
    });
    return { ok: false as const, response: jsonError('Unable to claim delivery.', 500) };
  }

  if (!retryClaim.data) {
    return { ok: true as const, action: 'skip' as const, reason: 'pending' as const };
  }

  return {
    ok: true as const,
    action: 'send' as const,
    deliveryId: (retryClaim.data as ChatPushDeliveryRow).id,
    retried: true,
    staleReclaimed: false,
  };
}

async function reclaimStalePendingDelivery(
  supabaseAdmin: SupabaseClient,
  identity: DeliveryIdentity,
  existing: ChatPushDeliveryRow
) {
  const now = new Date().toISOString();
  const staleCutoff = new Date(Date.now() - STALE_PENDING_DELIVERY_MS).toISOString();
  const nextAttempts = existing.attempts + 1;

  const { data, error } = await supabaseAdmin
    .from('chat_push_deliveries')
    .update({
      attempts: nextAttempts,
      last_error: null,
      updated_at: now,
    })
    .eq('message_id', identity.messageId)
    .eq('recipient_id', identity.recipientId)
    .eq('purpose', identity.purpose)
    .eq('endpoint', identity.endpoint)
    .eq('status', 'pending')
    .lt('updated_at', staleCutoff)
    .lt('attempts', MAX_DELIVERY_ATTEMPTS)
    .select('id, status, attempts')
    .maybeSingle();

  if (error) {
    console.error('chat-push: failed to reclaim stale pending delivery.', {
      code: error.code,
      message: error.message,
    });
    return { ok: false as const, response: jsonError('Unable to claim delivery.', 500) };
  }

  if (!data) {
    return { ok: true as const, claimed: false as const };
  }

  return {
    ok: true as const,
    claimed: true as const,
    deliveryId: (data as ChatPushDeliveryRow).id,
  };
}

async function fetchExistingDelivery(
  supabaseAdmin: SupabaseClient,
  identity: DeliveryIdentity
) {
  const { data, error } = await supabaseAdmin
    .from('chat_push_deliveries')
    .select('id, status, attempts')
    .eq('message_id', identity.messageId)
    .eq('recipient_id', identity.recipientId)
    .eq('purpose', identity.purpose)
    .eq('endpoint', identity.endpoint)
    .maybeSingle();

  if (error) {
    console.error('chat-push: failed to load existing delivery.', {
      code: error.code,
      message: error.message,
    });
    return { ok: false as const, response: jsonError('Unable to claim delivery.', 500) };
  }

  return { ok: true as const, value: data as ChatPushDeliveryRow | null };
}

async function sendSingleNotification(
  supabaseAdmin: SupabaseClient,
  subscription: webpush.PushSubscription,
  payload: NotificationPayload
) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { status: 'sent' as const };
  } catch (error: unknown) {
    const statusCode = error instanceof WebPushError ? error.statusCode : null;
    const expired = statusCode === 404 || statusCode === 410;

    console.warn('chat-push: push delivery failed.', {
      statusCode,
      expired,
      errorName: error instanceof Error ? error.name : 'UnknownError',
    });

    if (expired) {
      const expiredRemoved = await removeExpiredPushSubscription(
        supabaseAdmin,
        subscription.endpoint,
        'chat-push'
      );

      if (!expiredRemoved) {
        console.warn(
          'chat-push: expired subscription cleanup did not complete; future messages may encounter the same dead endpoint.'
        );
      }

      return {
        status: 'expired' as const,
        expiredRemoved,
        errorCategory: 'expired_subscription',
      };
    }

    return {
      status: 'failed' as const,
      expiredRemoved: false,
      errorCategory: classifyPushFailure(statusCode),
    };
  }
}

async function finalizeDelivery(
  supabaseAdmin: SupabaseClient,
  deliveryId: string,
  status: DeliveryStatus,
  errorCategory?: string
) {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from('chat_push_deliveries')
    .update({
      status,
      sent_at: status === 'sent' ? now : null,
      last_error: status === 'sent' ? null : errorCategory ?? 'provider_failure',
      updated_at: now,
    })
    .eq('id', deliveryId);

  if (error) {
    console.error(
      status === 'sent'
        ? 'chat-push: provider delivery succeeded but finalization failed; reconciliation needed.'
        : 'chat-push: failed to finalize delivery.',
      {
        code: error.code,
        message: error.message,
        deliveryStatus: status,
      }
    );

    if (status === 'sent') {
      console.warn(
        'chat-push: at-least-once delivery limitation reached; stable eventId/tag should collapse duplicate display if retried.'
      );
    }

    return { ok: false as const };
  }

  return { ok: true as const };
}

function parseMentions(value: string | null) {
  return parseMentionTokens(value, {
    maxScanLength: MAX_MESSAGE_CONTENT_SCAN_CHARS,
    maxTokens: MAX_MENTION_CANDIDATES,
  });
}

function validateMessageId(value: unknown) {
  if (typeof value !== 'string') {
    return { ok: false as const, error: 'messageId must be a string.' };
  }

  const trimmed = value.trim();
  if (!UUID_PATTERN.test(trimmed)) {
    return { ok: false as const, error: 'messageId must be a valid message ID.' };
  }

  return { ok: true as const, value: trimmed };
}

function validateMessageTimestamp(createdAt: unknown) {
  if (typeof createdAt !== 'string' || !createdAt.trim()) {
    return { ok: false as const, error: 'Message timestamp is invalid.', status: 409 };
  }

  const createdTime = Date.parse(createdAt);
  if (!Number.isFinite(createdTime)) {
    return { ok: false as const, error: 'Message timestamp is invalid.', status: 409 };
  }

  const now = Date.now();
  if (createdTime - now > MAX_FUTURE_SKEW_MS) {
    return { ok: false as const, error: 'Message timestamp is invalid.', status: 409 };
  }

  if (now - createdTime > MAX_MESSAGE_AGE_MS) {
    return { ok: false as const, error: 'This message is too old for notification dispatch.', status: 409 };
  }

  return { ok: true as const };
}

function safeDisplayName(profile: ProfileRow) {
  return sanitizeText(profile.username ?? profile.full_name, 'A Sanctuary member', TITLE_LENGTH);
}

function privateMessageBody(message: ChatMessageRow) {
  const preview = sanitizeText(message.content, '', PREVIEW_LENGTH);
  if (preview) return preview;

  const mediaType = mediaKind(message.image_url);
  if (mediaType === 'voice') return 'Sent you a voice message';
  if (mediaType === 'image') return 'Sent you an image';

  return 'Sent you a private message';
}

function publicMessageBody(message: ChatMessageRow, fallback: string) {
  return sanitizeText(message.content, fallback, PREVIEW_LENGTH);
}

function mediaKind(url: string | null) {
  if (!url) return 'none';

  const pathname = safePathname(url);
  if (/\.(webm|mp3|wav|ogg|m4a|aac)$/i.test(pathname)) return 'voice';
  if (/\.(gif|png|jpe?g|webp|avif)$/i.test(pathname)) return 'image';

  return 'unknown';
}

function safePathname(url: string) {
  try {
    return new URL(url).pathname;
  } catch {
    return url.split('?')[0] ?? url;
  }
}

function sanitizeText(value: string | null | undefined, fallback: string, maxLength: number) {
  if (!value) return fallback;

  const bounded = value.slice(0, MAX_SANITIZE_SOURCE_CHARS);
  const cleaned = bounded
    .normalize('NFC')
    .replace(/[<>]/g, '')
    .replace(DANGEROUS_UNICODE_FORMAT_CONTROLS, ' ')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return fallback;

  return truncateText(cleaned, maxLength);
}

function truncateText(value: string, maxLength: number) {
  const characters = Array.from(value);
  if (characters.length <= maxLength) return value;

  const visibleLength = Math.max(0, maxLength - 3);
  return `${characters.slice(0, visibleLength).join('')}...`;
}

function classifyPushFailure(statusCode: number | null) {
  if (statusCode === 413) return 'provider_payload_too_large';
  if (statusCode === 429) return 'provider_rate_limited';
  if (statusCode && statusCode >= 500) return 'provider_server_error';
  if (statusCode && statusCode >= 400) return 'provider_client_error';
  return 'provider_unknown_error';
}

function isMissingDeliveryStorageError(error: { code?: string; message?: string }) {
  return error.code === '42P01' || error.message?.includes('chat_push_deliveries');
}

function isBotResponse(value: string | null) {
  return Boolean(value?.toUpperCase().includes('SANCTUARY BOT:'));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
