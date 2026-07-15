'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function getSafePostLoginPath() {
  const fallbackPath = `/dashboard${window.location.search}`;
  const searchParams = new URLSearchParams(window.location.search);
  const returnTo = searchParams.get('returnTo');

  if (!returnTo) {
    return fallbackPath;
  }

  try {
    const parsedReturnTo = new URL(returnTo, window.location.origin);

    if (parsedReturnTo.origin !== window.location.origin) {
      return fallbackPath;
    }

    return `${parsedReturnTo.pathname}${parsedReturnTo.search}${parsedReturnTo.hash}`;
  } catch {
    return fallbackPath;
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: loginError } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (loginError) {
      setError(loginError.message);
    } else {
      // THE FIX: This keeps the ?trigger_checkout=... attached 
      // so the dashboard knows to open Stripe immediately.
      router.push(getSafePostLoginPath());
    }
    setLoading(false);
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center py-24 px-4 font-cormorant text-gray-200">
      
      <video autoPlay loop muted playsInline className="fixed inset-0 w-full h-full object-cover object-center z-0 pointer-events-none">
         <source src="/images/phoenix-revived.mp4" type="video/mp4" />
      </video>

      <div className="fixed inset-0 bg-black/80 z-10 pointer-events-none"></div>

      <div className="relative z-20 flex flex-col items-center bg-black/60 p-8 sm:p-10 rounded-xl border border-orange-900/50 shadow-[0_0_30px_rgba(0,0,0,0.8)] w-full max-w-md mt-12 md:mt-16 mb-8 transition-all duration-500">
        
        <h1 className="font-cinzel-decorative text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-8 tracking-widest text-center uppercase">
          Start the Spark
        </h1>

        {error && <p className="text-red-500 mb-4 font-cinzel tracking-wider uppercase text-sm text-center">{error}</p>}

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-5">
          <div className="flex flex-col text-left">
            <label className="block text-sm font-medium text-gray-400 mb-1 font-cinzel tracking-wider uppercase">
              Email
            </label>
            <input
              className="p-3 rounded bg-gray-900/80 text-white border border-orange-900/50 focus:border-orange-500 outline-none w-full font-cormorant text-xl"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col text-left">
            <label className="block text-sm font-medium text-gray-400 mb-1 font-cinzel tracking-wider uppercase">
              Password
            </label>
            <input
              className="p-3 rounded bg-gray-900/80 text-white border border-orange-900/50 focus:border-orange-500 outline-none w-full font-cormorant text-xl"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end mt-1">
            {/* SQUIGGLE KILLED: removed the 'disabled' attribute here */}
            <Link href="/forgot-password" title="Forgot Password" className="text-xs font-cinzel text-gray-500 hover:text-orange-400 transition-colors duration-300 uppercase tracking-tighter">
              Forgot the spark?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-3 md:py-4 rounded transition-all duration-300 font-cinzel tracking-[0.15em] uppercase disabled:opacity-50 shadow-[0_0_15px_rgba(234,88,12,0.3)]"
          >
            {loading ? 'Processing...' : 'IGNITE THE SIGNAL'}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-2">
          <Link
            href="/signup"
            className="text-gray-400 hover:text-orange-400 text-sm transition-colors duration-300 font-cinzel tracking-widest uppercase border-b border-transparent hover:border-orange-400 pb-1"
          >
            First time? Join the Frequency
          </Link>
        </div>
      </div>

    </main>
  );
}
