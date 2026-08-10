'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const VISITOR_KEY = 'embers_analytics_visitor_id';
const SESSION_KEY = 'embers_analytics_session_id';

const BLOCKED_PREFIXES = [
  '/api',
  '/auth',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/dashboard/admin',
];

export default function SiteAnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || shouldIgnorePath(pathname)) return;

    sendAnalyticsEvent('page_view', pathname);

    if (pathname === '/live') {
      sendAnalyticsEvent('live_opened', pathname);
    } else if (pathname === '/dashboard/membership' || pathname === '/dashboard/subscribe') {
      sendAnalyticsEvent('membership_opened', pathname);
    }
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      if (url.origin === window.location.origin) return;
      if (shouldIgnorePath(window.location.pathname)) return;

      const platform = classifyPlatform(url.hostname);
      sendAnalyticsEvent('external_link_click', window.location.pathname, {
        platform,
        target: url.hostname.slice(0, 100),
      });
    };

    document.addEventListener('click', handleClick, { capture: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, []);

  return null;
}

function sendAnalyticsEvent(
  eventName: 'page_view' | 'external_link_click' | 'live_opened' | 'membership_opened',
  path: string,
  metadata?: Record<string, string>
) {
  const visitorId = getOrCreateId('local', VISITOR_KEY);
  const sessionId = getOrCreateId('session', SESSION_KEY);
  if (!visitorId || !sessionId) return;

  void fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    keepalive: true,
    body: JSON.stringify({
      eventName,
      path,
      visitorId,
      sessionId,
      metadata,
    }),
  }).catch(() => {
    // Analytics must never interrupt the visitor experience.
  });
}

function getOrCreateId(storage: 'local' | 'session', key: string) {
  try {
    const store = storage === 'local' ? window.localStorage : window.sessionStorage;
    const existing = store.getItem(key);
    if (existing) return existing;

    const created = crypto.randomUUID();
    store.setItem(key, created);
    return created;
  } catch {
    return null;
  }
}

function shouldIgnorePath(path: string) {
  return BLOCKED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function classifyPlatform(hostname: string) {
  const host = hostname.toLowerCase();
  if (host.includes('youtube.com') || host === 'youtu.be') return 'youtube';
  if (host.includes('twitch.tv')) return 'twitch';
  if (host.includes('zeno.fm')) return 'zeno';
  if (host.includes('smule.com')) return 'smule';
  if (host.includes('facebook.com')) return 'facebook';
  if (host.includes('instagram.com')) return 'instagram';
  return 'other';
}
