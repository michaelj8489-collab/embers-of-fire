'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Header from '@/components/Header';

// SYNCED NAMES: These match your Supabase database exactly
const TIERS = [
  { id: 'seeker', label: 'Seeker' },
  { id: 'keepers', label: 'Keepers' },
  { id: 'bearers', label: 'Flame Bearers' },
  { id: 'circle', label: 'Phoenix Circle' },
  { id: 'wings', label: 'Wings' },
  { id: 'ascending', label: 'Ascending' }
];

export default function AdminDashboard() {
  const [message, setMessage] = useState('');
  const [selectedTier, setSelectedTier] = useState('seeker');
  const [status, setStatus] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }

      // Check the profile table for the 'admin' role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'admin') {
        setIsAdmin(true);
      } else {
        // Kick regular users back to the dashboard
        window.location.href = '/dashboard'; 
      }
      setLoading(false);
    };
    checkUser();
  }, [supabase]);

  const sendBroadcast = async () => {
    if (!message) return;
    setStatus('Sending Signal...');

    // This inserts the message into your new broadcasts table
    const { error } = await supabase
      .from('broadcasts')
      .insert([{ 
        content: message, 
        target_tier: selectedTier 
      }]);

    if (error) {
      setStatus('Error: ' + error.message);
    } else {
      setStatus(`Signal Blasted to ${selectedTier.toUpperCase()}!`);
      setMessage('');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black text-white p-10 font-cinzel text-center pt-40 tracking-widest text-orange-500 animate-pulse">
      VERIFYING AUTHORITY...
    </div>
  );

  return (
    <main className="min-h-screen bg-black text-white font-cinzel overflow-x-hidden">
      <Header />
      <div className="max-w-4xl mx-auto pt-32 px-6 pb-20">
        
        {/* 1. THE TITLE */}
        <h1 className="text-4xl text-orange-500 mb-8 border-b border-orange-900/30 pb-4 uppercase tracking-[0.2em]">
          Admin Command Center
        </h1>
        
        {/* 2. SANCTUARY INSPECTION LINKS (The "Teleport" Panel) */}
        <section className="mb-12">
          <h2 className="text-sm text-gray-500 mb-4 tracking-[0.3em] uppercase font-bold">
            Sanctuary Inspection Links
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {TIERS.map((tier) => (
              <a 
                key={tier.id} 
                href={`/sanctuary/${tier.id}`} 
                className="p-3 bg-zinc-900/40 border border-orange-500/20 rounded hover:border-orange-500 hover:bg-orange-600/10 transition-all text-[10px] text-center text-orange-400 uppercase tracking-widest font-bold"
              >
                Inspect {tier.label}
              </a>
            ))}
          </div>
        </section>

        {/* 3. BROADCAST CONTROL BOX */}
        <section className="bg-zinc-900/50 p-8 rounded-2xl border border-orange-900/30 backdrop-blur-md shadow-2xl">
          <label className="block text-xs text-orange-400 mb-2 uppercase tracking-[0.2em] font-bold">
            Target Frequency
          </label>
          <select 
            value={selectedTier} 
            onChange={(e) => setSelectedTier(e.target.value)} 
            className="w-full bg-black border border-orange-500/30 p-4 rounded-lg mb-6 text-white focus:border-orange-500 outline-none transition-colors"
          >
            {TIERS.map(tier => <option key={tier.id} value={tier.id}>{tier.label} Sanctuary</option>)}
          </select>

          <label className="block text-xs text-orange-400 mb-2 uppercase tracking-[0.2em] font-bold">
            Transmission Content
          </label>
          <textarea 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            placeholder="Speak into the Embers..." 
            className="w-full h-48 bg-black border border-orange-500/30 p-4 rounded-lg mb-6 text-white font-cormorant italic text-xl focus:border-orange-500 transition-all outline-none" 
          />

          <button 
            onClick={sendBroadcast} 
            className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-800 rounded-lg font-bold hover:scale-[1.01] transition-transform shadow-[0_0_20px_rgba(255,100,0,0.2)] active:scale-95 text-white"
          >
            SEND SIGNAL
          </button>
          
          {status && (
            <p className="mt-4 text-orange-400 italic text-center animate-pulse tracking-widest text-sm">
              {status}
            </p>
          )}
        </section>

      </div>
    </main>
  );
}