import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseServiceRoleClient, requireAdminUser } from '@/utils/api/security';

type AnalyticsRow = {
  event_name: string;
  path: string;
  visitor_id: string;
  session_id: string;
  user_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export async function GET(req: Request) {
  const admin = await requireAdminUser();
  if (!admin.ok) return admin.response;

  const url = new URL(req.url);
  const requestedDays = Number(url.searchParams.get('days') ?? '30');
  const days = requestedDays === 7 || requestedDays === 90 ? requestedDays : 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const serviceRole = createSupabaseServiceRoleClient();
  if (!serviceRole.ok) return serviceRole.response;

  try {
    const { rows, truncated } = await readAnalyticsRows(serviceRole.client, since);
    const pageViews = rows.filter((row) => row.event_name === 'page_view');
    const landingViews = pageViews.filter((row) => row.path === '/');
    const authenticatedPageViews = pageViews.filter((row) => Boolean(row.user_id) && row.path !== '/');

    const landingBrowsers = new Set(landingViews.map((row) => row.visitor_id));
    const landingSessions = new Set(landingViews.map((row) => row.session_id));
    const activeUsers = new Set(authenticatedPageViews.map((row) => row.user_id).filter(Boolean) as string[]);
    const authenticatedSessions = new Set(authenticatedPageViews.map((row) => row.session_id));

    const landingSessionsByBrowser = new Map<string, Set<string>>();
    for (const row of landingViews) {
      const current = landingSessionsByBrowser.get(row.visitor_id) ?? new Set<string>();
      current.add(row.session_id);
      landingSessionsByBrowser.set(row.visitor_id, current);
    }
    const returningLandingBrowsers = [...landingSessionsByBrowser.values()].filter((set) => set.size > 1).length;

    const sessionsByUser = new Map<string, Set<string>>();
    for (const row of authenticatedPageViews) {
      if (!row.user_id) continue;
      const current = sessionsByUser.get(row.user_id) ?? new Set<string>();
      current.add(row.session_id);
      sessionsByUser.set(row.user_id, current);
    }
    const returningUsers = [...sessionsByUser.values()].filter((set) => set.size > 1).length;

    const topAuthenticatedPages = countBy(authenticatedPageViews, (row) => row.path)
      .slice(0, 12)
      .map(([path, count]) => ({ path, count }));

    const eventCounts = countBy(rows.filter((row) => row.event_name !== 'page_view'), (row) => row.event_name)
      .map(([eventName, count]) => ({ eventName, count }));

    const outboundPlatforms = countBy(
      rows.filter((row) => row.event_name === 'external_link_click' && Boolean(row.user_id)),
      (row) => typeof row.metadata?.platform === 'string' ? row.metadata.platform : 'other'
    ).map(([platform, count]) => ({ platform, count }));

    const daily = buildDaily(pageViews, days);

    return NextResponse.json({
      success: true,
      days,
      truncated,
      totals: {
        landingPageViews: landingViews.length,
        landingUniqueBrowsers: landingBrowsers.size,
        landingSessions: landingSessions.size,
        returningLandingBrowsers,
        authenticatedPageViews: authenticatedPageViews.length,
        activeUsers: activeUsers.size,
        authenticatedSessions: authenticatedSessions.size,
        returningUsers,
      },
      topAuthenticatedPages,
      eventCounts,
      outboundPlatforms,
      daily,
    });
  } catch (error) {
    console.error('site-analytics: admin summary failed.', {
      message: error instanceof Error ? error.message : 'Unknown analytics failure',
    });
    return NextResponse.json({ success: false, error: 'Unable to load analytics.' }, { status: 500 });
  }
}

async function readAnalyticsRows(supabase: SupabaseClient, since: string) {
  const pageSize = 1000;
  const maxPages = 50;
  const rows: AnalyticsRow[] = [];
  let truncated = false;

  for (let page = 0; page < maxPages; page += 1) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from('site_analytics_events')
      .select('event_name, path, visitor_id, session_id, user_id, metadata, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new Error(error.message);
    const batch = (data ?? []) as AnalyticsRow[];
    rows.push(...batch);

    if (batch.length < pageSize) return { rows, truncated };
  }

  truncated = true;
  return { rows, truncated };
}

function countBy<T>(rows: T[], keyFor: (row: T) => string) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = keyFor(row);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function buildDaily(rows: AnalyticsRow[], days: number) {
  const output: Array<{
    date: string;
    landingViews: number;
    landingUniqueBrowsers: number;
    authenticatedPageViews: number;
    activeUsers: number;
  }> = [];
  const today = new Date();

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - offset);
    const key = date.toISOString().slice(0, 10);
    const dayRows = rows.filter((row) => row.created_at.slice(0, 10) === key);
    const landingRows = dayRows.filter((row) => row.path === '/');
    const authenticatedRows = dayRows.filter((row) => Boolean(row.user_id) && row.path !== '/');

    output.push({
      date: key,
      landingViews: landingRows.length,
      landingUniqueBrowsers: new Set(landingRows.map((row) => row.visitor_id)).size,
      authenticatedPageViews: authenticatedRows.length,
      activeUsers: new Set(authenticatedRows.map((row) => row.user_id).filter(Boolean)).size,
    });
  }

  return output;
}
