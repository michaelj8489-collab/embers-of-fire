'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type AnalyticsResponse = {
  success: boolean;
  error?: string;
  days?: number;
  truncated?: boolean;
  totals?: {
    pageViews: number;
    uniqueVisitors: number;
    sessions: number;
    returningVisitors: number;
    authenticatedUsers: number;
  };
  topPages?: Array<{ path: string; count: number }>;
  eventCounts?: Array<{ eventName: string; count: number }>;
  outboundPlatforms?: Array<{ platform: string; count: number }>;
  daily?: Array<{ date: string; pageViews: number; uniqueVisitors: number }>;
};

export default function AnalyticsDashboardClient() {
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/analytics?days=${days}`, { cache: 'no-store' });
        const payload = (await response.json()) as AnalyticsResponse;
        if (!cancelled) setData(payload);
      } catch {
        if (!cancelled) setData({ success: false, error: 'Unable to load analytics.' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [days]);

  const maxDailyViews = useMemo(
    () => Math.max(1, ...(data?.daily ?? []).map((item) => item.pageViews)),
    [data?.daily]
  );

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-32">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-cinzel text-sm uppercase tracking-[0.25em] text-orange-400">Admin Analytics</p>
            <h1 className="mt-2 font-cinzel text-3xl text-white md:text-5xl">How Embers Is Actually Being Used</h1>
            <p className="mt-3 max-w-3xl text-gray-400">
              First-party usage data only: anonymous browser/session IDs, route activity, outbound platform clicks, and authenticated user IDs when someone is signed in. No email addresses, payment data, query strings, or admin/billing pages are tracked.
            </p>
          </div>
          <Link href="/dashboard/admin" className="rounded-lg border border-orange-600 px-4 py-2 text-orange-200">
            Back to Admin
          </Link>
        </div>

        <div className="mb-8 flex gap-2">
          {([7, 30, 90] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDays(option)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${days === option ? 'bg-orange-700 text-white' : 'border border-white/10 bg-zinc-950 text-gray-300'}`}
            >
              {option} days
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-orange-900/40 bg-zinc-950 p-8 text-center text-orange-400">Reading the signal…</div>
        ) : !data?.success || !data.totals ? (
          <div className="rounded-2xl border border-red-800 bg-red-950/30 p-6 text-red-100">{data?.error ?? 'Unable to load analytics.'}</div>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Stat label="Page views" value={data.totals.pageViews} />
              <Stat label="Unique visitors" value={data.totals.uniqueVisitors} />
              <Stat label="Sessions" value={data.totals.sessions} />
              <Stat label="Returning visitors" value={data.totals.returningVisitors} />
              <Stat label="Signed-in users" value={data.totals.authenticatedUsers} />
            </section>

            {data.totals.uniqueVisitors === 0 ? (
              <section className="mt-8 rounded-2xl border border-orange-900/50 bg-orange-950/15 p-6">
                <h2 className="font-cinzel text-xl text-orange-200">Baseline starts now</h2>
                <p className="mt-2 text-gray-300">
                  This tracker begins collecting after deployment, so historical traffic is not reconstructed. Give it a few days and this page will become much more useful.
                </p>
              </section>
            ) : null}

            <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-950 p-6">
              <h2 className="font-cinzel text-xl text-white">Daily traffic</h2>
              <p className="mt-1 text-sm text-gray-500">Page views by day for the selected window.</p>
              <div className="mt-6 flex h-52 items-end gap-1 overflow-hidden rounded-xl border border-white/5 bg-black/40 p-3">
                {(data.daily ?? []).map((item) => (
                  <div key={item.date} className="group relative flex min-w-0 flex-1 items-end" title={`${item.date}: ${item.pageViews} views / ${item.uniqueVisitors} visitors`}>
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-orange-800 to-orange-400 opacity-80 transition-opacity group-hover:opacity-100"
                      style={{ height: `${Math.max(3, (item.pageViews / maxDailyViews) * 100)}%` }}
                    />
                  </div>
                ))}
              </div>
            </section>

            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              <ResultList
                title="Most-used pages"
                empty="No page views yet."
                rows={(data.topPages ?? []).map((item) => ({ label: friendlyPath(item.path), sublabel: item.path, value: item.count }))}
              />
              <ResultList
                title="Useful actions"
                empty="No tracked actions yet."
                rows={(data.eventCounts ?? []).map((item) => ({ label: friendlyEvent(item.eventName), value: item.count }))}
              />
            </div>

            <section className="mt-8">
              <ResultList
                title="Outbound platform clicks"
                empty="No outbound platform clicks yet."
                rows={(data.outboundPlatforms ?? []).map((item) => ({ label: friendlyPlatform(item.platform), value: item.count }))}
              />
            </section>

            {data.truncated ? (
              <p className="mt-6 rounded-xl border border-amber-700/50 bg-amber-950/20 p-4 text-sm text-amber-100">
                This period exceeded the current 50,000-event dashboard read cap. The tracker is still recording; the dashboard aggregation should be upgraded before traffic reaches that scale regularly.
              </p>
            ) : null}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
      <div className="text-3xl font-bold text-orange-400">{value.toLocaleString()}</div>
      <div className="mt-2 text-sm text-gray-400">{label}</div>
    </div>
  );
}

function ResultList({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: Array<{ label: string; sublabel?: string; value: number }>;
  empty: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
      <h2 className="font-cinzel text-xl text-white">{title}</h2>
      <div className="mt-5 space-y-3">
        {rows.length ? rows.map((row) => (
          <div key={`${row.label}-${row.sublabel ?? ''}`} className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-black/40 p-4">
            <div className="min-w-0">
              <div className="font-semibold text-gray-200">{row.label}</div>
              {row.sublabel ? <div className="truncate text-xs text-gray-600">{row.sublabel}</div> : null}
            </div>
            <div className="shrink-0 text-xl font-bold text-orange-400">{row.value.toLocaleString()}</div>
          </div>
        )) : <p className="text-sm text-gray-500">{empty}</p>}
      </div>
    </div>
  );
}

function friendlyPath(path: string) {
  if (path === '/') return 'Home';
  if (path === '/live') return 'Live';
  if (path === '/dashboard') return 'Member Dashboard';
  if (path === '/dashboard/membership') return 'Membership';
  if (path === '/dashboard/subscribe') return 'Subscribe';
  return path
    .split('/')
    .filter(Boolean)
    .map((part) => part.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()))
    .join(' → ');
}

function friendlyEvent(eventName: string) {
  const names: Record<string, string> = {
    live_opened: 'Opened Live',
    membership_opened: 'Opened Membership',
    external_link_click: 'Clicked an external platform',
    show_opened: 'Opened a show',
  };
  return names[eventName] ?? eventName.replace(/_/g, ' ');
}

function friendlyPlatform(platform: string) {
  const names: Record<string, string> = {
    youtube: 'YouTube',
    twitch: 'Twitch',
    zeno: 'Zeno',
    smule: 'Smule',
    facebook: 'Facebook',
    instagram: 'Instagram',
    other: 'Other external sites',
  };
  return names[platform] ?? platform;
}
