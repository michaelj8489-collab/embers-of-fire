'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';

export default function AdminControlRoom() {
  const [message, setMessage] = useState('');
  const [selectedTier, setSelectedTier] = useState('seeker');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();
  const router = useRouter();

  // The official roster of tier designations
  const tiers = [
    { id: 'seeker', name: 'Seeker' },
    { id: 'keepers-of-the-embers', name: 'Keepers of the Embers' },
    { id: 'flame-bearers', name: 'Flame Bearers' },
    { id: 'phoenix-circle', name: 'Phoenix Circle' },
    { id: 'wings-of-the-phoenix', name: 'Wings of the Phoenix' },
    { id: 'phoenix-ascending', name: 'Phoenix Ascending' }
  ];

  useEffect(() => {
    async function checkAdminStatus() {
      const { data: { user } } = await supabase.auth.getUser();

      // If not logged in, boot to login
      if (!user) {
        router.push('/login');
        return;
      }

      // Check if they have the admin key
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile && profile.role === 'admin') {
        setIsAuthorized(true);
      } else {
        // If they are a regular user, boot them to the main dashboard
        router.push('/dashboard'); 
      }
      setLoading(false);
    }

    checkAdminStatus();
  }, [supabase, router]);

  const handleBroadcast = async () => {
    if (!message.trim()) {
      setStatus({ type: 'error', text: 'Transmission payload cannot be empty.' });
      return;
    }

    setIsSending(true);
    setStatus({ type: '', text: '' });

    const { data: { user } } = await supabase.auth.getUser();

    // Fire the signal to the database
    const { error } = await supabase.from('messages').insert({
      content: message,
      tier: selectedTier,
      author_name: user?.email
    });

    if (error) {
      setStatus({ type: 'error', text: `Transmission failed: ${error.message}` });
    } else {
      setStatus({ type: 'success', text: `Signal successfully broadcasted to ${selectedTier}!` });
      setMessage(''); // Clear the box for the next message
      setTimeout(() => setStatus({ type: '', text: '' }), 4000); // Fade out success text
    }
    setIsSending(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-orange-500 font-cinzel text-2xl animate-pulse tracking-widest">Initializing Control Room...</div>;
  }

  // Double security: Render nothing if not authorized (prevents a flash of the page before redirect)
  if (!isAuthorized) return null; 

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-black font-cormorant text-gray-200 overflow-x-hidden">
      <Header />

      <main className="flex-grow w-full px-6 md:px-12 lg:px-20 pt-40 pb-20 flex flex-col items-center">
        <div className="w-full max-w-4xl">
          <h1 className="font-cinzel text-5xl font-bold text-red-600 mb-4 uppercase tracking-[0.2em] border-b border-red-900/30 pb-4 text-center">
            Master Control Room
          </h1>
          <p className="font-cormorant text-gray-400 italic mb-12 text-2xl text-center">
            Direct your transmissions to any specific tier across the network.
          </p>

          <div className="bg-gradient-to-b from-neutral-900/80 to-black/90 backdrop-blur-md p-10 md:p-14 rounded-3xl border border-red-900/40 shadow-[0_0_50px_rgba(220,38,38,0.15)] relative overflow-hidden">
            
            {/* TIER SELECTOR */}
            <div className="mb-10 relative z-10">
              <label className="block font-cinzel text-sm uppercase tracking-[0.2em] text-orange-400 mb-4 font-bold">
                Target Frequency (Select Tier)
              </label>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-full bg-black border border-orange-900/50 rounded-xl p-5 text-2xl text-white font-cinzel focus:border-orange-500 outline-none cursor-pointer hover:bg-neutral-900/50 transition-colors"
              >
                {tiers.map((tier) => (
                  <option key={tier.id} value={tier.id}>
                    {tier.name}
                  </option>
                ))}
              </select>
            </div>

            {/* MESSAGE BOX */}
            <div className="mb-10 relative z-10">
              <label className="block font-cinzel text-sm uppercase tracking-[0.2em] text-orange-400 mb-4 font-bold">
                Transmission Payload
              </label>
              <textarea
                className="w-full bg-black/80 border border-orange-900/40 rounded-xl p-6 text-2xl text-white font-cormorant focus:border-red-500 outline-none transition-all min-h-[200px] resize-none"
                placeholder="Type your broadcast here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {/* STATUS MESSAGE FEEDBACK */}
            {status.text && (
              <div className={`mb-8 p-5 rounded-xl font-cinzel text-sm uppercase tracking-[0.2em] text-center font-bold relative z-10 ${status.type === 'error' ? 'bg-red-950/40 text-red-400 border border-red-900/50' : 'bg-green-950/40 text-green-400 border border-green-900/50'}`}>
                {status.text}
              </div>
            )}

            {/* FIRE BUTTON */}
            <div className="flex justify-end relative z-10">
              <button
                onClick={handleBroadcast}
                disabled={isSending}
                className={`bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 text-white px-12 py-5 rounded-full font-cinzel text-xl tracking-[0.3em] transition-all shadow-[0_0_30px_rgba(220,38,38,0.4)] uppercase font-bold flex items-center justify-center min-w-[300px] ${isSending ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
              >
                {isSending ? 'Transmitting...' : 'Broadcast Signal'}
              </button>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}