'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Header from '@/components/Header';

// THE INNER CIRCLE: Authorized Admin Emails
const ADMIN_EMAILS = [
  'michael.j.8489@gmail.com',
  // 'collaborator@example.com' (Add Lunaria and others here)
];

const TIERS = [
  { id: 'seeker', label: 'Seeker' },
  { id: 'keepers-of-the-embers', label: 'Keepers' },
  { id: 'flame-bearers', label: 'Flame Bearers' },
  { id: 'phoenix-circle', label: 'Phoenix Circle' },
  { id: 'wings-of-the-phoenix', label: 'Wings' },
  { id: 'phoenix-ascending', label: 'Ascending' }
];

export default function AdminDashboard() {
  const [message, setMessage] = useState('');
  const [selectedTier, setSelectedTier] = useState('seeker');
  const [status, setStatus] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && ADMIN_EMAILS.includes(user.email!)) {
        setIsAdmin(true);
      } else {
        window.location.href = '/dashboard'; 
      }
    };
    checkUser();
  }, []);

  const sendBroadcast = async () => {
    if (!message) return;
    setStatus('Sending Signal...');

    const { error } = await supabase
      .from('broadcasts')
      .insert([{ content: message, target_tier: selectedTier }]);

    if (error) {
      setStatus('Error: ' + error.message);
    } else {
      setStatus(`Signal Blasted to ${selectedTier.replace(/-/g, ' ')}!`);
      setMessage('');
    }
  };

  if (!isAdmin) return <div className="min-h-screen bg-black text-white p-10 font-cinzel text-center pt-40 tracking-widest">Verifying Authority...</div>;

  return (
    <main className="min-h-screen bg-black text-white font-cinzel overflow-x-hidden">
      <Header />
      <div className="max-w-4xl mx-auto pt-32 px-6 pb-20">
        <h1 className="text-4xl text-orange-500 mb-8 border-b border-orange-900/30 pb-4">ADMIN COMMAND CENTER</h1>
        
        {/* SECTION 1: QUICK NAVIGATION FOR INSPECTION */}
        <section className="mb-12">
          <h2 className="text-sm text-gray-500 mb-4 tracking-[0.3em] uppercase">Sanctuary Inspection Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {TIERS.map((tier) => (
              <a 
                key={tier.id}
                href={`/sanctuary/${tier.id}`}
                className="p-3 bg-zinc-900/50 border border-orange-500/10 rounded hover:border-orange-500/50 hover:bg-orange-600/10 transition-all text-xs text-center text-orange-300"
              >
                Inspect {tier.label}
              </a>
            ))}
          </div>
        </section>

        {/* SECTION 2: BROADCAST CONTROL */}
        <section className="bg-zinc-900/50 p-8 rounded-2xl border border-orange-900/30 backdrop-blur-md">
          <label className="block text-xs text-orange-400 mb-2 uppercase tracking-[0.2em]">Target Frequency</label>
          <select 
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="w-full bg-black border border-orange-500/30 p-4 rounded-lg mb-6 text-white focus:border-orange-500 outline-none"
          >
            {TIERS.map(tier => <option key={tier.id} value={tier.id}>{tier.label} Sanctuary</option>)}
          </select>

          <label className="block text-xs text-orange-400 mb-2 uppercase tracking-[0.2em]">Transmission Content</label>
          <textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Speak into the Embers..."
            className="w-full h-48 bg-black border border-orange-500/30 p-4 rounded-lg mb-6 text-white font-cormorant italic text-lg focus:border-orange-500 transition-all outline-none"
          />

          <button 
            onClick={sendBroadcast}
            className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-800 rounded-lg font-bold hover:scale-[1.01] transition-transform shadow-[0_0_20px_rgba(255,100,0,0.2)]"
          >
            SEND SIGNAL
          </button>
          {status && <p className="mt-4 text-orange-400 italic text-center animate-pulse">{status}</p>}
        </section>
      </div>
    </main>
  );
}