'use client';

import React, { useState, useEffect, use } from 'react';
import { supabase } from '@/utils/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SanctuaryBoard({ params }: { params: Promise<{ tier: string }> }) {
  // Use React.use() to "unwrap" the params promise
  const resolvedParams = use(params);
  const tier = resolvedParams.tier;

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

      if (profile?.role === 'admin') setIsAdmin(true);
      fetchMessages();
    }
    getAccess();
  }, [tier]);

  async function fetchMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('tier', tier)
      .order('created_at', { ascending: false });
    if (data) setMessages(data);
    setLoading(false);
  }

  async function handlePost() {
    if (!newMessage.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('messages').insert({
      content: newMessage,
      tier: tier,
      author_name: user?.email 
    });

    setNewMessage('');
    fetchMessages();
  }

  return (
    <main className="min-h-screen bg-black text-white font-serif">
      <Header />
      <div className="max-w-4xl mx-auto pt-40 px-6 pb-20">
        <h1 className="text-5xl font-bold text-orange-500 mb-4 uppercase tracking-widest border-b border-orange-900/30 pb-4">
          The {tier} Sanctuary
        </h1>
        <p className="text-gray-400 italic mb-12 text-xl font-cormorant">Transmissions for the {tier} Tier</p>

        {/* Admin Post Box */}
        {isAdmin && (
          <div className="bg-zinc-900/40 p-8 rounded-2xl border border-orange-500/20 mb-16 shadow-2xl">
            <h3 className="text-xs uppercase tracking-widest text-orange-400 mb-6 font-sans font-bold">New Broadcast</h3>
            <textarea 
              className="w-full bg-black/40 border border-zinc-800 rounded-xl p-5 text-white focus:border-orange-500 outline-none transition-all min-h-[120px] resize-none"
              placeholder="Speak into the Embers..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <div className="flex justify-end mt-4">
              <button 
                onClick={handlePost}
                className="bg-gradient-to-r from-orange-700 to-orange-500 hover:from-orange-600 hover:to-orange-400 px-10 py-3 rounded-full font-bold transition-all shadow-lg shadow-orange-900/40 active:scale-95"
              >
                Send Signal
              </button>
            </div>
          </div>
        )}

        {/* Message Feed */}
        <div className="space-y-12">
          {loading ? (
            <div className="animate-pulse text-orange-500/50 italic">Tuning frequency...</div>
          ) : messages.length === 0 ? (
            <p className="text-zinc-600 italic">The air is still. No transmissions yet.</p>
          ) : messages.map((msg) => (
            <div key={msg.id} className="group relative">
              <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-600 to-transparent opacity-30 group-hover:opacity-100 transition-opacity" />
              <p className="text-2xl leading-relaxed text-zinc-100 font-light font-cormorant">{msg.content}</p>
              <div className="mt-6 flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-sans">
                <span className="text-orange-500/70">From: {msg.author_name}</span>
                <span>•</span>
                <span>{new Date(msg.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}