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
      <div className="min-h-screen bg-black flex items-center justify-center font-cinzel text-orange-500 tracking-[0.3em] animate-pulse text-lg md:text-xl">
        IGNITING THE SANCTUARY...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black pt-20 pb-6 md:pt-28 md:pb-12 px-2 md:px-4 flex flex-col items-center overflow-x-hidden">
      
      {/* Container: Full width on mobile, max-5xl on desktop */}
      <div className="w-full max-w-5xl bg-gray-900/40 border border-orange-900/30 rounded-2xl md:rounded-3xl flex flex-col h-[75vh] md:h-[85vh] shadow-2xl overflow-hidden backdrop-blur-sm">
        
        {/* Chat Header: Stacked on mobile if needed, spread on desktop */}
        <div className="p-4 md:p-6 border-b border-orange-900/30 bg-gradient-to-r from-orange-950/40 to-black flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
          <div>
            <h1 className="font-cinzel text-lg md:text-3xl text-orange-500 tracking-[0.1em] md:tracking-[0.2em] uppercase leading-none">
              Global Sanctuary
            </h1>
            <p className="hidden md:block font-cormorant text-orange-300/60 text-sm mt-2 italic tracking-widest">The voice of the Keepers</p>
          </div>
          <div className="text-[9px] md:text-xs font-cinzel text-gray-500 tracking-widest">
            {user ? `AUTH // ${user.email}` : 'UNAUTHORIZED'}
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-4 md:space-y-6 scrollbar-hide">
          {!user && (
            <div className="bg-orange-900/20 border border-orange-500/50 p-4 rounded-xl text-center text-orange-200 font-cormorant text-base italic">
              Please log in to join the conversation.
            </div>
          )}
          
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col ${msg.user_id === user?.id ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-[90%] md:max-w-[70%] p-3 md:p-6 rounded-2xl md:rounded-3xl text-sm md:text-xl font-cormorant leading-relaxed shadow-lg ${
                msg.user_id === user?.id 
                  ? 'bg-gradient-to-br from-orange-600 to-red-700 text-white rounded-tr-none' 
                  : 'bg-gray-800/80 text-gray-200 rounded-tl-none border border-orange-900/10'
              }`}>
                {msg.content}
              </div>
              <span className="text-[9px] md:text-xs text-gray-600 mt-1 md:mt-2 uppercase tracking-tighter md:tracking-[0.2em] px-2 font-cinzel">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        {/* Message Input: Smaller on mobile, beefy on desktop */}
        <form onSubmit={sendMessage} className="p-3 md:p-8 bg-black/60 border-t border-orange-900/30 flex gap-2 md:gap-4">
          <input
            type="text"
            disabled={!user}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={user ? "Speak your truth..." : "Restricted..."}
            className="flex-1 bg-gray-950 border border-orange-900/30 rounded-full px-4 md:px-8 py-2 md:py-4 text-gray-200 focus:outline-none focus:border-orange-500 text-sm md:text-lg font-cormorant disabled:opacity-50 transition-all shadow-inner"
          />
          <button 
            type="submit"
            disabled={!user}
            className="bg-orange-600 hover:bg-orange-500 text-white px-5 md:px-14 py-2 md:py-4 rounded-full font-cinzel text-[10px] md:text-base tracking-widest transition-all shadow-lg"
          >
            SEND
          </button>
        </form>
      </div>
    </main>
  );
}