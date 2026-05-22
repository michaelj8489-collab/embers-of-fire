/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useSearchParams } from 'next/navigation';

// THE LINKIFIER
const Linkify = ({ text }: { text: string }) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return (
    <span>
      {parts.map((part, i) => 
        urlRegex.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 underline font-bold transition-colors">
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

function ChatEmbedContent() {
  const searchParams = useSearchParams();
  const activeRoom = searchParams.get('room') || 'global'; // Defaults to global if no ?room= is in the URL

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bots, setBots] = useState<any[]>([]);
  
  const supabase = createClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initSetup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUser(user);
      setLoading(false);
    };
    initSetup();
  }, [supabase]);

  useEffect(() => {
    if (loading) return;

    const fetchRoomMessages = async () => {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      // Fetch Bot Commands
      const fetchBots = async () => {
        const { data } = await supabase.from('chat_commands').select('*');
        if (data) setBots(data);
      };
      fetchBots();

      // Fetch Messages for this specific room
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`id, content, image_url, created_at, user_id, room_name, profiles ( full_name, username )`)
        .eq('room_name', activeRoom) 
        .gte('created_at', twoWeeksAgo.toISOString())
        .order('created_at', { ascending: true })
        .limit(2000); 

      if (error) console.error("Chat Fetch Error:", error.message);
      if (data) setMessages(data);
    };

    fetchRoomMessages();

    const channel = supabase.channel(`chat_embed_${activeRoom}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages', 
        filter: `room_name=eq.${activeRoom}` 
      }, 
      async (payload: any) => {
        const incomingMsg = payload.new;
        const { data: profile } = await supabase.from('profiles').select('full_name, username').eq('id', incomingMsg.user_id).single();
        const msgWithProfile = { ...incomingMsg, profiles: profile };
        
        setMessages((prev) => [...prev, msgWithProfile]);
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, activeRoom, loading]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;
  
    const userMsg = newMessage.trim();
    setNewMessage(''); 
  
    const { error: userError } = await supabase.from('chat_messages').insert({
      content: userMsg,
      user_id: user.id,
      room_name: activeRoom, 
    });
  
    if (userError) return;
  
    const cleanMsg = userMsg.toLowerCase();
    const matchedBot = bots.find(bot => bot.trigger_word === cleanMsg);
  
    if (matchedBot) {
      await supabase.from('chat_messages').insert({
        content: `🤖 SANCTUARY BOT:\n\n${matchedBot.response_text || ''}`,
        user_id: user.id, 
        room_name: activeRoom,
        image_url: matchedBot.image_url || null
      });
    }
  };

  if (loading) return <div className="h-screen w-full bg-transparent flex items-center justify-center font-cinzel text-orange-500 animate-pulse text-xs tracking-widest">Connecting...</div>;

  return (
    // Note the bg-black/60 to give it a nice dark tint over the Stream Suite UI
    <main className="h-screen w-full flex flex-col overflow-hidden bg-black/60">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth [&::-webkit-scrollbar]:hidden">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.user_id === user?.id ? 'items-end' : 'items-start'}`}>
            <span className="text-[9px] font-cinzel text-orange-500 mb-1 tracking-widest uppercase drop-shadow-md">
                {msg.profiles?.username || msg.profiles?.full_name || 'Anonymous Seeker'}
            </span>
            
            <div className={`max-w-[90%] p-3 rounded-2xl text-sm font-cormorant shadow-xl flex flex-col ${msg.user_id === user?.id ? 'bg-orange-600/90 text-white rounded-tr-none backdrop-blur-sm' : 'bg-zinc-900/80 text-gray-200 rounded-tl-none border border-orange-900/30 backdrop-blur-sm'}`}>
                {msg.content && (
                  <div className="whitespace-pre-wrap">
                    <Linkify text={msg.content} />
                  </div>
                )}
                {msg.image_url && (
                  <img 
                    src={msg.image_url} 
                    alt="Attached image" 
                    className="mt-3 max-w-full rounded-lg border border-black/30 shadow-lg" 
                  />
                )}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={sendMessage} className="flex-none p-2 bg-black/80 backdrop-blur-md border-t border-orange-900/30 flex gap-2">
        <input type="text" disabled={!user} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={user ? "Type a message..." : "Log in to chat"} className="flex-1 bg-zinc-950/80 border border-orange-900/50 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-orange-500 font-cormorant" />
        <button type="submit" disabled={!user} className="bg-orange-600 disabled:opacity-50 hover:bg-orange-500 text-white px-3 py-2 rounded-lg font-cinzel text-[10px] tracking-widest transition-colors shadow-md shadow-orange-900/50">
          SEND
        </button>
      </form>
    </main>
  );
}

export default function ChatEmbedPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-black/60 flex items-center justify-center font-cinzel text-orange-500 text-xs tracking-widest">Loading...</div>}>
      <ChatEmbedContent />
    </Suspense>
  );
}