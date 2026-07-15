'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

// Copying your established tiers
const subscriptionTiers = [
  { 
    name: "Keepers of the Embers", 
    price: "5", 
    intro: "Believe in independent voices. Help fuel the RISE journey.", 
    description: "This tier is pure support. Your commitment is the spark that keeps the signal blazing across radio and streaming platforms.", 
    perks: ["Access to community posts feed", "Digital supporter recognition", "Ember Keeper identity badge"], 
    color: "from-orange-500 to-orange-700",
    image: "/images/jmc-edits-palettes/keepers-of-the-embers.png"
  },
  { 
    name: "Flame Bearers", 
    price: "15", 
    intro: "Deepen your connection. Guide the community fire.", 
    description: "For listeners who want to be closer to the heart of the conversation and play an active role in how RISE grows.", 
    perks: ["Exclusive 'Awareness Insights'", "Priority voting on show themes", "Ad-free show archives"], 
    color: "from-orange-400 to-red-600",
    image: "/images/jmc-edits-palettes/flame-bearers.png"
  },
  { 
    name: "Phoenix Circle", 
    price: "33", 
    intro: "Exclusive access. Direct broadcast impact.", 
    description: "Where awareness meets true impact. This is for our most dedicated inner community with direct interaction.", 
    perks: ["Monthly 'Fireside' livestream", "Monthly on-air shout-out", "Zoom workshops access"], 
    color: "from-yellow-400 to-orange-500",
    image: "/images/jmc-edits-palettes/phoenix-circle.png"
  },
  { 
    name: "Wings of the Phoenix", 
    price: "75", 
    intro: "The Infrastructure Force.", 
    description: "Legacy building. Support the funding of technology, physical studios, and expansion onto new platforms.", 
    perks: ["Quarterly Executive Council Calls", "Phoenix Vision Insight Letters", "Highest priority for submissions"], 
    color: "from-red-500 to-orange-600",
    image: "/images/jmc-edits-palettes/wings-of-the-phoenix.png"
  },
  { 
    name: "Phoenix Ascending", 
    price: "150", 
    intro: "The Vanguard. Supporting the highest vision.", 
    description: "The absolute highest commitment. Patrons of the arts ensuring long-term stability and full potential.", 
    perks: ["Annual 1-on-1 virtual call", "Private annual virtual gathering", "Executive-level recognition"], 
    color: "from-yellow-200 via-orange-400 to-red-700",
    image: "/images/jmc-edits-palettes/phoenix-ascending.png"
  }
];

type MembershipProfile = {
  subscription_tier: string | null;
  subscription_status: string | null;
};

type ApiResponse = {
  sessionId?: string;
  url?: string;
  error?: string;
  code?: string;
};

type Notice = {
  type: 'error' | 'info';
  message: string;
};

const PAID_TIER_NAMES = new Set(subscriptionTiers.map((tier) => tier.name));

function isActivePaidMembership(tier: string, status: string) {
  return status === 'active' && PAID_TIER_NAMES.has(tier);
}

function normalizeDisplayedTier(tier: string | null | undefined) {
  if (!tier || tier.toLowerCase() === 'none') {
    return 'Seeker';
  }

  return tier;
}

function normalizeDisplayedStatus(status: string | null | undefined) {
  if (!status || status.toLowerCase() === 'inactive') {
    return 'inactive';
  }

  return status;
}

async function readApiResponse(response: Response): Promise<ApiResponse> {
  try {
    return (await response.json()) as ApiResponse;
  } catch {
    return {};
  }
}

function getCheckoutFailureMessage(response: ApiResponse) {
  switch (response.code) {
    case 'ACTIVE_SUBSCRIPTION_EXISTS':
      return 'You already have an active paid membership. Please use billing management instead.';
    case 'CHECKOUT_ALREADY_PENDING':
      return 'A membership checkout is already pending. Please finish or abandon that checkout before starting another.';
    case 'SUBSCRIPTION_PROCESSING':
      return 'Your membership is still processing. Please wait a few minutes before trying again.';
    case 'BILLING_VERIFICATION_FAILED':
      return 'We could not verify your billing status right now. Please try again shortly.';
    default:
      return response.error ?? 'Unable to start checkout. Please try again.';
  }
}

