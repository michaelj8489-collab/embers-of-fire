'use client';

import React, { useEffect, useState, useRef } from 'react';
// Using the standard client that worked before
import { createClient } from '@supabase/supabase-js';

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Directly creating the client using your environment variables
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const setupChat = async () => {
      // 1. Check if user is actually logged in
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("User session not found:", userError);
        setLoading(false);
        return;
      }

      setUser(user);

      // 2. Initial fetch of messages
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        alert("Database Error: " + error.message);
      } else if (data) {
        setMessages(data);
      }
      setLoading(false);
    };

    setupChat();

    // 3. Real-time subscription (This makes it feel alive)
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
  }, []); // Keep dependency array empty to prevent re-renders

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert("You must be logged in to chat, Keeper.");
      return;
    }

    if (!newMessage.trim()) return;

    // 4. The actual send command
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        content: newMessage,
        user_id: user.id,
      });

    if (error) {
      // THIS will tell us exactly why it's failing
      alert("Send Failed: " + error.message);
    } else {
      setNewMessage(''); // Clear the input on success
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-orange-500 font-cinzel tracking-widest">Opening the Sanctuary...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black pt-24 pb-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-gray-900/50 border border-orange-900/30 rounded-2xl flex flex-col h-[70vh] shadow-2xl overflow-hidden">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-orange-900/30 bg-gradient-to-r from-orange-950/50 to-black flex justify-between items-center">
          <h1 className="font-cinzel text-lg text-orange-500 tracking-widest uppercase">
            Global Sanctuary
          </h1>
          <div className="text-[10px] font-cinzel text-gray-400">
            {user ? `Authenticated: ${user.email}` : 'UNAUTHORIZED'}
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!user && (
            <div className="bg-orange-900/20 border border-orange-500/50 p-4 rounded-xl text-center text-orange-200 font-cormorant italic">
              The Sanctuary gates are closed. Please log in to join the conversation.
            </div>
          )}
          
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

        {/* Message Input */}
        <form onSubmit={sendMessage} className="p-4 bg-black/50 border-t border-orange-900/30 flex gap-2">
          <input
            type="text"
            disabled={!user}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={user ? "Speak your truth, Keeper..." : "Enter the Sanctuary via Login..."}
            className="flex-1 bg-gray-900 border border-orange-900/20 rounded-full px-4 py-2 text-gray-200 focus:outline-none focus:border-orange-500 text-sm font-cormorant disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!user}
            className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-full font-cinzel text-xs tracking-widest transition-all disabled:bg-gray-800"
          >
            SEND
          </button>
        </form>
      </div>
    </main>
  );
}