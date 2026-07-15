import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createSupabaseServiceRoleClient, jsonError } from '@/utils/api/security';

type PushSubscriptionJson = {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

type PushSubscriptionRow = {
  subscription: PushSubscriptionJson | null;
};

type EndpointOwnerRow = {
  user_id: string;
};

const MAX_ENDPOINT_LENGTH = 2048;
const MAX_KEY_LENGTH = 512;
const MAX_REQUEST_BODY_BYTES = 16 * 1024;
const PUSH_ENDPOINT_OWNED_BY_ANOTHER_USER = 'PUSH_ENDPOINT_OWNED_BY_ANOTHER_USER';

export async function GET(req: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get('endpoint');

  if (!endpoint) {
    return NextResponse.json({
      supported: true,
      serverSubscribed: false,
    });
  }

  const endpointValidation = validateEndpoint(endpoint);
  if (!endpointValidation.ok) {
    return jsonError(endpointValidation.error, 400);
  }

  const supabaseAdmin = createSupabaseServiceRoleClient();
  if (!supabaseAdmin.ok) return supabaseAdmin.response;

  const { data, error } = await supabaseAdmin.client
    .from('push_subscriptions')
    .select('subscription')
    .eq('user_id', auth.userId)
    .eq('subscription->>endpoint', endpointValidation.value)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('push-subscriptions: status lookup failed.', {
      code: error.code,
      message: error.message,
    });
    return jsonError('Unable to load notification status.', 500);
  }

  const row = data as PushSubscriptionRow | null;

  return NextResponse.json({
    supported: true,
    serverSubscribed: Boolean(row?.subscription),
  });
}

export async function POST(req: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth.ok) return auth.response;

  const body = await readLimitedJsonObject(req);
  if (!body.ok) return jsonError(body.error, body.status);

  const subscription = validatePushSubscription(body.value.subscription);
  if (!subscription.ok) return jsonError(subscription.error, 400);

  const supabaseAdmin = createSupabaseServiceRoleClient();
  if (!supabaseAdmin.ok) return supabaseAdmin.response;

  const { data: existingRows, error: lookupError } = await supabaseAdmin.client
    .from('push_subscriptions')
    .select('user_id')
    .eq('subscription->>endpoint', subscription.value.endpoint);

  if (lookupError) {
    console.error('push-subscriptions: endpoint ownership lookup failed.', {
      code: lookupError.code,
      message: lookupError.message,
    });
    return jsonError('Unable to save notification subscription.', 500);
  }

  const owners = (existingRows ?? []) as EndpointOwnerRow[];
  const isOwnedByAnotherUser = owners.some((row) => row.user_id !== auth.userId);

  if (isOwnedByAnotherUser) {
    return NextResponse.json(
      {
        error: 'Unable to save notification subscription.',
        code: PUSH_ENDPOINT_OWNED_BY_ANOTHER_USER,
      },
      { status: 409 }
    );
  }

  if (owners.length > 0) {
    const { error: updateError } = await supabaseAdmin.client
      .from('push_subscriptions')
      .update({
        subscription: subscription.value,
      })
      .eq('user_id', auth.userId)
      .eq('subscription->>endpoint', subscription.value.endpoint);

    if (updateError) {
      console.error('push-subscriptions: subscription update failed.', {
        code: updateError.code,
        message: updateError.message,
      });
      return jsonError('Unable to save notification subscription.', 500);
    }

    return NextResponse.json({
      serverSubscribed: true,
    });
  }

  const { error: insertError } = await supabaseAdmin.client
    .from('push_subscriptions')
    .insert([
      {
        user_id: auth.userId,
        subscription: subscription.value,
      },
    ]);

  if (insertError) {
    if (insertError.code === '23505') {
      const { data: retryRows, error: retryLookupError } = await supabaseAdmin.client
        .from('push_subscriptions')
        .select('user_id')
        .eq('subscription->>endpoint', subscription.value.endpoint);

      if (retryLookupError) {
        console.error('push-subscriptions: endpoint ownership retry lookup failed.', {
          code: retryLookupError.code,
          message: retryLookupError.message,
        });
        return jsonError('Unable to save notification subscription.', 500);
      }

      const retryOwners = (retryRows ?? []) as EndpointOwnerRow[];
      const retryOwnedByAnotherUser = retryOwners.some((row) => row.user_id !== auth.userId);

      if (retryOwnedByAnotherUser) {
        return NextResponse.json(
          {
            error: 'Unable to save notification subscription.',
            code: PUSH_ENDPOINT_OWNED_BY_ANOTHER_USER,
          },
          { status: 409 }
        );
      }

      if (retryOwners.length > 0) {
        const { error: retryUpdateError } = await supabaseAdmin.client
          .from('push_subscriptions')
          .update({
            subscription: subscription.value,
          })
          .eq('user_id', auth.userId)
          .eq('subscription->>endpoint', subscription.value.endpoint);

        if (retryUpdateError) {
          console.error('push-subscriptions: subscription retry update failed.', {
            code: retryUpdateError.code,
            message: retryUpdateError.message,
          });
          return jsonError('Unable to save notification subscription.', 500);
        }

        return NextResponse.json({
          serverSubscribed: true,
        });
      }
    }

    console.error('push-subscriptions: subscription insert failed.', {
      code: insertError.code,
      message: insertError.message,
    });
    return jsonError('Unable to save notification subscription.', 500);
  }

  return NextResponse.json({
    serverSubscribed: true,
  });
}

