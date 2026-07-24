'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { createClient } from '@/utils/supabase/client';
import { compareTierOrder, getPublicMembershipTiers, validateTierName, type TierName } from '@/utils/membership';
import { useRouter } from 'next/navigation';

type MembershipProfile = { subscription_tier: string | null; subscription_status: string | null };
type ApiResponse = { sessionId?: string; url?: string; error?: string; code?: string; outcome?: 'completed' | 'pending_payment'; noOp?: boolean };
type Notice = { type: 'error' | 'info' | 'success'; message: string };

const tiers = getPublicMembershipTiers();

function displayedTier(value: string | null | undefined) {
  return value && value !== 'none' ? value : 'Seeker';
}

function displayedStatus(value: string | null | undefined) {
  return value && value !== 'inactive' ? value : 'inactive';
}

function membershipState(tier: string, status: string) {
  const canonicalTier = validateTierName(tier).ok;
  const canChangePlan = canonicalTier && (status === 'active' || status === 'trialing');
  const terminalStatus = status === 'canceled' || status === 'inactive' || status === 'incomplete_expired';
  const hasExistingPaidMembership = canonicalTier && !terminalStatus;
  return {
    canChangePlan,
    hasExistingPaidMembership,
    canStartNewCheckout: !canonicalTier || terminalStatus,
    needsBillingAttention: canonicalTier && !canChangePlan && !terminalStatus,
  };
}

async function readResponse(response: Response): Promise<ApiResponse> {
  try { return await response.json() as ApiResponse; } catch { return {}; }
}

