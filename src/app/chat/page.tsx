'use client';

import React, { useEffect, useState, useRef } from 'react';
// We're using the standard client to avoid that "missing export" error
import { createClient } from '@supabase/supabase-js';

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  
  // Directly creating the client using your environment variables
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const setupChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);

      if (data) setMessages(data);
    };

    setupChat();

    // The Fix for Error 2: Added ": any" to the payload
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
  }, []); // Removed supabase from dependency array for stability

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        content: newMessage,
        user_id: user.id,
      });

    if (error) {
      console.error('Error sending:', error);
    } else {
      setNewMessage('');
    }
  };

  return (
    <main className="min-h-screen bg-black pt-24 pb-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-gray-900/50 border border-orange-900/30 rounded-2xl flex flex-col h-[70vh] shadow-2xl overflow-hidden">
        
        <div className="p-4 border-b border-orange-900/30 bg-gradient-to-r from-orange-950/50 to-black">
          <h1 className="font-cinzel text-xl text-orange-500 tracking-widest uppercase text-center">
            The Global Sanctuary
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col ${msg.user_id === user?.id ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-cormorant ${
                msg.user_id === user?.id 
                  ? 'bg-orange-600 text-white rounded-tr-none shadow-[0_0_10px_rgba(234,88,12,0.3)]' 
                  : 'bg-gray-800 text-gray-200 rounded-tl-none'
              }`}>
                {msg.content}
              </div>
              <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-tighter">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        <form onSubmit={sendMessage} className="p-4 bg-black/50 border-t border-orange-900/30 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message, Keeper..."
            className="flex-1 bg-gray-900 border border-orange-900/20 rounded-full px-4 py-2 text-gray-200 focus:outline-none focus:border-orange-500 text-sm font-cormorant"
          />
          <button 
            type="submit"
            className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-full font-cinzel text-xs tracking-widest transition-all"
          >
            SEND
          </button>
        </form>
      </div>
    </main>
  );
}