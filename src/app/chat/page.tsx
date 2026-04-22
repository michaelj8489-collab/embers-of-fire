'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';

const PUBLIC_CHANNELS = [
  { id: 'global', name: 'Global Sanctuary', shortName: 'GLOBAL', desc: 'Main community chat' },
  { id: 'smule-joins', name: 'Smule Joins (OC)', shortName: 'SMULE', desc: 'Share your open calls' },
  { id: 'the-messengers', name: 'The Messengers', shortName: 'MSNGRS', desc: 'Song submissions' },
  { id: 'brindles-vision', name: 'Brindle\'s Vision', shortName: 'BRINDLE', desc: 'Song submissions' },
  { id: 'honkytonk-heaven', name: 'Honkytonk Heaven', shortName: 'HONKY', desc: 'Song submissions' },
  { id: 'defining-your-character', name: 'Defining Your Character', shortName: 'DYC', desc: 'Song submissions' }
];

export default function ChatPage() {
  const [messagesByRoom, setMessagesByRoom] = useState<Record<string, any[]>>({});
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeRoom, setActiveRoom] = useState('global');
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentMessages = messagesByRoom[activeRoom] || [];

  useEffect(() => {
    const initSetup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role === 'admin') setIsAdmin(true);
      }
      setLoading(false);
    };
    initSetup();
  }, [supabase]);

  useEffect(() => {
    if (loading) return;
    const fetchRoomMessages = async () => {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const { data } = await supabase
        .from('chat_messages')
        .select(`id, content, created_at, user_id, room_name, profiles ( full_name, username )`)
        .eq('room_name', activeRoom) 
        .gte('created_at', twoWeeksAgo.toISOString()) 
        .order('created_at', { ascending: true })
        .limit(1000); 

      if (data) setMessagesByRoom((prev) => ({ ...prev, [activeRoom]: data }));
    };
    fetchRoomMessages();

    const channel = supabase.channel(`chat_${activeRoom}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_name=eq.${activeRoom}` }, 
      async (payload: any) => {
        const incomingMsg = payload.new;
        const { data: profile } = await supabase.from('profiles').select('full_name, username').eq('id', incomingMsg.user_id).single();
        const msgWithProfile = { ...incomingMsg, profiles: profile };
        setMessagesByRoom((prev) => {
          const existing = prev[activeRoom] || [];
          return { ...prev, [activeRoom]: [...existing, msgWithProfile] };
        });
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, activeRoom, loading]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;
    const { error } = await supabase.from('chat_messages').insert({ content: newMessage, user_id: user.id, room_name: activeRoom });
    if (error) alert("Send Failed: " + error.message);
    else setNewMessage('');
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center font-cinzel text-orange-500 animate-pulse uppercase tracking-widest">Igniting...</div>;

  const activeChannelName = [...PUBLIC_CHANNELS, { id: 'admin-chat', name: 'Rise Admin Chat' }].find(c => c.id === activeRoom)?.name || 'Unknown';

  return (
    /* THE FLUID WRAPPER: 
       'h-[100dvh]' is the key. It stands for Dynamic Viewport Height. 
       It automatically subtracts the browser's URL bars on iPhone/Android.
    */
    <main className="h-[100dvh] w-full bg-black flex flex-col overflow-hidden pt-16 md:pt-24 pb-20 md:pb-0">
      
      {/* 1. TOP HEADER (Stays a fixed size) */}
      <div className="flex-none p-4 bg-black/50 border-b border-orange-900/30 backdrop-blur-md">
         <h1 className="font-cinzel text-orange-500 text-sm md:text-xl uppercase tracking-[0.2em]">{activeChannelName}</h1>
      </div>

      <div className="flex-1 flex overflow-hidden w-full max-w-7xl mx-auto">
        
        {/* DESKTOP SIDEBAR (Responsive hidden) */}
        <div className="hidden md:flex w-64 flex-col border-r border-orange-900/30 p-4 overflow-y-auto">
          {PUBLIC_CHANNELS.map(ch => (
            <button key={ch.id} onClick={() => setActiveRoom(ch.id)} className={`w-full text-left p-3 rounded-lg font-cinzel text-[10px] uppercase tracking-widest transition-all mb-1 ${activeRoom === ch.id ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-orange-500'}`}>
              {ch.name}
            </button>
          ))}
          {isAdmin && (
            <button onClick={() => setActiveRoom('admin-chat')} className={`w-full text-left p-3 rounded-lg font-cinzel text-[10px] uppercase tracking-widest border border-red-900/50 mt-4 ${activeRoom === 'admin-chat' ? 'bg-red-800 text-white' : 'text-red-600 hover:bg-red-900/20'}`}>
              Admin Chat
            </button>
          )}
        </div>

        {/* 2. CHAT CONTENT (This fills the rest of the screen) */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          
          {/* Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            {currentMessages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.user_id === user?.id ? 'items-end' : 'items-start'}`}>
                <span className="text-[9px] font-cinzel text-orange-500/70 mb-1 uppercase">
                    {msg.profiles?.username || msg.profiles?.full_name || 'Seeker'}
                </span>
                <div className={`max-w-[85%] p-3 rounded-2xl text-base font-cormorant shadow-lg ${msg.user_id === user?.id ? 'bg-orange-600 text-white rounded-tr-none' : 'bg-zinc-800 text-gray-200 rounded-tl-none'}`}>
                    {msg.content}
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>

          {/* 3. INPUT FORM (Stays at the bottom of the content) */}
          <form onSubmit={sendMessage} className="flex-none p-3 bg-black border-t border-orange-900/30 flex gap-2">
            <input type="text" disabled={!user} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Speak..." className="flex-1 bg-zinc-900 border border-orange-900/30 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-orange-500 font-cormorant" />
            <button type="submit" className="bg-orange-600 text-white px-5 py-2 rounded-full font-cinzel text-[10px] tracking-widest">SEND</button>
          </form>

          {/* 4. MOBILE SHOW TABS (Responsive Navigation) */}
          <div className="md:hidden flex-none bg-black/80 border-t border-orange-900/20 flex overflow-x-auto p-2 gap-2">
            {PUBLIC_CHANNELS.map(ch => (
              <button key={ch.id} onClick={() => setActiveRoom(ch.id)} className={`flex-shrink-0 px-3 py-1.5 rounded-full font-cinzel text-[9px] tracking-tighter border ${activeRoom === ch.id ? 'bg-orange-600 text-white border-orange-500 shadow-lg' : 'bg-zinc-900 text-gray-500 border-orange-900/20'}`}>
                {ch.shortName}
              </button>
            ))}
            {isAdmin && <button onClick={() => setActiveRoom('admin-chat')} className={`flex-shrink-0 px-3 py-1.5 rounded-full font-cinzel text-[9px] tracking-tighter border ${activeRoom === 'admin-chat' ? 'bg-red-800 text-white border-red-500' : 'bg-red-950 text-red-600 border-red-900/20'}`}>ADMIN</button>}
          </div>

        </div>
      </div>
    </main>
  );
}