export default function MembershipPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [currentTier, setCurrentTier] = useState('Seeker');
  const [currentStatus, setCurrentStatus] = useState('inactive');
  const [selectedTier, setSelectedTier] = useState<TierName | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const { canChangePlan, canStartNewCheckout, needsBillingAttention } = membershipState(currentTier, currentStatus);
  const hasPaidMembership = canChangePlan;
  const processing = processingAction;
  const setProcessing = setProcessingAction;

  const refreshMembership = useCallback(async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      router.replace(`/login?returnTo=${encodeURIComponent('/dashboard/membership')}`);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status')
      .eq('id', user.id)
      .maybeSingle();
    if (error) {
      setNotice({ type: 'error', message: 'We could not load your current membership. Please try again.' });
    } else {
      const profile = data as MembershipProfile | null;
      setCurrentTier(displayedTier(profile?.subscription_tier));
      setCurrentStatus(displayedStatus(profile?.subscription_status));
    }
    setLoading(false);
  }, [router, supabase]);

  useEffect(() => { void refreshMembership(); }, [refreshMembership]);

  const selected = useMemo(() => tiers.find((tier) => tier.name === selectedTier) ?? null, [selectedTier]);

  const startCheckout = async (tierName: TierName) => {
    if (!canStartNewCheckout) {
      setNotice({ type: 'info', message: 'Please resolve your current billing status before starting a new membership.' });
      return;
    }
    if (processing) return;
    setProcessing(tierName); setNotice(null);
    try {
      const response = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tierName }) });
      const result = await readResponse(response);
      if (response.status === 401) { router.replace(`/login?returnTo=${encodeURIComponent('/dashboard/membership')}`); return; }
      if (!response.ok || !result.url) {
        setNotice({ type: 'error', message: result.error ?? 'Unable to start checkout. Please try again.' });
        return;
      }
      window.location.assign(result.url);
    } catch {
      setNotice({ type: 'error', message: 'Unable to start checkout. Please try again.' });
    } finally { setProcessing(null); }
  };

  const confirmChange = async () => {
    if (!selectedTier || processing) return;
    setProcessing('change'); setNotice(null);
    try {
      const response = await fetch('/api/subscription/change', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetTier: selectedTier }) });
      const result = await readResponse(response);
      if (!response.ok) {
        setNotice({ type: 'error', message: result.error ?? 'Unable to change your membership. Please try again.' });
        return;
      }
      setSelectedTier(null);
      setNotice(result.outcome === 'pending_payment'
        ? { type: 'info', message: 'Your plan change is awaiting payment confirmation. Complete any requested payment step in billing management; your membership updates once confirmed.' }
        : { type: 'success', message: result.noOp ? 'You are already on this membership.' : 'Your plan change was submitted. Your membership will refresh after Stripe confirms it.' });
      // This only re-reads the webhook-authoritative profile; it never grants access in the browser.
      await refreshMembership();
    } catch {
      setNotice({ type: 'error', message: 'Unable to change your membership. Please try again.' });
    } finally { setProcessing(null); }
  };

  const openBillingPortal = async () => {
    if (processing) return;
    setProcessing('billing'); setNotice(null);
    try {
      const response = await fetch('/api/billing-portal', { method: 'POST' });
      const result = await readResponse(response);
      if (!response.ok || !result.url) {
        setNotice({ type: 'error', message: result.error ?? 'Unable to open billing management. Please try again.' });
        return;
      }
      window.location.assign(result.url);
    } catch { setNotice({ type: 'error', message: 'Unable to open billing management. Please try again.' }); }
    finally { setProcessing(null); }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-orange-400 font-cinzel">Loading your membership…</div>;

  return <div className="min-h-screen bg-black text-gray-100 font-cormorant">
    <Header />
    <main className="pt-32 pb-20 px-4 md:px-10 max-w-7xl mx-auto">
      <section className="text-center mb-10">
        <p className="font-cinzel text-orange-400 uppercase tracking-[0.25em] text-sm">Membership</p>
        <h1 className="font-cinzel text-4xl md:text-6xl text-white mt-3">Keep the Fire Burning</h1>
      </section>

      <section className="rounded-3xl border border-orange-800/60 bg-gradient-to-br from-orange-950/40 to-black p-6 md:p-8 mb-8 flex flex-col md:flex-row md:items-center gap-6 justify-between">
        <div><p className="font-cinzel text-sm text-orange-300 uppercase tracking-widest">Current Membership</p><h2 className="font-cinzel text-3xl text-white mt-2">{currentTier}</h2><p className="text-gray-300 mt-2">Current billing status: <span className="capitalize">{currentStatus.replaceAll('_', ' ')}</span></p></div>
        {hasPaidMembership && <button type="button" onClick={() => void openBillingPortal()} disabled={processing !== null} className="rounded-xl border border-orange-500 px-5 py-3 font-cinzel text-sm uppercase tracking-wider text-orange-200 hover:bg-orange-900/50 disabled:opacity-50">{processing === 'billing' ? 'Opening…' : 'Manage Payment Method, Invoices, or Cancellation'}</button>}
      </section>

      {needsBillingAttention && <div className="mb-8 rounded-xl border border-amber-500/60 bg-amber-950/40 p-4 text-center text-amber-100"><p>Your membership needs billing attention before you can change plans. Please use billing management to update payment details or resolve the current status.</p><button type="button" onClick={() => void openBillingPortal()} disabled={processingAction !== null} className="mt-4 rounded-lg border border-amber-300 px-4 py-2 font-cinzel text-xs uppercase tracking-wider disabled:opacity-50">Manage Billing</button></div>}

      {notice && <div className={`mb-8 rounded-xl border p-4 text-center ${notice.type === 'error' ? 'border-red-600/60 bg-red-950/40 text-red-100' : 'border-orange-500/60 bg-orange-950/40 text-orange-100'}`}>{notice.message}</div>}

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const isCurrent = canChangePlan && tier.name === currentTier;
          const changeLabel = needsBillingAttention
            ? 'Resolve Billing First'
            : canChangePlan
              ? (compareTierOrder(tier.name, currentTier as TierName) > 0 ? `Upgrade to ${tier.name}` : `Switch to ${tier.name}`)
              : `Choose ${tier.name}`;
          return <article key={tier.name} className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 p-7 flex flex-col">
            <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url('${tier.image}')` }} />
            <div className="relative flex flex-col h-full"><div className="flex justify-between gap-3"><h2 className="font-cinzel text-2xl text-white">{tier.name}</h2>{isCurrent && <span className="h-fit rounded-full bg-orange-500/20 px-3 py-1 text-xs text-orange-200">Current tier</span>}</div>
            <p className="text-orange-300 italic mt-3">{tier.intro}</p><p className="text-4xl font-bold my-5">${tier.monthlyAmount / 100}<span className="text-base text-gray-400"> / month</span></p><p className="text-gray-200">{tier.description}</p>
            <ul className="my-6 space-y-2 flex-grow">{tier.benefits.map((benefit) => <li key={benefit} className="text-gray-300">◇ {benefit}</li>)}</ul>
            <button type="button" disabled={isCurrent || processing !== null} onClick={() => hasPaidMembership ? setSelectedTier(tier.name) : void startCheckout(tier.name)} className={`w-full rounded-xl py-3 px-4 font-cinzel text-sm uppercase tracking-wider text-white bg-gradient-to-r ${tier.color} disabled:cursor-not-allowed disabled:opacity-50`}>{isCurrent ? 'Your Current Plan' : processing === tier.name ? 'Opening Checkout…' : changeLabel}</button></div>
          </article>;
        })}
      </section>

      <section className="mt-12 text-center border-t border-orange-900/50 pt-10"><h2 className="font-cinzel text-2xl text-white">One-Time Contribution</h2><p className="text-gray-300 mt-2">One-time PayPal support is separate from recurring membership.</p><a href="https://www.paypal.me/brindlewolf" target="_blank" rel="noopener noreferrer" className="inline-block mt-5 rounded-xl bg-blue-700 px-6 py-3 font-cinzel text-sm uppercase tracking-wider">Donate via PayPal</a></section>
    </main>
    {selected && <div role="dialog" aria-modal="true" aria-labelledby="change-plan-heading" className="fixed inset-0 z-[200] bg-black/80 p-4 flex items-center justify-center"><div className="max-w-lg w-full rounded-2xl border border-orange-600/70 bg-zinc-950 p-7 shadow-2xl"><h2 id="change-plan-heading" className="font-cinzel text-2xl text-white">Confirm membership change</h2><p className="mt-5 text-gray-200">Changing from <strong>{currentTier}</strong> to <strong>{selected.name}</strong>.</p><p className="mt-2 text-2xl text-orange-300">${selected.monthlyAmount / 100} / month</p><p className="mt-4 text-gray-300">Stripe may apply a prorated charge or credit for the time remaining in your current billing period.</p><div className="mt-7 flex justify-end gap-3"><button type="button" disabled={processing !== null} onClick={() => setSelectedTier(null)} className="px-4 py-2 text-gray-300">Cancel</button><button type="button" disabled={processing !== null} onClick={() => void confirmChange()} className="rounded-lg bg-orange-600 px-5 py-2 font-cinzel text-white disabled:opacity-50">{processing === 'change' ? 'Confirming…' : 'Confirm plan change'}</button></div></div></div>}
    <Footer />
  </div>;
}
