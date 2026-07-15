'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

type ApiResponse = {
  serverSubscribed?: boolean;
  error?: string;
  code?: string;
};

type ActionContext = {
  token: number;
  userId: string;
};

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

type NotificationPermissionStatus = NotificationPermission | 'unsupported';

const PROMPT_DISMISS_KEY_PREFIX = 'embers-push-prompt-dismissed:';
const PUSH_ENDPOINT_OWNED_BY_ANOTHER_USER = 'PUSH_ENDPOINT_OWNED_BY_ANOTHER_USER';

class StaleRequestError extends Error {
  constructor() {
    super('Stale push notification request.');
    this.name = 'StaleRequestError';
  }
}

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

function browserSupportsPush() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

function isStandalonePwa() {
  const standaloneNavigator = navigator as NavigatorWithStandalone;

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    standaloneNavigator.standalone === true
  );
}

function readNotificationPermission(): NotificationPermissionStatus {
  if (!('Notification' in window)) {
    return 'unsupported';
  }

  return Notification.permission;
}

async function readApiResponse(response: Response): Promise<ApiResponse> {
  try {
    return (await response.json()) as ApiResponse;
  } catch {
    return {};
  }
}

function subscriptionUsesCurrentKey(subscription: PushSubscription, publicVapidKey: string) {
  const existingKey = subscription.options.applicationServerKey;

  if (!existingKey) {
    return true;
  }

  const expectedKey = urlBase64ToUint8Array(publicVapidKey);
  const currentKey = new Uint8Array(existingKey);

  if (currentKey.length !== expectedKey.length) {
    return false;
  }

  return currentKey.every((value, index) => value === expectedKey[index]);
}

function promptDismissKey(userId: string) {
  return `${PROMPT_DISMISS_KEY_PREFIX}${userId}`;
}

function readPromptDismissed(userId: string) {
  try {
    return localStorage.getItem(promptDismissKey(userId)) === '1';
  } catch (error) {
    console.warn('Unable to read push prompt dismissal state.', error);
    return false;
  }
}

function writePromptDismissed(userId: string) {
  try {
    localStorage.setItem(promptDismissKey(userId), '1');
  } catch (error) {
    console.warn('Unable to save push prompt dismissal state.', error);
  }
}

function isStaleRequest(error: unknown) {
  return error instanceof StaleRequestError;
}