export default function DonateTierPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoadingMembership, setIsLoadingMembership] = useState(true);
  const [currentTier, setCurrentTier] = useState('Seeker');
  const [currentStatus, setCurrentStatus] = useState('inactive');
  const [notice, setNotice] = useState<Notice | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  const userHasActivePaidMembership = useMemo(
    () => isActivePaidMembership(currentTier, currentStatus),
    [currentTier, currentStatus]
  );

  useEffect(() => {
    let isMounted = true;

    const loadMembership = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (userError) {
        setNotice({
          type: 'error',
          message: 'We could not verify your sign-in. Please log in again.',
        });
        setIsLoadingMembership(false);
        return;
      }

      if (!user) {
        router.replace(`/login?returnTo=${encodeURIComponent('/dashboard/donate')}`);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status')
        .eq('id', user.id)
        .maybeSingle();

      if (!isMounted) return;

      if (profileError) {
        setNotice({
          type: 'error',
          message: 'We could not load your current membership. Please try again.',
        });
        setIsLoadingMembership(false);
        return;
      }

      const membershipProfile = profile as MembershipProfile | null;
      setCurrentTier(normalizeDisplayedTier(membershipProfile?.subscription_tier));
      setCurrentStatus(normalizeDisplayedStatus(membershipProfile?.subscription_status));
      setIsLoadingMembership(false);
    };

    void loadMembership();

    return () => {
      isMounted = false;
    };
  }, [router, supabase]);
  
  const handleCheckout = async (tierName: string) => {
    if (processingAction) return;

    if (userHasActivePaidMembership) {
      setNotice({
        type: 'info',
        message: 'You already have an active paid membership. Use billing management to change plans.',
      });
      return;
    }

    setProcessingAction(tierName);
    setNotice(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierName }),
      });
      
      const resData = await readApiResponse(response);

      if (response.status === 401) {
        router.replace(`/login?returnTo=${encodeURIComponent('/dashboard/donate')}`);
        return;
      }

      if (!response.ok) {
        setNotice({
          type: 'error',
          message: getCheckoutFailureMessage(resData),
        });
        return;
      }

      if (!resData.sessionId) {
        setNotice({
          type: 'error',
          message: 'Checkout did not return a valid session. Please try again.',
        });
        return;
      }

      if (!resData.url) {
        setNotice({
          type: 'error',
          message: 'Checkout did not return a valid redirect link. Please try again.',
        });
        return;
      }

      window.location.assign(resData.url);
    } catch (err) {
      console.error("Stripe Error:", err);
      setNotice({
        type: 'error',
        message: 'Unable to start checkout. Please try again.',
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleBillingPortal = async () => {
    if (processingAction) return;

    setProcessingAction('billing-portal');
    setNotice(null);

    try {
      const response = await fetch('/api/billing-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const resData = await readApiResponse(response);

      if (response.status === 401) {
        router.replace(`/login?returnTo=${encodeURIComponent('/dashboard/donate')}`);
        return;
      }

      if (!response.ok) {
        setNotice({
          type: 'error',
          message: resData.error ?? 'Unable to open billing management. Please try again.',
        });
        return;
      }

      if (!resData.url) {
        setNotice({
          type: 'error',
          message: 'Billing management did not return a valid link. Please try again.',
        });
        return;
      }

      window.location.assign(resData.url);
    } catch (err) {
      console.error("Billing Portal Error:", err);
      setNotice({
        type: 'error',
        message: 'Unable to open billing management. Please try again.',
      });
    } finally {
      setProcessingAction(null);
    }
  };

  if (isLoadingMembership) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-orange-500 font-cinzel text-xl animate-pulse">
        Gathering your membership...
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-200 flex flex-col relative bg-cover bg-center bg-fixed font-cormorant" 
         style={{ backgroundImage: "url('/images/phoenix-revised.png')" }}>
      <Header />
      <main className="flex-grow flex flex-col items-center pt-32 pb-20 px-4 relative z-10">
        <h1 className="text-5xl md:text-7xl font-cinzel font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-yellow-500 drop-shadow-[0_5px_15px_rgba(255,69,0,0.4)]">
          {userHasActivePaidMembership ? 'Manage Membership' : 'Tiers of Light'}
        </h1>
        <div className="w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent mb-16 shadow-[0_0_10px_rgba(255,165,0,0.8)]" />

        <section className="w-full max-w-4xl mb-12 bg-black/60 backdrop-blur-md border border-orange-900/40 rounded-2xl p-6 md:p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
          <p className="font-cinzel text-xs uppercase tracking-[0.3em] text-orange-400/80 mb-3">
            Current Membership
          </p>
          <h2 className="font-cinzel text-2xl md:text-4xl text-white mb-2">{currentTier}</h2>
          <p className="text-gray-300 text-lg italic mb-6">
            Status: <span className="text-orange-300">{currentStatus}</span>
          </p>

          {userHasActivePaidMembership ? (
            <div className="flex flex-col items-center gap-5">
              <p className="text-gray-200 text-lg md:text-xl max-w-2xl leading-relaxed">
                Stripe securely handles plan changes, cancellation, payment methods, and invoices.
              </p>
              <button
                type="button"
                onClick={handleBillingPortal}
                disabled={processingAction !== null}
                className="bg-gradient-to-r from-orange-700 to-red-700 text-white px-8 md:px-12 py-4 rounded-xl font-cinzel text-base md:text-xl tracking-[0.15em] uppercase font-bold transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingAction === 'billing-portal' ? 'Opening Billing...' : 'Manage Membership and Billing'}
              </button>
            </div>
          ) : (
            <p className="text-gray-200 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Choose a paid tier below to upgrade your Seeker membership.
            </p>
          )}
        </section>

        {notice && (
          <div
            className={`w-full max-w-4xl mb-10 rounded-xl border px-5 py-4 text-center font-cinzel text-sm uppercase tracking-widest ${
              notice.type === 'error'
                ? 'border-red-500/50 bg-red-950/40 text-red-200'
                : 'border-orange-500/50 bg-orange-950/40 text-orange-100'
            }`}
          >
            {notice.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl px-4">
          {subscriptionTiers.map((tier) => (
            <div key={tier.name} className="relative group overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md transition-all duration-500 hover:scale-[1.02] hover:border-orange-500/50 flex flex-col shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              {/* Background Image Layer with 55% Opacity as requested previously */}
              <div 
                className="absolute inset-0 z-0 opacity-55 transition-opacity duration-500 group-hover:opacity-75 bg-cover bg-center"
                style={{ backgroundImage: `url('${tier.image}')` }}
              />
              {/* Darkening Gradient Overlay */}
              <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/40 via-black/80 to-black" />

              <div className="relative z-10 p-8 flex flex-col h-full items-center text-center">
                <h3 className="text-2xl font-cinzel font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-orange-400 font-bold text-lg italic mb-4">{tier.intro}</p>
                <div className="text-4xl font-bold mb-4">${tier.price}<span className="text-sm font-normal text-gray-400">/mo</span></div>
                <p className="text-gray-200 text-lg font-medium italic mb-6 leading-relaxed">{tier.description}</p>
                <ul className="text-left space-y-3 mb-8 flex-grow">
                  {tier.perks.map((perk, i) => (
                    <li key={i} className="flex items-start text-gray-100 text-lg font-medium">
                      <span className="text-orange-500 mr-2 mt-1">◆</span>
                      {perk}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => {
                    if (userHasActivePaidMembership) {
                      void handleBillingPortal();
                      return;
                    }

                    void handleCheckout(tier.name);
                  }}
                  disabled={processingAction !== null}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg bg-gradient-to-r ${tier.color} text-white hover:brightness-110 active:scale-[0.98] uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {userHasActivePaidMembership
                    ? 'Manage Membership'
                    : processingAction === tier.name
                      ? 'Opening Checkout...'
                      : `Upgrade to ${tier.name}`}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* PayPal One-Time Donation Section */}
        <div className="mt-20 flex flex-col items-center w-full max-w-4xl px-4">
          <h2 className="text-3xl md:text-4xl font-cinzel font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 drop-shadow-[0_2px_10px_rgba(0,112,186,0.3)] text-center">
            One-Time Contribution
          </h2>
          <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent mb-8 shadow-[0_0_10px_rgba(0,112,186,0.5)]" />
          <p className="text-gray-200 text-xl font-medium italic mb-8 text-center max-w-2xl leading-relaxed">
            Prefer to make a single contribution? Support the network directly via PayPal.
          </p>
          <a 
            href="https://www.paypal.me/brindlewolf" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-gradient-to-r from-[#0070ba] to-[#005ea6] hover:brightness-110 text-white font-bold py-4 px-12 rounded-xl transition-all duration-300 shadow-[0_10px_20px_rgba(0,112,186,0.4)] hover:scale-105 active:scale-95 uppercase tracking-wider flex items-center justify-center text-lg"
          >
            Donate via PayPal
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