export async function DELETE(req: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth.ok) return auth.response;

  const body = await readLimitedJsonObject(req);
  if (!body.ok) return jsonError(body.error, body.status);

  const endpoint = validateEndpoint(body.value.endpoint);
  if (!endpoint.ok) return jsonError(endpoint.error, 400);

  const supabaseAdmin = createSupabaseServiceRoleClient();
  if (!supabaseAdmin.ok) return supabaseAdmin.response;

  const { error } = await supabaseAdmin.client
    .from('push_subscriptions')
    .delete()
    .eq('user_id', auth.userId)
    .eq('subscription->>endpoint', endpoint.value);

  if (error) {
    console.error('push-subscriptions: subscription removal failed.', {
      code: error.code,
      message: error.message,
    });
    return jsonError('Unable to remove notification subscription.', 500);
  }

  return NextResponse.json({
    serverSubscribed: false,
  });
}

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.warn('push-subscriptions: failed to authenticate user.', {
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

function validatePushSubscription(value: unknown) {
  if (!isPlainObject(value)) {
    return { ok: false as const, error: 'subscription must be an object.' };
  }

  const endpoint = validateEndpoint(value.endpoint);
  if (!endpoint.ok) return endpoint;

  if (value.expirationTime !== undefined && value.expirationTime !== null) {
    if (typeof value.expirationTime !== 'number' || !Number.isFinite(value.expirationTime)) {
      return { ok: false as const, error: 'subscription expirationTime must be a number or null.' };
    }
  }

  if (!isPlainObject(value.keys)) {
    return { ok: false as const, error: 'subscription keys must be an object.' };
  }

  const p256dh = validateKey(value.keys.p256dh, 'p256dh');
  if (!p256dh.ok) return p256dh;

  const auth = validateKey(value.keys.auth, 'auth');
  if (!auth.ok) return auth;

  return {
    ok: true as const,
    value: {
      endpoint: endpoint.value,
      expirationTime: value.expirationTime ?? null,
      keys: {
        p256dh: p256dh.value,
        auth: auth.value,
      },
    },
  };
}

function validateEndpoint(value: unknown) {
  if (typeof value !== 'string') {
    return { ok: false as const, error: 'endpoint must be a string.' };
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_ENDPOINT_LENGTH) {
    return { ok: false as const, error: 'endpoint is invalid.' };
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
      return { ok: false as const, error: 'endpoint is invalid.' };
    }

    return { ok: true as const, value: parsed.toString() };
  } catch {
    return { ok: false as const, error: 'endpoint is invalid.' };
  }
}

function validateKey(value: unknown, keyName: string) {
  if (typeof value !== 'string') {
    return { ok: false as const, error: `${keyName} must be a string.` };
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_KEY_LENGTH || /[^a-zA-Z0-9_+/=-]/.test(trimmed)) {
    return { ok: false as const, error: `${keyName} is invalid.` };
  }

  return { ok: true as const, value: trimmed };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function readLimitedJsonObject(req: Request) {
  const declaredLength = req.headers.get('content-length');
  if (declaredLength) {
    const parsedLength = Number(declaredLength);
    if (!Number.isFinite(parsedLength) || parsedLength > MAX_REQUEST_BODY_BYTES) {
      return {
        ok: false as const,
        status: 413,
        error: 'Request body is too large.',
      };
    }
  }

  if (!req.body) {
    return {
      ok: false as const,
      status: 400,
      error: 'Request body must be valid JSON.',
    };
  }

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (!value) continue;

      receivedBytes += value.byteLength;
      if (receivedBytes > MAX_REQUEST_BODY_BYTES) {
        await reader.cancel();
        return {
          ok: false as const,
          status: 413,
          error: 'Request body is too large.',
        };
      }

      chunks.push(value);
    }
  } catch {
    return {
      ok: false as const,
      status: 400,
      error: 'Request body must be valid JSON.',
    };
  }

  try {
    const bodyText = new TextDecoder().decode(concatChunks(chunks, receivedBytes));
    const parsed: unknown = JSON.parse(bodyText);

    if (!isPlainObject(parsed)) {
      return {
        ok: false as const,
        status: 400,
        error: 'Request body must be a JSON object.',
      };
    }

    return {
      ok: true as const,
      value: parsed,
    };
  } catch {
    return {
      ok: false as const,
      status: 400,
      error: 'Request body must be valid JSON.',
    };
  }
}

function concatChunks(chunks: Uint8Array[], totalLength: number) {
  const combined = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return combined;
}
