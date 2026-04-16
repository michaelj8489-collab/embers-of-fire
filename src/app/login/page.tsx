'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Forces Vercel to render dynamically to prevent build errors with Supabase
export const dynamic = 'force-dynamic';

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
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) {
      setError(error.message);
    } else {
      alert('Success! Check your email for the confirmation link.');
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-cormorant text-gray-200">
      
      {/* Cinematic Looping Video Background */}
      {/* Added object-center to ensure the video scales symmetrically from the middle */}
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover object-center z-0">
         <source src="/images/phoenix-revived.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay to keep the form readable against the fire */}
      <div className="absolute inset-0 bg-black/80 z-10 pointer-events-none"></div>

      {/* Login Form Container */}
      {/* Added mt-32 md:mt-40 to shift the box down so the Phoenix head sits just above it */}
      <div className="relative z-20 flex flex-col items-center bg-black/60 p-10 rounded-xl border border-orange-900/50 shadow-[0_0_30px_rgba(0,0,0,0.8)] w-full max-w-md mt-32 md:mt-40">
        
        <h1 className="font-cinzel-decorative text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-8 tracking-widest text-center uppercase">
          Start the Spark
        </h1>

        {/* Updated Error Font to Cinzel */}
        {error && <p className="text-red-500 mb-4 font-cinzel tracking-wider uppercase text-sm">{error}</p>}

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-5">
          <div className="flex flex-col text-left">
            <label className="block text-sm font-medium text-gray-400 mb-1 font-cinzel tracking-wider uppercase">
              Email
            </label>
            {/* Updated Input Font to Cormorant */}
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
            {/* Updated Input Font to Cormorant */}
            <input
              className="p-3 rounded bg-gray-900/80 text-white border border-orange-900/50 focus:border-orange-500 outline-none w-full font-cormorant text-xl"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
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
          {/* Updated Sign-up link to Cinzel */}
          <button
            type="button"
            onClick={handleSignUp}
            className="text-gray-400 hover:text-orange-400 text-sm transition-colors duration-300 font-cinzel tracking-widest uppercase border-b border-transparent hover:border-orange-400 pb-1"
          >
            First time? Join the Frequency
          </button>
        </div>
      </div>

    </div>
  );
}