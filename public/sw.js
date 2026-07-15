const DEFAULT_NOTIFICATION = {
  title: 'Embers of Light',
  body: 'A new update is waiting in the Sanctuary.',
  url: '/dashboard',
};

const NOTIFICATION_ICON = '/pwa-icon-512x512.png';
const NOTIFICATION_BADGE = '/notification-badge-96x96.png';
const MAX_TEXT_LENGTH = 500;

self.addEventListener('push', function (event) {
  event.waitUntil(handlePush(event));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(openNotificationTarget(event.notification.data?.url));
});

async function handlePush(event) {
  const data = await readPushPayload(event);
  const title = sanitizeText(data.title, DEFAULT_NOTIFICATION.title, 120);
  const body = sanitizeText(data.body, DEFAULT_NOTIFICATION.body, MAX_TEXT_LENGTH);
  const url = normalizeInternalPath(data.url, DEFAULT_NOTIFICATION.url);
  const icon = normalizeInternalPath(data.icon, NOTIFICATION_ICON);
  const image = normalizeInternalPath(data.image, '');
  const tag = normalizeNotificationTag(data.eventId, 'event') || normalizeNotificationTag(data.tag, 'tag');

  const options = {
    body,
    icon,
    badge: NOTIFICATION_BADGE,
    vibrate: [100, 50, 100],
    data: {
      url,
      receivedAt: Date.now(),
    },
  };

  if (tag) {
    options.tag = tag;
    options.renotify = false;
  }

  if (image) {
    options.image = image;
  }

  await self.registration.showNotification(title, options);
}

async function readPushPayload(event) {
  if (!event.data) {
    return {};
  }

  try {
    const text = await event.data.text();
    if (!text) {
      return {};
    }

    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    console.warn('Push payload could not be parsed.', {
      errorName: error instanceof Error ? error.name : 'UnknownError',
    });
    return {};
  }
}

function sanitizeText(value, fallback, maxLength) {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim().replace(/[\u0000-\u001f\u007f]/g, '');
  if (!trimmed) {
    return fallback;
  }

  return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength - 3)}...` : trimmed;
}

function normalizeNotificationTag(value, prefix) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim().replace(/[^a-zA-Z0-9:_./-]/g, '');
  return trimmed ? `${prefix}:${trimmed}`.slice(0, 120) : null;
}

function normalizeInternalPath(value, fallback) {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed || /[\u0000-\u001f\u007f\\]/.test(trimmed) || trimmed.startsWith('//')) {
    return fallback;
  }

  try {
    const parsed = new URL(trimmed, self.location.origin);

    if (
      parsed.origin !== self.location.origin ||
      parsed.username ||
      parsed.password ||
      (parsed.protocol !== 'https:' && parsed.protocol !== 'http:')
    ) {
      return fallback;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

async function openNotificationTarget(path) {
  const safePath = normalizeInternalPath(path, DEFAULT_NOTIFICATION.url);
  const targetUrl = new URL(safePath, self.location.origin).href;
  const windowClients = await clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  });

  for (const client of windowClients) {
    try {
      const clientUrl = new URL(client.url);
      if (clientUrl.origin !== self.location.origin) {
        continue;
      }

      if ('navigate' in client && client.url !== targetUrl) {
        await client.navigate(targetUrl);
      }

      return client.focus();
    } catch {
      continue;
    }
  }

  return clients.openWindow(targetUrl);
}
