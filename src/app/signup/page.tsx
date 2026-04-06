'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

 const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Success! Check your email to confirm your Seeker account.');
    }
    setLoading(false);
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden text-center bg-black font-cormorant">
      
      {/* Background Video */}
      <video autoPlay muted loop playsInline className="fixed top-24 left-0 w-full h-[calc(100vh-6rem)] object-cover object-top z-0 opacity-40">
        <source src="/images/eol-moving-background.mp4" type="video/mp4" />
      </video>
      
      <div className="fixed top-24 left-0 w-full h-[calc(100vh-6rem)] bg-black/70 z-10"></div>

      <Header />

      <div className="relative z-20 w-full max-w-md px-8 py-10 bg-black/80 backdrop-blur-md rounded-2xl border border-orange-900/50 shadow-[0_0_50px_rgba(255,100,0,0.15)] mt-12 mb-12">
        
        <h1 className="text-4xl font-cinzel-dec font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-2 tracking-wider uppercase">
          Become a Seeker
        </h1>
        <p className="text-xl text-gray-300 mb-8 italic">
          Join the network and access the core frequency.
        </p>

        <form onSubmit={handleSignup} className="flex flex-col gap-5">
          <div className="text-left">
            <label className="block text-orange-400 font-cinzel font-bold tracking-widest text-xs mb-2 uppercase">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-orange-900/40 rounded-lg px-4 py-3 text-gray-100 text-lg focus:outline-none focus:border-orange-500 transition-all shadow-inner" 
              placeholder="seeker@awareness.com" 
            />
          </div>
          
          <div className="text-left">
            <label className="block text-orange-400 font-cinzel font-bold tracking-widest text-xs mb-2 uppercase">Create Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-orange-900/40 rounded-lg px-4 py-3 text-gray-100 text-lg focus:outline-none focus:border-orange-500 transition-all shadow-inner" 
              placeholder="••••••••" 
            />
          </div>

          {error && <p className="text-red-500 text-sm font-bold bg-red-500/10 py-2 rounded border border-red-500/20">{error}</p>}
          {message && <p className="text-green-500 text-sm font-bold bg-green-500/10 py-2 rounded border border-green-500/20">{message}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 py-4 bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-500 hover:to-red-600 text-white text-xl font-cinzel font-bold rounded-lg transition-all transform hover:-translate-y-1 shadow-lg disabled:opacity-50 disabled:transform-none"
          >
            {loading ? 'INITIATING...' : 'CREATE FREE ACCOUNT'}
          </button>
        </form>

        <p className="mt-8 text-gray-400 text-lg">
          Already a member? 
          <Link href="/login" className="text-orange-500 hover:text-orange-400 font-cinzel font-bold ml-2 transition-colors">
            SIGN IN
          </Link>
        </p>
      </div>

      <Footer />
    </main>
  );
}