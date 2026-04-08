'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-cormorant text-gray-200">
      
      {/* --- THE LIVE PHOENIX BACKGROUND --- */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover"
        >
          <source src="/images/phoenix-revived.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for readability over the fire */}
        <div className="absolute inset-0 bg-black/70 z-10 pointer-events-none"></div>
      </div>

      {/* --- LOGIN FORM CONTENT --- */}
      <div className="relative z-20 w-full max-w-md px-6">
        <div className="bg-black/60 backdrop-blur-md border border-orange-900/40 p-8 rounded-2xl shadow-[0_0_50px_rgba(234,88,12,0.25)] text-center">
          
          <h1 className="font-cinzel-decorative text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 uppercase tracking-widest mb-2">
            Embers Of Light
          </h1>
          <p className="font-cinzel text-orange-200/60 italic mb-10 tracking-widest text-sm text-center uppercase">
            Step Into The Sanctuary
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="text-left">
              <label className="block text-orange-500 font-cinzel text-xs uppercase tracking-widest mb-2 ml-1 text-center">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black/70 border border-orange-900/50 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-orange-500 transition-colors font-sans"
                placeholder="Enter your email..."
              />
            </div>

            <div className="text-left">
              <label className="block text-orange-500 font-cinzel text-xs uppercase tracking-widest mb-2 ml-1 text-center">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-black/70 border border-orange-900/50 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-orange-500 transition-colors font-sans"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-900/50 text-red-500 text-sm py-2 px-4 rounded font-sans">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-500 hover:to-red-600 text-white font-cinzel font-bold py-3 rounded-lg shadow-lg transform active:scale-95 transition-all tracking-widest disabled:opacity-50"
            >
              {loading ? 'IGNITING...' : 'IGNITE THE SIGNAL'}
            </button>
          </form>

          <div className="mt-8 text-gray-400 text-sm italic">
            Not a Seeker yet? <Link href="/signup" className="text-orange-500 hover:text-orange-400 transition-colors underline underline-offset-4 ml-1">Join the Frequency</Link>
          </div>
        </div>
      </div>
    </div>
  );
}