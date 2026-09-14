'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { getPaidTierSlug } from '@/utils/membership';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function SignupForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paidTier = getPaidTierSlug(searchParams.get('tier'));
  const selectedTier = paidTier ?? 'seeker';
  const loginPath = paidTier ? `/login?trigger_checkout=${paidTier}` : '/login';
  const [authStatus, setAuthStatus] = useState<'checking' | 'signed-out' | 'error'>('checking');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await createClient().auth.getSession();
        if (cancelled) return;
        if (error) {
          setAuthStatus('error');
        } else if (session) {
          router.replace(paidTier ? `/dashboard?trigger_checkout=${paidTier}` : '/dashboard');
        } else {
          setAuthStatus('signed-out');
        }
      } catch {
        if (!cancelled) setAuthStatus('error');
      }
    };

    void checkSession();
    return () => { cancelled = true; };
  }, [paidTier, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName, username: username },
        // CRITICAL: We attach the 'checkout' instruction to the email link
        emailRedirectTo: `${window.location.origin}/auth/callback?checkout=${selectedTier}`,
      },
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage(`SUCCESS! Check your email to verify and unlock ${selectedTier.replace(/-/g, ' ')}.`);
    }
    setIsLoading(false);
  };

  if (authStatus !== 'signed-out') {
    return (
      <main className="max-w-md mx-auto pt-32 pb-20 px-6 text-center text-orange-400">
        <p role="status">{authStatus === 'error' ? 'Unable to check your session. Please log in to continue.' : 'Checking your session...'}</p>
        {authStatus === 'error' && <Link href={loginPath} className="inline-block mt-4 underline">Log in to continue</Link>}
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto pt-32 pb-20 px-6">
      <div className="bg-orange-900/10 border border-orange-500/30 p-8 rounded-lg backdrop-blur-sm">
        <h1 className="text-3xl text-orange-500 mb-2 text-center uppercase tracking-widest">Join the Sanctuary</h1>
        <p className="text-orange-400/60 text-center mb-8 italic font-cormorant">Path Chosen: {selectedTier.replace(/-/g, ' ')}</p>
        
        <form onSubmit={handleSignup} className="space-y-4 font-cormorant text-lg">
          <input type="text" placeholder="First Name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-black border border-orange-900/50 p-2 text-white outline-none focus:border-orange-500" />
          <input type="text" placeholder="Last Name" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-black border border-orange-900/50 p-2 text-white outline-none focus:border-orange-500" />
          <input type="text" placeholder="Username" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-black border border-orange-900/50 p-2 text-white outline-none focus:border-orange-500" />
          <hr className="border-orange-900/30 my-6" />
          <input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black border border-orange-900/50 p-2 text-white outline-none focus:border-orange-500" />
          <input type="password" placeholder="Create Password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black border border-orange-900/50 p-2 text-white outline-none focus:border-orange-500" />
          <button type="submit" disabled={isLoading} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 transition-colors uppercase tracking-widest mt-4">
            {isLoading ? 'Processing...' : 'Verify & Continue'}
          </button>
        </form>
        <p className="mt-6 text-center text-orange-400 font-cormorant text-lg">
          <Link href={loginPath} className="underline hover:text-orange-300">Already have an account? Log in to upgrade.</Link>
        </p>
        {message && <p className="mt-6 text-center text-orange-400 border border-orange-400/20 p-4">{message}</p>}
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-black text-gray-200 font-cinzel">
      <Header />
      <Suspense fallback={<div className="pt-40 text-center text-orange-500">Loading Path...</div>}>
        <SignupForm />
      </Suspense>
      <Footer />
    </div>
  );
}
