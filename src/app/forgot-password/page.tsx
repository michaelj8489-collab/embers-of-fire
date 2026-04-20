'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // This is where they go AFTER clicking the link in their email
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('A recovery spark has been sent to your email.');
    }
    setLoading(false);
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center py-24 px-4 font-cormorant text-gray-200">
      <video autoPlay loop muted playsInline className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none">
         <source src="/images/phoenix-revived.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-black/80 z-10 pointer-events-none"></div>

      <div className="relative z-20 flex flex-col items-center bg-black/60 p-8 rounded-xl border border-orange-900/50 shadow-[0_0_30px_rgba(0,0,0,0.8)] w-full max-w-md mt-12 transition-all">
        <h1 className="font-cinzel-decorative text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-6 tracking-widest text-center uppercase">
          Recover the Spark
        </h1>

        {error && <p className="text-red-500 mb-4 font-cinzel text-sm text-center uppercase">{error}</p>}
        {message && <p className="text-green-500 mb-4 font-cinzel text-sm text-center uppercase">{message}</p>}

        <form onSubmit={handleReset} className="w-full flex flex-col gap-5">
          <div className="flex flex-col text-left">
            <label className="block text-sm font-medium text-gray-400 mb-1 font-cinzel uppercase tracking-wider">
              Email Address
            </label>
            <input
              className="p-3 rounded bg-gray-900/80 text-white border border-orange-900/50 focus:border-orange-500 outline-none w-full font-cormorant text-xl"
              type="email"
              placeholder="Enter the email associated with your account"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-3 rounded transition-all font-cinzel tracking-widest uppercase disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'SEND RECOVERY LINK'}
          </button>
        </form>

        <div className="mt-6">
          <Link href="/login" className="text-gray-400 hover:text-orange-400 text-xs font-cinzel uppercase tracking-widest transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}