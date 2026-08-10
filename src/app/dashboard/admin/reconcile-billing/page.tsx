'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type ReconcileResult = {
  success: boolean;
  error?: string;
  mode?: 'dry-run' | 'apply';
  stripeSubscriptionsScanned?: number;
  activeMembershipCandidates?: number;
  proposed?: Array<{
    userId: string;
    email: string | null;
    tier: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    stripeStatus: string;
    periodEndIso: string | null;
    source: string;
    localState: {
      tier: string | null;
      status: string | null;
      stripe_customer_id: string | null;
      stripe_subscription_id: string | null;
      current_period_end: string | null;
    } | null;
  }>;
  applied?: Array<{ userId: string; email: string | null; tier: string }>;
  activeProfilesWithoutStripeMatch?: Array<{
    userId: string;
    email: string | null;
    tier: string | null;
    status: string | null;
  }>;
  issues?: Array<Record<string, unknown>>;
  note?: string;
};

export default function ReconcileBillingPage() {
  const [result, setResult] = useState<ReconcileResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async (mode: 'dry-run' | 'apply') => {
    if (mode === 'apply') {
      const confirmed = window.confirm(
        'Apply only the unambiguous active Stripe-to-Supabase matches shown by the reconciliation tool? Unmatched or conflicting records will remain unchanged.'
      );
      if (!confirmed) return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/reconcile-stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      const data = (await response.json()) as ReconcileResult;
      setResult(data);
    } catch {
      setResult({ success: false, error: 'Unable to run reconciliation.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-32">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-cinzel text-sm uppercase tracking-[0.25em] text-orange-400">Admin Audit</p>
            <h1 className="mt-2 font-cinzel text-3xl text-white md:text-5xl">Stripe Membership Reconciliation</h1>
          </div>
          <Link href="/dashboard/admin" className="rounded-lg border border-orange-600 px-4 py-2 text-orange-200">
            Back to Admin
          </Link>
        </div>

        <section className="mb-8 rounded-2xl border border-orange-900/60 bg-zinc-950 p-6">
          <p className="leading-relaxed text-gray-300">
            Dry Run reads live Stripe subscriptions and compares them with Supabase without changing data. Apply backfills only
            unambiguous active or trialing memberships. Conflicts, unknown prices, and unmatched profiles are reported and left alone.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => void run('dry-run')}
              className="rounded-xl bg-orange-700 px-5 py-3 font-cinzel text-sm uppercase tracking-wider text-white disabled:opacity-50"
            >
              {loading ? 'Working…' : 'Run Dry Audit'}
            </button>
            <button
              type="button"
              disabled={loading || !result?.success || result.mode !== 'dry-run'}
              onClick={() => void run('apply')}
              className="rounded-xl border border-red-600 px-5 py-3 font-cinzel text-sm uppercase tracking-wider text-red-200 disabled:opacity-40"
            >
              Apply Verified Matches
            </button>
          </div>
        </section>

        {result && (
          <section className="space-y-6">
            {!result.success ? (
              <div className="rounded-xl border border-red-700 bg-red-950/40 p-5 text-red-100">{result.error}</div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <Stat label="Stripe subscriptions scanned" value={result.stripeSubscriptionsScanned ?? 0} />
                  <Stat label="Active membership matches" value={result.activeMembershipCandidates ?? 0} />
                  <Stat label="Applied this run" value={result.applied?.length ?? 0} />
                </div>

                <ResultBlock title="Proposed / Matched Memberships" count={result.proposed?.length ?? 0}>
                  {(result.proposed ?? []).map((item) => (
                    <div key={item.stripeSubscriptionId} className="rounded-lg border border-white/10 bg-black/40 p-4 text-sm">
                      <div className="font-semibold text-orange-300">{item.email ?? item.userId}</div>
                      <div className="mt-1 text-gray-300">{item.tier} • Stripe {item.stripeStatus} • linked by {item.source}</div>
                      <div className="mt-1 break-all text-xs text-gray-500">{item.stripeSubscriptionId}</div>
                      <div className="mt-2 text-xs text-gray-400">
                        Local before audit: {item.localState?.tier ?? 'none'} / {item.localState?.status ?? 'none'} / subscription ID {item.localState?.stripe_subscription_id ?? 'missing'}
                      </div>
                    </div>
                  ))}
                </ResultBlock>

                <ResultBlock title="Active Profiles Without a Stripe Match" count={result.activeProfilesWithoutStripeMatch?.length ?? 0}>
                  {(result.activeProfilesWithoutStripeMatch ?? []).map((item) => (
                    <div key={item.userId} className="rounded-lg border border-amber-700/50 bg-amber-950/20 p-4 text-sm">
                      <div className="font-semibold text-amber-200">{item.email ?? item.userId}</div>
                      <div className="text-gray-300">{item.tier} • {item.status}</div>
                    </div>
                  ))}
                </ResultBlock>

                <ResultBlock title="Issues Left Unchanged" count={result.issues?.length ?? 0}>
                  {(result.issues ?? []).map((issue, index) => (
                    <pre key={index} className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-red-900/50 bg-black/50 p-4 text-xs text-red-100">
                      {JSON.stringify(issue, null, 2)}
                    </pre>
                  ))}
                </ResultBlock>

                {result.note && <p className="rounded-xl border border-orange-900/50 bg-orange-950/20 p-4 text-orange-100">{result.note}</p>}
              </>
            )}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950 p-5">
      <div className="text-3xl font-bold text-orange-400">{value}</div>
      <div className="mt-2 text-sm text-gray-400">{label}</div>
    </div>
  );
}

function ResultBlock({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
      <h2 className="mb-4 font-cinzel text-xl text-white">{title} <span className="text-orange-400">({count})</span></h2>
      <div className="space-y-3">{count ? children : <p className="text-sm text-gray-500">None.</p>}</div>
    </div>
  );
}
