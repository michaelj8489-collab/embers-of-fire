'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';

// Added shortName for the mobile bottom navigation
const PUBLIC_CHANNELS = [
  { id: 'global', name: 'Global Sanctuary', shortName: 'GLOBAL', desc: 'Main community chat' },
  { id: 'smule-joins', name: 'Smule Joins (OC)', shortName: 'SMULE', desc: 'Share your open calls' },
  { id: 'the-messengers', name: 'The Messengers', shortName: 'MSNGRS', desc: 'Song submissions' },
  { id: 'brindles-vision', name: 'Brindle\'s Vision', shortName: 'BRINDLE', desc: 'Song submissions' },
  { id: 'honkytonk-heaven', name: 'Honkytonk Heaven', shortName: 'HONKY', desc: 'Song submissions' },
  { id: 'defining-your-character', name: 'Defining Your Character', shortName: 'DYC', desc: 'Song submissions' }
];

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeRoom, setActiveRoom] = useState('global');
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initSetup = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user) {
        setUser(user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile?.role === 'admin') setIsAdmin(true);
      }
      setLoading(false);
    };
    initSetup();
  }, [supabase]);

  useEffect(() => {
    if (loading) return;

    // THE FIX: Instantly wipe the chat screen when a new tab is clicked
    setMessages([]);

    const fetchRoomMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          id, content, created_at, user_id, room_name,
          profiles ( full_name, username )
        `)
        .eq('room_name', activeRoom) 
        .order('created_at', { ascending: true })
        .limit(100);

      // SAFETY CATCH: Make sure empty rooms actually show as empty
      if (data) {
        setMessages(data);
      } else {
        setMessages([]);
      }
    };

    fetchRoomMessages();

    const channel = supabase
      .channel(`chat_${activeRoom}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages',
        filter: `room_name=eq.${activeRoom}`
      }, async (payload: any) => {
        const incomingMsg = payload.new;
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, username')
          .eq('id', incomingMsg.user_id)
          .single();

        const msgWithProfile = { ...incomingMsg, profiles: profile };
        setMessages((current) => [...current, msgWithProfile]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, activeRoom, loading]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        content: newMessage,
        user_id: user.id,
        room_name: activeRoom, 
      });

    if (error) alert("Send Failed: " + error.message);
    else setNewMessage('');
  };

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center font-cinzel text-orange-500 tracking-[0.3em] animate-pulse text-xl">IGNITING THE SANCTUARY...</div>;
  }

  const activeChannelName = [...PUBLIC_CHANNELS, { id: 'admin-chat', name: 'Rise Admin Chat', shortName: 'ADMIN' }]
    .find(c => c.id === activeRoom)?.name || 'Unknown Room';

  return (
    <main className="min-h-screen bg-black pt-16 md:pt-28 pb-0 md:pb-12 flex justify-center overflow-hidden">
      
      {/* Container - Full height on mobile, boxed on desktop */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row md:gap-4 h-[calc(100vh-64px)] md:h-[85vh] px-0 md:px-4">
        
        {/* DESKTOP SIDEBAR (Hidden on mobile) */}
        <div className="hidden md:flex w-full md:w-1/3 lg:w-1/4 bg-gray-900/40 border border-orange-900/30 rounded-2xl md:rounded-3xl flex-col overflow-hidden backdrop-blur-sm shadow-2xl">
          <div className="p-4 bg-gradient-to-b from-orange-950/40 to-transparent border-b border-orange-900/30">
            <h2 className="font-cinzel text-xl text-orange-500 uppercase tracking-widest">Frequencies</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {PUBLIC_CHANNELS.map(ch => (
              <button
                key={ch.id}
                onClick={() => setActiveRoom(ch.id)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all ${activeRoom === ch.id ? 'bg-orange-600/20 border border-orange-500/50' : 'hover:bg-gray-800/50 border border-transparent'}`}
              >
                <div className={`font-cinzel text-sm uppercase tracking-wider ${activeRoom === ch.id ? 'text-orange-400' : 'text-gray-300'}`}>{ch.name}</div>
                <div className="text-[10px] font-cormorant text-gray-500 italic mt-1">{ch.desc}</div>
              </button>
            ))}

            {isAdmin && (
              <button
                onClick={() => setActiveRoom('admin-chat')}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all mt-4 border border-red-900/50 ${activeRoom === 'admin-chat' ? 'bg-red-900/30 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'bg-red-950/10 hover:bg-red-900/20'}`}
              >
                <div className={`font-cinzel text-sm uppercase tracking-wider ${activeRoom === 'admin-chat' ? 'text-red-400' : 'text-red-600'}`}>Rise Admin Chat</div>
                <div className="text-[10px] font-cormorant text-gray-500 italic mt-1">Command center encrypted</div>
              </button>
            )}
          </div>
        </div>

        {/* MAIN CHAT AREA */}
        <div className="flex-1 bg-gray-900/40 md:border border-orange-900/30 md:rounded-3xl flex flex-col overflow-hidden backdrop-blur-sm shadow-2xl">
          
          <div className="p-4 md:p-6 border-b border-orange-900/30 bg-gradient-to-r from-orange-950/40 to-black flex justify-between items-end">
            <div>
              <h1 className="font-cinzel text-lg md:text-3xl text-orange-500 tracking-[0.1em] uppercase leading-none">
                {activeChannelName}
              </h1>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 [&::-webkit-scrollbar]:hidden">
            {!user && (
              <div className="bg-orange-900/20 border border-orange-500/50 p-4 rounded-xl text-center text-orange-200 font-cormorant italic">
                Please log in to join the conversation.
              </div>
            )}
            
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.user_id === user?.id ? 'items-end' : 'items-start'}`}>
                {/* PRIORITY USERNAME FIX: Username first, then full_name, then Anonymous */}
                <span className="text-[10px] md:text-xs font-cinzel text-orange-500/70 mb-1 tracking-widest uppercase px-1">
                  {msg.profiles?.username || msg.profiles?.full_name || 'Anonymous Seeker'}
                </span>
                <div className={`max-w-[90%] md:max-w-[70%] p-3 md:p-5 rounded-2xl md:rounded-3xl text-sm md:text-lg font-cormorant leading-relaxed shadow-lg ${
                  msg.user_id === user?.id 
                    ? 'bg-gradient-to-br from-orange-600 to-red-700 text-white rounded-tr-none' 
                    : 'bg-gray-800/80 text-gray-200 rounded-tl-none border border-orange-900/10'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>

          <form onSubmit={sendMessage} className="p-3 md:p-6 bg-black/60 border-t border-orange-900/30 flex gap-2">
            <input
              type="text" disabled={!user} value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={user ? "Speak your truth..." : "Restricted..."}
              className="flex-1 bg-gray-950 border border-orange-900/30 rounded-full px-4 md:px-6 py-2 md:py-3 text-gray-200 focus:outline-none focus:border-orange-500 font-cormorant disabled:opacity-50"
            />
            <button type="submit" disabled={!user} className="bg-orange-600 hover:bg-orange-500 text-white px-6 md:px-10 py-2 md:py-3 rounded-full font-cinzel text-[10px] md:text-sm tracking-widest transition-all">
              SEND
            </button>
          </form>
        </div>

        {/* MOBILE BOTTOM TABS (Hidden on Desktop) */}
        <div className="md:hidden flex-none bg-black border-t border-orange-900/50 flex overflow-x-auto items-center p-2 gap-2 [&::-webkit-scrollbar]:hidden pb-4">
          {PUBLIC_CHANNELS.map(ch => (
            <button
              key={ch.id}
              onClick={() => setActiveRoom(ch.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-cinzel text-xs tracking-widest transition-all ${
                activeRoom === ch.id
                  ? 'bg-orange-600 text-white border border-orange-500 shadow-lg'
                  : 'bg-gray-900 text-gray-400 border border-orange-900/50 hover:text-orange-400'
              }`}
            >
              {ch.shortName}
            </button>
          ))}
          {isAdmin && (
            <button
              onClick={() => setActiveRoom('admin-chat')}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-cinzel text-xs tracking-widest transition-all ${
                activeRoom === 'admin-chat'
                  ? 'bg-red-800 text-white border border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.5)]'
                  : 'bg-red-950/20 text-red-500 border border-red-900/50'
              }`}
            >
              ADMIN
            </button>
          )}
        </div>

      </div>
    </main>
  );
}