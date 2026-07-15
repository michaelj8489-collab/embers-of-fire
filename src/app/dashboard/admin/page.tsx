'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Header from '@/components/Header';
import BotManager from '@/components/BotManager'; // Correct import
import { SHOWS } from '@/utils/showRegistry';

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
  const [selectedShowId, setSelectedShowId] = useState<string>(SHOWS[0]?.id ?? '');
  const [showLiveStatus, setShowLiveStatus] = useState('Loading live status...');
  const [activeLiveSessions, setActiveLiveSessions] = useState<LiveSessionSummary[]>([]);
  const [showActionPending, setShowActionPending] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadShowLiveStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/show-live', { cache: 'no-store' });
      const data = (await response.json()) as ShowLiveStatusResponse;

      if (!response.ok) {
        setShowLiveStatus('error' in data ? data.error : 'Unable to load live status.');
        setActiveLiveSessions([]);
        return;
      }

      if (!data.success) {
        setShowLiveStatus(data.error);
        setActiveLiveSessions([]);
        return;
      }

      setActiveLiveSessions(data.activeSessions);
      if (data.unavailable) {
        setShowLiveStatus('Live-session storage is not configured yet.');
      } else if (data.activeSessions.length === 0) {
        setShowLiveStatus('No shows are marked live.');
      } else {
        setShowLiveStatus(
          `${data.activeSessions.length} show${data.activeSessions.length === 1 ? '' : 's'} live.`
        );
      }
    } catch {
      setShowLiveStatus('Unable to load live status.');
      setActiveLiveSessions([]);
    }
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'admin') {
        setIsAdmin(true);
      } else {
        window.location.href = '/dashboard'; 
      }
      setLoading(false);
    };
    checkUser();
  }, [supabase]);

  useEffect(() => {
    if (isAdmin) {
      void loadShowLiveStatus();
    }
  }, [isAdmin, loadShowLiveStatus]);

  const sendBroadcast = async () => {
    if (!message) return;
    setStatus('Sending Signal...');

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

  const updateShowLiveSession = async (action: 'start' | 'end') => {
    setShowActionPending(true);
    setShowLiveStatus(action === 'start' ? 'Starting show...' : 'Ending show...');

    try {
      const response = await fetch('/api/show-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          showId: selectedShowId,
          platform: 'manual',
        }),
      });
      const data = (await response.json()) as ShowLiveMutationResponse;

      if (!response.ok) {
        setShowLiveStatus('error' in data ? data.error : 'Unable to update live session.');
        return;
      }

      if (!data.success) {
        setShowLiveStatus(data.error);
        return;
      }

      if (data.status === 'already-active') {
        setShowLiveStatus('That show is already marked live.');
      } else if (data.status === 'not-active') {
        setShowLiveStatus('That show is not currently marked live.');
      } else if (data.status === 'started') {
        setShowLiveStatus(
          data.testMode
            ? 'Show marked live. Admin test mode sent only to your devices.'
            : 'Show marked live.'
        );
      } else {
        setShowLiveStatus('Show marked offline.');
      }

      await loadShowLiveStatus();
    } catch {
      setShowLiveStatus('Unable to update live session.');
    } finally {
      setShowActionPending(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black text-white p-10 font-cinzel text-center pt-40 tracking-widest text-orange-500 animate-pulse">
      VERIFYING AUTHORITY...
    </div>
  );

  // If NOT admin, return null (nothing rendered)
  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-black text-white font-cinzel overflow-x-hidden">
      <Header />
      <div className="max-w-4xl mx-auto pt-32 px-6 pb-20">
        
        <h1 className="text-4xl text-orange-500 mb-8 border-b border-orange-900/30 pb-4 uppercase tracking-[0.2em]">
          Admin Command Center
        </h1>
        
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

        <section className="bg-zinc-900/50 p-8 rounded-2xl border border-orange-900/30 backdrop-blur-md shadow-2xl mb-12">
          <h2 className="text-sm text-gray-500 mb-4 tracking-[0.3em] uppercase font-bold">
            Live Show Controls
          </h2>

          <label className="block text-xs text-orange-400 mb-2 uppercase tracking-[0.2em] font-bold">
            Show
          </label>
          <select
            value={selectedShowId}
            onChange={(event) => setSelectedShowId(event.target.value)}
            className="w-full bg-black border border-orange-500/30 p-4 rounded-lg mb-6 text-white focus:border-orange-500 outline-none transition-colors"
          >
            {SHOWS.map((show) => (
              <option key={show.id} value={show.id}>
                {show.name}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updateShowLiveSession('start')}
              disabled={showActionPending}
              className="py-4 bg-gradient-to-r from-orange-600 to-red-800 rounded-lg font-bold hover:scale-[1.01] transition-transform shadow-[0_0_20px_rgba(255,100,0,0.2)] active:scale-95 text-white disabled:opacity-50 disabled:hover:scale-100"
            >
              START SHOW
            </button>
            <button
              type="button"
              onClick={() => updateShowLiveSession('end')}
              disabled={showActionPending}
              className="py-4 bg-zinc-950 border border-orange-500/30 rounded-lg font-bold hover:border-orange-500 transition-all active:scale-95 text-orange-300 disabled:opacity-50"
            >
              END SHOW
            </button>
          </div>

          <p className="mt-4 text-orange-400 italic text-center tracking-widest text-sm">
            {showLiveStatus}
          </p>

          {activeLiveSessions.length > 0 && (
            <ul className="mt-4 space-y-2 text-xs text-gray-400 uppercase tracking-widest">
              {activeLiveSessions.map((session) => (
                <li key={session.id} className="border border-orange-900/30 rounded-lg p-3">
                  {session.showName} live via {session.platform}
                </li>
              ))}
            </ul>
          )}
        </section>

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
        
        <BotManager />

      </div>
    </main>
  );
}

type LiveSessionSummary = {
  id: string;
  showName: string;
  platform: string;
};

type ShowLiveStatusResponse =
  | {
      success: true;
      live: boolean;
      unavailable: boolean;
      activeSessions: LiveSessionSummary[];
    }
  | {
      success: false;
      error: string;
    };

type ShowLiveMutationResponse =
  | {
      success: true;
      status: 'started' | 'already-active' | 'ended' | 'not-active';
      testMode?: boolean;
    }
  | {
      success: false;
      error: string;
    };
