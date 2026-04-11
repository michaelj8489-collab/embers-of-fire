'use client';

import React, { useState, useEffect, use } from 'react';
import { supabase } from '@/utils/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SanctuaryBoard({ params }: { params: Promise<{ tier: string }> }) {
  const resolvedParams = use(params);
  const tier = resolvedParams.tier;
  
  // Clean up the URL string for the display title (e.g., "seeker" -> "Seeker")
  const displayTier = tier.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getAccess() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile && profile.role === 'admin') {
        setIsAdmin(true);
      }

      fetchMessages();
    }

    async function fetchMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('tier', tier)
        .order('created_at', { ascending: false });

      if (data) setMessages(data);
      setLoading(false);
    }

    getAccess();
  }, [tier]);

  async function handlePost() {
    if (!newMessage.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('messages').insert({
      content: newMessage,
      tier: tier,
      author_name: user?.email
    });

    if (!error) {
      setNewMessage('');
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('tier', tier)
        .order('created_at', { ascending: false });
      if (data) setMessages(data);
    }
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-black font-cormorant text-gray-200 overflow-x-hidden">
      <Header />
      
      {/* Matched the Dashboard's wide, responsive padding */}
      <main className="flex-grow w-full px-6 md:px-12 lg:px-20 pt-40 pb-20">
        
        <div className="w-full">
          {/* Brand Fonts Applied to Headers */}
          <h1 className="font-cinzel text-5xl font-bold text-orange-500 mb-4 uppercase tracking-[0.2em] border-b border-orange-900/30 pb-4">
            The {displayTier} Sanctuary
          </h1>
          <p className="font-cormorant text-gray-400 italic mb-12 text-2xl">Transmissions for the {displayTier} Tier</p>

          {isAdmin && (
            <div className="bg-black/60 backdrop-blur-md p-8 rounded-2xl border border-orange-900/30 mb-16 shadow-2xl">
              <h3 className="font-cinzel text-sm uppercase tracking-[0.2em] text-orange-400 mb-6 font-bold">New Broadcast</h3>
              <textarea
                className="w-full bg-black/80 border border-orange-900/40 rounded-xl p-6 text-xl text-white font-cormorant focus:border-orange-500 outline-none transition-all min-h-[150px] resize-none"
                placeholder="Speak into the Embers..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <div className="flex justify-end mt-6">
                <button
                  onClick={handlePost}
                  className="bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 text-white px-12 py-4 rounded-full font-cinzel text-lg tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:scale-105 active:scale-95 uppercase font-bold"
                >
                  Send Signal
                </button>
              </div>
            </div>
          )}

          <div className="space-y-12">
            {loading ? (
              <div className="animate-pulse text-orange-500/50 italic font-cormorant text-2xl">Tuning frequency...</div>
            ) : messages.length === 0 ? (
              <p className="text-zinc-500 italic font-cormorant text-2xl">The air is still. No transmissions yet.</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="group relative bg-neutral-900/20 p-8 rounded-2xl border border-white/5 hover:border-orange-900/30 transition-all">
                  <div className="absolute -left-px top-8 bottom-8 w-1 bg-gradient-to-b from-orange-600 to-transparent opacity-30 group-hover:opacity-100 transition-opacity rounded-full" />
                  <p className="text-zinc-100 font-cormorant text-3xl leading-relaxed">{msg.content}</p>
                  <div className="mt-8 flex items-center gap-4 text-xs uppercase tracking-[0.3em] font-cinzel text-zinc-500 border-t border-white/5 pt-4">
                    <span className="text-orange-500/70 font-bold">From: {msg.author_name}</span>
                    <span>•</span>
                    <span>{new Date(msg.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}