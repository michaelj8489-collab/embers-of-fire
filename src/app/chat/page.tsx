'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const setupChat = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setLoading(false);
        return;
      }
      setUser(user);

      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);

      if (data) setMessages(data);
      setLoading(false);
    };

    setupChat();

    const channel = supabase
      .channel('public:chat_messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages' 
      }, (payload: any) => {
        setMessages((current) => [...current, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

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
      });

    if (error) {
      alert("Send Failed: " + error.message);
    } else {
      setNewMessage('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-cinzel text-orange-500 tracking-[0.3em] animate-pulse text-xl">
        IGNITING THE SANCTUARY...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black pt-28 pb-12 px-4 flex flex-col items-center">
      {/* Container scales up significantly on Desktop (max-w-5xl) */}
      <div className="w-full max-w-5xl bg-gray-900/40 border border-orange-900/30 rounded-3xl flex flex-col h-[85vh] shadow-[0_0_50px_rgba(0,0,0,1)] overflow-hidden backdrop-blur-sm">
        
        {/* Chat Header - Larger Text */}
        <div className="p-6 border-b border-orange-900/30 bg-gradient-to-r from-orange-950/40 to-black flex justify-between items-end">
          <div>
            <h1 className="font-cinzel text-2xl md:text-3xl text-orange-500 tracking-[0.2em] uppercase leading-none">
              Global Sanctuary
            </h1>
            <p className="font-cormorant text-orange-300/60 text-sm mt-2 italic tracking-widest">The voice of the Keepers</p>
          </div>
          <div className="text-[10px] md:text-xs font-cinzel text-gray-500 tracking-widest pb-1">
            {user ? `AUTH // ${user.email}` : 'UNAUTHORIZED'}
          </div>
        </div>

        {/* Message Feed - Larger Bubbles and Font */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 scrollbar-thin scrollbar-thumb-orange-900 scrollbar-track-transparent">
          {!user && (
            <div className="bg-orange-900/20 border border-orange-500/50 p-6 rounded-2xl text-center text-orange-200 font-cormorant text-xl italic">
              The Sanctuary gates are closed. Please log in to join the conversation.
            </div>
          )}
          
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col ${msg.user_id === user?.id ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-[85%] md:max-w-[70%] p-4 md:p-6 rounded-3xl text-base md:text-xl font-cormorant leading-relaxed shadow-xl ${
                msg.user_id === user?.id 
                  ? 'bg-gradient-to-br from-orange-600 to-red-700 text-white rounded-tr-none shadow-orange-900/20' 
                  : 'bg-gray-800/80 text-gray-200 rounded-tl-none border border-orange-900/10'
              }`}>
                {msg.content}
              </div>
              <span className="text-[10px] md:text-xs text-gray-600 mt-2 uppercase tracking-[0.2em] px-2 font-cinzel">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        {/* Message Input - Beefed up for Desktop */}
        <form onSubmit={sendMessage} className="p-6 md:p-8 bg-black/60 border-t border-orange-900/30 flex gap-4">
          <input
            type="text"
            disabled={!user}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={user ? "Speak your truth, Keeper..." : "Restricted..."}
            className="flex-1 bg-gray-950 border border-orange-900/30 rounded-full px-8 py-4 text-gray-200 focus:outline-none focus:border-orange-500 text-base md:text-lg font-cormorant disabled:opacity-50 transition-all placeholder:text-gray-700 shadow-inner"
          />
          <button 
            type="submit"
            disabled={!user}
            className="bg-orange-600 hover:bg-orange-500 hover:scale-105 active:scale-95 text-white px-10 md:px-14 py-4 rounded-full font-cinzel text-sm md:text-base tracking-[0.2em] transition-all disabled:bg-gray-900 disabled:text-gray-700 shadow-lg"
          >
            SEND
          </button>
        </form>
      </div>
    </main>
  );
}