export default function PushNotificationButton() {
  const supabase = createClient();
  const mountedRef = useRef(false);
  const activeUserIdRef = useRef<string | null>(null);
  const requestTokenRef = useRef(0);
  const actionInFlightRef = useRef(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [supportChecked, setSupportChecked] = useState(false);
  const [supported, setSupported] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [permission, setPermission] = useState<NotificationPermissionStatus>('unsupported');
  const [browserSubscription, setBrowserSubscription] = useState<PushSubscription | null>(null);
  const [serverSubscribed, setServerSubscribed] = useState(false);
  const [serverChecked, setServerChecked] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(true);
  const [pendingServerCleanupEndpoint, setPendingServerCleanupEndpoint] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fullyActive = permission === 'granted' && Boolean(browserSubscription) && serverSubscribed;
  const shouldShowPrompt =
    supported && standalone && permission === 'default' && !promptDismissed && !fullyActive;

  const statusText = useMemo(() => {
    if (!supported) return 'Alerts are not supported in this browser.';
    if (permission === 'denied') return 'Alerts are blocked in browser settings.';
    if (fullyActive) return 'Alerts Active';
    if (permission === 'granted' && browserSubscription && !serverSubscribed) {
      return serverChecked ? 'Alerts need to sync.' : 'Checking alerts...';
    }
    if (permission === 'granted') return 'Alerts are ready to enable.';
    return 'Enable Sanctuary alerts.';
  }, [browserSubscription, fullyActive, permission, serverChecked, serverSubscribed, supported]);

  const beginRequest = useCallback((currentUserId: string): ActionContext => {
    requestTokenRef.current += 1;
    return {
      token: requestTokenRef.current,
      userId: currentUserId,
    };
  }, []);

  const isActiveContext = useCallback((context: ActionContext) => {
    return (
      mountedRef.current &&
      requestTokenRef.current === context.token &&
      activeUserIdRef.current === context.userId
    );
  }, []);

  const assertActiveContext = useCallback(
    (context: ActionContext) => {
      if (!isActiveContext(context)) {
        throw new StaleRequestError();
      }
    },
    [isActiveContext]
  );

  const removeServerSubscription = useCallback(
    async (endpoint: string, context: ActionContext) => {
      const response = await fetch('/api/push-subscriptions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint }),
      });
      const data = await readApiResponse(response);

      assertActiveContext(context);

      if (!response.ok) {
        throw new Error(data.error ?? 'Unable to remove notification subscription.');
      }
    },
    [assertActiveContext]
  );

  const saveServerSubscription = useCallback(
    async (subscription: PushSubscription, context: ActionContext) => {
      const response = await fetch('/api/push-subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });
      const data = await readApiResponse(response);

      assertActiveContext(context);

      if (response.status === 409 && data.code === PUSH_ENDPOINT_OWNED_BY_ANOTHER_USER) {
        return { status: 'conflict' as const };
      }

      if (!response.ok) {
        throw new Error(data.error ?? 'Unable to save notification subscription.');
      }

      return { status: 'saved' as const };
    },
    [assertActiveContext]
  );

  const createBrowserSubscription = useCallback(
    async (
      context: ActionContext,
      options?: {
        forceNew?: boolean;
        deleteServerBeforeReplace?: boolean;
      }
    ) => {
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!publicVapidKey) {
        throw new Error('Notification service is not configured.');
      }

      const registration = await navigator.serviceWorker.ready;
      assertActiveContext(context);

      const existingSubscription = await registration.pushManager.getSubscription();
      assertActiveContext(context);

      if (
        existingSubscription &&
        !options?.forceNew &&
        subscriptionUsesCurrentKey(existingSubscription, publicVapidKey)
      ) {
        return existingSubscription;
      }

      if (existingSubscription) {
        if (options?.deleteServerBeforeReplace) {
          await removeServerSubscription(existingSubscription.endpoint, context);
        }

        const unsubscribed = await existingSubscription.unsubscribe();
        assertActiveContext(context);

        if (!unsubscribed) {
          throw new Error('Unable to replace the current browser notification subscription.');
        }
      }

      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });
      assertActiveContext(context);

      return newSubscription;
    },
    [assertActiveContext, removeServerSubscription]
  );

  const registerSubscriptionWithConflictRecovery = useCallback(
    async (subscription: PushSubscription, context: ActionContext) => {
      let currentSubscription = subscription;

      for (let attempt = 0; attempt < 2; attempt += 1) {
        const result = await saveServerSubscription(currentSubscription, context);
        assertActiveContext(context);

        if (result.status === 'saved') {
          return currentSubscription;
        }

        if (attempt === 1) {
          throw new Error(
            'This browser is still linked to another account. Remove site notifications in browser settings and try again.'
          );
        }

        const registration = await navigator.serviceWorker.ready;
        assertActiveContext(context);

        const liveSubscription = await registration.pushManager.getSubscription();
        assertActiveContext(context);

        if (!liveSubscription || liveSubscription.endpoint !== currentSubscription.endpoint) {
          throw new Error('Unable to recover this browser notification subscription.');
        }

        const unsubscribed = await liveSubscription.unsubscribe();
        assertActiveContext(context);

        if (!unsubscribed) {
          throw new Error(
            'Unable to replace a notification subscription linked to another account.'
          );
        }

        currentSubscription = await createBrowserSubscription(context, {
          forceNew: true,
          deleteServerBeforeReplace: false,
        });
      }

      throw new Error('Unable to save notification subscription.');
    },
    [assertActiveContext, createBrowserSubscription, saveServerSubscription]
  );

  const refreshState = useCallback(
    async (context: ActionContext, options?: { repairServerRecord?: boolean }) => {
      if (!isActiveContext(context)) {
        return;
      }

      const canPush = browserSupportsPush();
      const displayStandalone = isStandalonePwa();
      const currentPermission = readNotificationPermission();

      setSupported(canPush);
      setSupportChecked(true);
      setStandalone(displayStandalone);
      setPermission(currentPermission);
      setPromptDismissed(readPromptDismissed(context.userId));
      setServerChecked(false);

      if (!canPush || currentPermission === 'denied') {
        setBrowserSubscription(null);
        setServerSubscribed(false);
        setServerChecked(true);
        setPendingServerCleanupEndpoint(null);
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        assertActiveContext(context);

        let subscription = await registration.pushManager.getSubscription();
        assertActiveContext(context);

        const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (
          subscription &&
          options?.repairServerRecord &&
          currentPermission === 'granted' &&
          publicVapidKey &&
          !subscriptionUsesCurrentKey(subscription, publicVapidKey)
        ) {
          subscription = await createBrowserSubscription(context, {
            deleteServerBeforeReplace: true,
          });
          assertActiveContext(context);
        }

        setBrowserSubscription(subscription);

        if (!subscription) {
          setServerSubscribed(false);
          setServerChecked(true);
          return;
        }

        const response = await fetch(
          `/api/push-subscriptions?endpoint=${encodeURIComponent(subscription.endpoint)}`
        );
        const data = await readApiResponse(response);
        assertActiveContext(context);

        if (!response.ok) {
          throw new Error(data.error ?? 'Unable to verify notification subscription.');
        }

        if (data.serverSubscribed) {
          setServerSubscribed(true);
          setServerChecked(true);
          setPendingServerCleanupEndpoint(null);
          return;
        }

        setServerSubscribed(false);
        setServerChecked(true);

        if (options?.repairServerRecord && currentPermission === 'granted') {
          const registeredSubscription = await registerSubscriptionWithConflictRecovery(
            subscription,
            context
          );
          assertActiveContext(context);
          setBrowserSubscription(registeredSubscription);
          setServerSubscribed(true);
          setServerChecked(true);
          setPendingServerCleanupEndpoint(null);
        }
      } catch (error) {
        if (isStaleRequest(error)) {
          return;
        }

        console.error('Push notification status check failed.', error);

        if (isActiveContext(context)) {
          setNotice(
            error instanceof Error ? error.message : 'Unable to verify alerts right now.'
          );
          setServerChecked(true);
        }
      }
    },
    [
      assertActiveContext,
      createBrowserSubscription,
      isActiveContext,
      registerSubscriptionWithConflictRecovery,
    ]
  );

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      requestTokenRef.current += 1;
      actionInFlightRef.current = false;
    };
  }, []);

  useEffect(() => {
    requestTokenRef.current += 1;
    const authRequestToken = requestTokenRef.current;

    const loadUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!mountedRef.current || requestTokenRef.current !== authRequestToken) {
        return;
      }

      if (error) {
        console.error('Push notification auth check failed.', error.message);
      }

      const nextUserId = user?.id ?? null;
      activeUserIdRef.current = nextUserId;
      setUserId(nextUserId);
      setAuthLoading(false);
    };

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      const nextUserId = session?.user?.id ?? null;

      if (nextUserId && nextUserId === activeUserIdRef.current) {
        setAuthLoading(false);
        return;
      }

      requestTokenRef.current += 1;
      actionInFlightRef.current = false;
      activeUserIdRef.current = nextUserId;
      setAuthLoading(false);
      setUserId(nextUserId);
      setSupportChecked(false);
      setBrowserSubscription(null);
      setServerSubscribed(false);
      setServerChecked(false);
      setPendingServerCleanupEndpoint(null);
      setLoading(false);
      setNotice(null);

      if (event === 'SIGNED_OUT' || !nextUserId) {
        setPromptDismissed(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const context = beginRequest(userId);
    void refreshState(context, { repairServerRecord: true });
  }, [beginRequest, refreshState, userId]);

  const enableAlerts = async () => {
    if (!userId || actionInFlightRef.current) return;

    const context = beginRequest(userId);
    actionInFlightRef.current = true;
    setLoading(true);
    setNotice(null);

    try {
      if (!browserSupportsPush()) {
        if (isActiveContext(context)) {
          setSupported(false);
          setNotice('Alerts are not supported in this browser.');
        }
        return;
      }

      let currentPermission = readNotificationPermission();
      if (currentPermission === 'default') {
        currentPermission = await Notification.requestPermission();
        assertActiveContext(context);
      }

      if (isActiveContext(context)) {
        setPermission(currentPermission);
      }

      if (currentPermission === 'denied') {
        if (isActiveContext(context)) {
          setNotice(
            'Alerts are blocked. Re-enable notifications in your browser or device settings.'
          );
        }
        return;
      }

      if (currentPermission !== 'granted') {
        if (isActiveContext(context)) {
          setNotice('Alerts were not enabled.');
        }
        return;
      }

      const subscription = await createBrowserSubscription(context);
      assertActiveContext(context);

      const registeredSubscription = await registerSubscriptionWithConflictRecovery(
        subscription,
        context
      );
      assertActiveContext(context);

      setBrowserSubscription(registeredSubscription);
      setServerSubscribed(true);
      setServerChecked(true);
      setPendingServerCleanupEndpoint(null);
      setPromptDismissed(true);
      writePromptDismissed(context.userId);
      setNotice(null);
    } catch (error) {
      if (isStaleRequest(error)) {
        return;
      }

      console.error('Error enabling push notifications.', error);

      if (isActiveContext(context)) {
        setNotice(error instanceof Error ? error.message : 'Unable to enable alerts.');
      }
    } finally {
      actionInFlightRef.current = false;
      if (isActiveContext(context)) {
        setLoading(false);
      }
    }
  };

  const disableAlerts = async () => {
    if (!userId || actionInFlightRef.current) return;

    const context = beginRequest(userId);
    actionInFlightRef.current = true;
    setLoading(true);
    setNotice(null);

    let subscription: PushSubscription | null = null;
    let serverDeleteSucceeded = false;
    let localUnsubscribeSucceeded = false;
    let serverDeleteFailed = false;
    let localUnsubscribeFailed = false;

    try {
      const registration = await navigator.serviceWorker.ready;
      assertActiveContext(context);

      subscription = await registration.pushManager.getSubscription();
      assertActiveContext(context);

      if (!subscription) {
        setBrowserSubscription(null);
        setServerSubscribed(false);
        setServerChecked(true);
        setPendingServerCleanupEndpoint(null);
        setNotice('No browser alerts were registered for this device.');
        return;
      }

      try {
        await removeServerSubscription(subscription.endpoint, context);
        serverDeleteSucceeded = true;
      } catch (error) {
        if (isStaleRequest(error)) throw error;
        serverDeleteFailed = true;
        console.error('Push notification server cleanup failed.', error);
      }

      try {
        localUnsubscribeSucceeded = await subscription.unsubscribe();
        assertActiveContext(context);
        localUnsubscribeFailed = !localUnsubscribeSucceeded;
      } catch (error) {
        if (isStaleRequest(error)) throw error;
        localUnsubscribeFailed = true;
        console.error('Browser push unsubscribe failed.', error);
      }

      assertActiveContext(context);

      if (serverDeleteSucceeded && localUnsubscribeSucceeded) {
        setBrowserSubscription(null);
        setServerSubscribed(false);
        setServerChecked(true);
        setPendingServerCleanupEndpoint(null);
        setNotice('Alerts disabled for this device.');
        return;
      }

      if (serverDeleteSucceeded && localUnsubscribeFailed) {
        setBrowserSubscription(subscription);
        setServerSubscribed(false);
        setServerChecked(true);
        setPendingServerCleanupEndpoint(null);
        setNotice(
          'Server registration was removed, but this browser may still hold alerts. Try disabling again.'
        );
        return;
      }

      if (serverDeleteFailed && localUnsubscribeSucceeded) {
        setBrowserSubscription(null);
        setServerSubscribed(true);
        setServerChecked(true);
        setPendingServerCleanupEndpoint(subscription.endpoint);
        setNotice(
          'Browser alerts were removed, but server cleanup may still be pending. Try cleanup again.'
        );
        return;
      }

      setBrowserSubscription(subscription);
      setServerSubscribed(true);
      setServerChecked(true);
      setPendingServerCleanupEndpoint(subscription.endpoint);
      setNotice(
        'Alerts may still be registered in the browser and on the server. Try disabling again.'
      );
    } catch (error) {
      if (isStaleRequest(error)) {
        return;
      }

      console.error('Error disabling push notifications.', error);

      if (isActiveContext(context)) {
        setNotice(error instanceof Error ? error.message : 'Unable to disable alerts.');
      }
    } finally {
      actionInFlightRef.current = false;
      if (isActiveContext(context)) {
        setLoading(false);
      }
    }
  };

  const retryServerCleanup = async () => {
    if (!userId || !pendingServerCleanupEndpoint || actionInFlightRef.current) return;

    const context = beginRequest(userId);
    const endpoint = pendingServerCleanupEndpoint;
    actionInFlightRef.current = true;
    setLoading(true);
    setNotice(null);

    try {
      await removeServerSubscription(endpoint, context);
      assertActiveContext(context);
      setServerSubscribed(false);
      setServerChecked(true);
      setPendingServerCleanupEndpoint(null);
      setNotice('Server cleanup completed for this device.');
    } catch (error) {
      if (isStaleRequest(error)) {
        return;
      }

      console.error('Push notification server cleanup retry failed.', error);

      if (isActiveContext(context)) {
        setNotice('Server cleanup is still pending. Try again later.');
      }
    } finally {
      actionInFlightRef.current = false;
      if (isActiveContext(context)) {
        setLoading(false);
      }
    }
  };

  const dismissPrompt = () => {
    if (!userId) return;

    writePromptDismissed(userId);
    setPromptDismissed(true);
  };

  if (authLoading || !userId || !supportChecked) {
    return null;
  }

  if (!supported) {
    return (
      <div className="fixed bottom-6 right-6 z-50 max-w-[16rem] rounded-xl border border-orange-900/40 bg-black/80 px-4 py-3 text-xs text-orange-200 shadow-lg backdrop-blur-md font-cinzel">
        Alerts unavailable in this browser.
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-[18rem] rounded-xl border border-orange-900/40 bg-black/85 p-3 text-orange-100 shadow-lg backdrop-blur-md font-cinzel">
      {shouldShowPrompt && (
        <div className="mb-3 border-b border-orange-900/40 pb-3">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
            Sanctuary Alerts
          </p>
          <p className="mt-2 text-sm font-cormorant text-gray-200">
            Let Embers send important updates while this installed app is closed.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={enableAlerts}
              disabled={loading}
              className="rounded-lg bg-orange-600 px-3 py-2 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-orange-500 disabled:opacity-50"
            >
              Enable
            </button>
            <button
              type="button"
              onClick={dismissPrompt}
              disabled={loading}
              className="rounded-lg border border-orange-900/60 px-3 py-2 text-xs uppercase tracking-widest text-gray-300 transition-colors hover:text-orange-300 disabled:opacity-50"
            >
              Not Now
            </button>
          </div>
        </div>
      )}

      <p className="text-xs uppercase tracking-widest text-orange-300">{statusText}</p>
      {notice && <p className="mt-2 text-sm font-cormorant text-gray-300">{notice}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        {browserSubscription ? (
          <button
            type="button"
            onClick={disableAlerts}
            disabled={loading}
            className="rounded-full border border-orange-900/60 px-4 py-2 text-xs uppercase tracking-widest text-orange-100 transition-colors hover:border-orange-500 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Disable Alerts'}
          </button>
        ) : (
          <button
            type="button"
            onClick={enableAlerts}
            disabled={loading || permission === 'denied'}
            className="rounded-full bg-orange-600 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Enable Alerts'}
          </button>
        )}

        {permission === 'granted' && browserSubscription && !serverSubscribed && (
          <button
            type="button"
            onClick={() => {
              if (!userId || actionInFlightRef.current) return;
              const context = beginRequest(userId);
              void refreshState(context, { repairServerRecord: true });
            }}
            disabled={loading}
            className="rounded-full border border-orange-900/60 px-4 py-2 text-xs uppercase tracking-widest text-orange-100 transition-colors hover:border-orange-500 disabled:opacity-50"
          >
            Sync
          </button>
        )}

        {pendingServerCleanupEndpoint && (
          <button
            type="button"
            onClick={retryServerCleanup}
            disabled={loading}
            className="rounded-full border border-orange-900/60 px-4 py-2 text-xs uppercase tracking-widest text-orange-100 transition-colors hover:border-orange-500 disabled:opacity-50"
          >
            Cleanup
          </button>
        )}
      </div>
    </div>
  );
}
