'use client';

import PushNotificationButton from '@/components/PushNotificationButton';
import React, { useState, useEffect, Suspense, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import GlobalZenoPlayer from '@/components/GlobalZenoPlayer';

type CheckoutApiResponse = {
  sessionId?: string;
  url?: string;
  error?: string;
  code?: string;
};

const PAID_TIER_NAMES = new Set([
  'Keepers of the Embers',
  'Flame Bearers',
  'Phoenix Circle',
  'Wings of the Phoenix',
  'Phoenix Ascending',
]);

function normalizeDashboardTier(tier: string | null | undefined) {
  if (!tier || tier.toLowerCase() === 'none') {
    return 'seeker';
  }

  return tier;
}

function formatDashboardTier(tier: string) {
  return tier === 'seeker' ? 'Seeker' : tier;
}

function isActivePaidMembership(tier: string, status: string) {
  return status === 'active' && PAID_TIER_NAMES.has(tier);
}

async function readCheckoutApiResponse(response: Response): Promise<CheckoutApiResponse> {
  try {
    return (await response.json()) as CheckoutApiResponse;
  } catch {
    return {};
  }
}

function DashboardContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userTier, setUserTier] = useState<string>('seeker'); 
  const [userSubscriptionStatus, setUserSubscriptionStatus] = useState<string>('inactive');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoCheckoutTierRef = useRef<string | null>(null);
  const userHasActivePaidMembership = isActivePaidMembership(userTier, userSubscriptionStatus);
  
  // Removed the unused userRole state to satisfy the linter

  // 1. SESSION & DATA FETCHING
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);

      if (session?.user) {
        setUserEmail(session.user.email ?? null);

        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier, subscription_status, role')
          .eq('id', session.user.id)
          .single();
          
        if (profile) {
          setUserTier(normalizeDashboardTier(profile.subscription_tier));
          setUserSubscriptionStatus(profile.subscription_status || 'inactive');
          // We removed setUserRole here since it was causing the unused variable error
        }
      }
      setLoading(false);
    };
    checkSession();
  }, [supabase]);

  // 2. THE AUTO-CHECKOUT LISTENER
  useEffect(() => {
    const triggerCheckout = async () => {
      const tierSlug = searchParams.get('trigger_checkout');
      
      if (!tierSlug || loading) return; 

      if (autoCheckoutTierRef.current === tierSlug) return;
      
      if (!isLoggedIn || !userEmail) {
        router.replace(`/login?trigger_checkout=${encodeURIComponent(tierSlug)}`);
        return;
      }

      const tierMap: Record<string, string> = {
        'keepers-of-the-embers': 'Keepers of the Embers',
        'flame-bearers': 'Flame Bearers',
        'phoenix-circle': 'Phoenix Circle',
        'wings-of-the-phoenix': 'Wings of the Phoenix',
        'phoenix-ascending': 'Phoenix Ascending'
      };

      const tierName = tierMap[tierSlug];
      if (!tierName) return;

      autoCheckoutTierRef.current = tierSlug;
      setCheckoutNotice(null);

      try {
        console.log("🚀 Triggering Stripe for:", userEmail);
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tierName }),
        });

        const resData = await readCheckoutApiResponse(response);

        if (response.status === 401) {
          autoCheckoutTierRef.current = null;
          router.replace(`/login?trigger_checkout=${encodeURIComponent(tierSlug)}`);
          return;
        }

        if (!response.ok) {
          setCheckoutNotice(
            resData.code === 'ACTIVE_SUBSCRIPTION_EXISTS'
              ? 'You already have an active paid membership. Use Manage Membership for billing changes.'
              : resData.error ?? 'Unable to start checkout. Please try again from the membership page.'
          );
          return;
        }

        if (!resData.sessionId) {
          setCheckoutNotice('Checkout did not return a valid session. Please try again.');
          return;
        }

        if (!resData.url) {
          setCheckoutNotice('Checkout did not return a valid redirect link. Please try again.');
          return;
        }

        window.location.assign(resData.url);
      } catch (err) {
        console.error("Auto-checkout failed:", err);
        setCheckoutNotice('Unable to start checkout. Please try again from the membership page.');
      }
    };

    triggerCheckout();
  }, [loading, isLoggedIn, router, searchParams, userEmail]);

  const schedule = [
    { name: "The Bloom", day: "Mondays", time: "11:00 AM EST", href: "/dashboard/the-bloom"},
    { name: "Brindle's Vision", day: "Mondays", time: "6:00 PM EST", href: "/dashboard/brindles-vision" },
    { name: "Phoenix Talks", day: "Wednesdays", time: "6:00 PM EST", href: "/dashboard/phoenix-talks" },
    { name: "Honky Tonk Heaven", day: "Wednesdays", time: "9:00 PM EST", href: "/dashboard/honky-tonk-heaven" },
    { name: "The CORE", day: "Thursdays", time: "11:00 AM EST", href: "/dashboard/the-core" },
    { name: "Defining Your Character", day: "Thursdays", time: "5:00 PM EST", href: "/dashboard/defining-your-character"},
    { name: "Mystic Mist", day: "Sundays", time: "Coming May 10", href: "/dashboard/mystic-mist" },
  ];

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-orange-500 font-cinzel text-xl animate-pulse">Entering the Sanctuary...</div>;
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-black font-cormorant text-gray-200 overflow-x-hidden">

      {/* FIXED PHOENIX BACKGROUND */}
      <div className="fixed inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-30">
          <source src="/images/jmc-edits-palettes/phoenix-arriving.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow flex flex-col items-center pt-28 md:pt-40 pb-12 px-4 md:px-12 w-full">

          {/* ALERTS BUTTON: Placed at the top level so it can float freely! */}
        <PushNotificationButton />

          {checkoutNotice && (
            <div className="w-full max-w-4xl mb-8 rounded-xl border border-red-500/50 bg-red-950/40 px-5 py-4 text-center font-cinzel text-sm uppercase tracking-widest text-red-200">
              {checkoutNotice}
            </div>
          )}

          {isLoggedIn && (
            <section className="w-full max-w-7xl mb-8 rounded-2xl border border-orange-700/50 bg-black/70 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-cinzel text-xs uppercase tracking-[0.2em] text-orange-300">Membership</p>
                <p className="font-cinzel text-xl text-white mt-1">{formatDashboardTier(userTier)} <span className="text-sm text-gray-400">• {userSubscriptionStatus.replaceAll('_', ' ')}</span></p>
              </div>
              <Link href="/dashboard/membership" className="inline-flex justify-center rounded-xl bg-gradient-to-r from-orange-700 to-red-700 px-5 py-3 font-cinzel text-sm uppercase tracking-wider text-white">Change Membership</Link>
            </section>
          )}
          
          {/* HERO SECTION - THE TRINITY */}
          <div className="w-full max-w-7xl flex flex-col md:flex-row gap-8 md:gap-12 justify-center mb-12">
            
            {/* THE SANCTUARY */}
            <Link href={isLoggedIn ? `/sanctuary/${userTier.toLowerCase().replace(/ /g, '-')}` : '/login'} 
              className="flex-1 group">
              <div className="relative aspect-square rounded-3xl overflow-hidden border border-orange-500/30 shadow-[0_0_30px_rgba(234,88,12,0.15)] bg-neutral-900 transition-all duration-500 group-hover:border-orange-500 group-hover:shadow-[0_0_50px_rgba(234,88,12,0.3)]">
                <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity">
                  <source src="/images/jmc-edits-palettes/embers-new-logo.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-8 md:p-12">
                  <h2 className="font-cinzel text-2xl md:text-3xl lg:text-4xl text-orange-400 tracking-[0.2em] uppercase">The Sanctuary</h2>
                  <p className="text-orange-500/60 font-cinzel text-[10px] md:text-xs tracking-widest mt-2 uppercase">Step into your room</p>
                </div>
              </div>
            </Link>

            {/* THE STATION */}
            <Link href="/dashboard/station" className="flex-1 group">
              <div className="relative aspect-square rounded-3xl overflow-hidden border border-red-500/30 shadow-[0_0_30px_rgba(220,38,38,0.15)] bg-neutral-900 transition-all duration-500 group-hover:border-red-600 group-hover:shadow-[0_0_50px_rgba(220,38,38,0.3)]">
                <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity">
                  <source src="/images/jmc-edits-palettes/rise-radio-bg.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-8 md:p-12">
                  <h2 className="font-cinzel text-2xl md:text-3xl lg:text-4xl text-red-600 tracking-[0.2em] uppercase">The Station</h2>
                  <p className="text-red-600/60 font-cinzel text-[10px] md:text-xs tracking-widest mt-2 uppercase">Tune in live</p>
                </div>
              </div>
            </Link>
          </div>



          <div className="w-full max-w-5xl flex flex-col gap-12 mb-24">
            <div className="bg-black/60 backdrop-blur-md border border-orange-900/30 p-10 md:p-16 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-orange-600"></div>
                <h3 className="font-cinzel text-orange-500 text-xl md:text-2xl mb-8 tracking-widest uppercase">The Spark</h3>
                <p className="text-gray-200 mb-8 italic text-2xl md:text-4xl font-bold leading-tight max-w-4xl">
                  &ldquo;RISE Radio isn&apos;t just a station. It&apos;s a community where singers come to be heard, feel something, and connect through music.&rdquo;
                </p>
                <p className="text-gray-400 text-lg md:text-xl font-cinzel tracking-widest uppercase">Fueling the fire of independent connection.</p>
            </div>

            <div className="bg-black/60 backdrop-blur-md border border-red-900/30 p-10 md:p-16 rounded-[2.5rem] shadow-2xl">
              <h3 className="font-cinzel text-red-500 text-xl md:text-2xl mb-8 tracking-widest uppercase">Frequencies</h3>
              <div className="w-full">
                <GlobalZenoPlayer className="rounded-2xl" />
              </div>
            </div>
          </div>

          <div className="w-full max-w-7xl mx-auto mb-24 px-4">
            <h2 className="text-4xl md:text-6xl font-cinzel-decorative font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-16 drop-shadow-[0_0_15px_rgba(255,0,0,0.3)] uppercase tracking-tighter">
              Network Schedule
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {schedule.map((show, index) => (
                <Link 
                  key={index} 
                  href={show.href} 
                  className="bg-black/40 border border-orange-900/30 p-6 md:p-10 rounded-3xl hover:border-orange-500/50 hover:bg-orange-900/10 transition-all duration-500 group"
                >
                  <h3 className="font-cinzel font-bold text-orange-400 text-xl md:text-3xl mb-4 group-hover:text-orange-300 transition-colors uppercase tracking-wider">{show.name}</h3>
                  <div className="text-base md:text-xl text-gray-400 font-cormorant flex flex-col gap-2 italic">
                    <span className="flex items-center gap-3">📅 {show.day}</span>
                    <span className="flex items-center gap-3">⏰ {show.time}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <section className="w-full max-w-7xl bg-gradient-to-b from-orange-950/20 to-black/80 border border-orange-900/40 py-20 px-8 text-center rounded-[4rem] mb-24 shadow-2xl">
            <h3 className="font-cinzel text-4xl md:text-7xl text-orange-500 mb-8 uppercase tracking-widest">Ascend the Embers</h3>
            {isLoggedIn && (
              <p className="font-cinzel text-xs md:text-sm uppercase tracking-[0.3em] text-orange-300/80 mb-5">
                Current Membership: {formatDashboardTier(userTier)}
              </p>
            )}
            <p className="text-xl md:text-3xl italic text-gray-300 mb-14 max-w-4xl mx-auto font-cormorant leading-relaxed">
              Unlock the secrets of the Sanctuary and fuel independent voices.
            </p>
            <Link href="/dashboard/membership" className="inline-block bg-gradient-to-r from-orange-700 to-red-700 text-white px-12 md:px-24 py-5 md:py-8 rounded-full font-cinzel text-xl md:text-3xl tracking-[0.2em] transition-all hover:scale-105 active:scale-95 uppercase font-bold shadow-[0_0_50px_rgba(234,88,12,0.3)]">
              {userHasActivePaidMembership ? 'Manage Membership' : 'Become a Subscriber'}
            </Link>
          </section>

        </main>
        <Footer />
      </div>
    </div>
  );
}


// 3. FINAL SUSPENSE WRAPPER (Prevents Build Errors)
export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="bg-black min-h-screen" />}>
      <DashboardContent />
    </Suspense>
  );
}
