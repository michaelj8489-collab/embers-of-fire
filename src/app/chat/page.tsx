'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link'; // NEW: Imported Link for navigation

const PUBLIC_CHANNELS = [
  { id: 'global', name: 'Global Sanctuary', shortName: 'GLOBAL', desc: 'Main community chat' },
  { id: 'smule-joins', name: 'Smule Joins (OC)', shortName: 'SMULE', desc: 'Share your open calls' },
  { id: 'group-songs', name: 'Group Songs', shortName: 'SONGS', desc: 'Plan and share group songs' },
  { id: 'voices-on-the-rise', name: 'Voices on the Rise', shortName: 'VOICES', desc: 'Show chat' },
  { id: 'the-messengers', name: 'The Messengers', shortName: 'MSNGRS', desc: 'Show chat' },
  { id: 'brindles-vision', name: 'Brindle\'s Vision', shortName: 'BRINDLE', desc: 'Show chat' },
  { id: 'honkytonk-heaven', name: 'Honkytonk Heaven', shortName: 'HONKY', desc: 'Show chat' },
  { id: 'defining-your-character', name: 'Defining Your Character', shortName: 'DYC', desc: 'Show chat' },
  { id: 'mystic-mist', name: 'Mystic Mist', shortName: 'MIST', desc: 'Show chat' }
];

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '🔥', '🙏', '😢'];

// --- DYNAMIC BACKGROUND MAPPING ---
const ROOM_BACKGROUNDS: Record<string, string> = {
  'global': '/images/rise-radio-logo.png',
  'smule-joins': '/icon-maskable-512x512.png',
  'group-songs': '/images/group-songs-room-background.png',
  'voices-on-the-rise': '/images/media-4/voices-on-the-rise.jpg',
  'the-messengers': '/images/main-images/Cover Art/messengers-new.jpg',
  'brindles-vision': '/images/main-images/Cover Art/brindles-vision-bg.png',
  'honkytonk-heaven': '/images/main-images/Cover Art/honkey-tonk-heaven-main.jpg',
  'defining-your-character': '/images/jmc-edits-palettes/defining-your-character-bg.mp4', 
  'mystic-mist': '/images/main-images/Cover Art/mystic-mist.jpg', 
  'admin-chat': '/images/rise-radio-logo.png' 
};

export default function ChatPage() {
  const [messagesByRoom, setMessagesByRoom] = useState<Record<string, any[]>>({});
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [activePickerId, setActivePickerId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeRoom, setActiveRoom] = useState('global');
  const [loading, setLoading] = useState(true);
  
  const [currentSong, setCurrentSong] = useState('');
  const [inputLink, setInputLink] = useState('');
  
  const supabase = createClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentMessages = messagesByRoom[activeRoom] || [];
  const [bots, setBots] = useState<any[]>([]);

  const handleLoadSong = () => {
    if (inputLink.includes('smule.com')) {
      const cleanLink = inputLink.split('?')[0]; 
      const embedLink = cleanLink.endsWith('/frame') ? cleanLink : `${cleanLink}/frame`;
      setCurrentSong(embedLink);
      setInputLink(''); 
    } else {
      alert("Please enter a valid Smule URL.");
    }
  };

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

      const fetchBots = async () => {
        const { data } = await supabase.from('chat_commands').select('*');
        if (data) setBots(data);
      };
      fetchBots();

      const { data, error } = await supabase
        .from('chat_messages')
        .select(`id, content, image_url, created_at, user_id, room_name, parent_id, reactions, profiles ( full_name, username )`)
        .eq('room_name', activeRoom) 
        .gte('created_at', twoWeeksAgo.toISOString())
        .order('created_at', { ascending: true })
        .limit(2000); 

      if (error) console.error("Chat Fetch Error:", error.message);

      if (data) {
        setMessagesByRoom((prev) => ({ ...prev, [activeRoom]: data }));
      }
    };

    fetchRoomMessages();

    const channel = supabase.channel(`chat_${activeRoom}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'chat_messages', 
        filter: `room_name=eq.${activeRoom}` 
      }, 
      async (payload: any) => {
        
        if (payload.eventType === 'INSERT') {
          const incomingMsg = payload.new;
          const { data: profile } = await supabase.from('profiles').select('full_name, username').eq('id', incomingMsg.user_id).single();
          const msgWithProfile = { ...incomingMsg, profiles: profile };
          
          setMessagesByRoom((prev) => {
            const existing = prev[activeRoom] || [];
            return { ...prev, [activeRoom]: [...existing, msgWithProfile] };
          });
        } 
        else if (payload.eventType === 'UPDATE') {
          setMessagesByRoom((prev) => {
            const existing = prev[activeRoom] || [];
            return {
              ...prev,
              [activeRoom]: existing.map(msg => 
                msg.id === payload.new.id ? { ...msg, reactions: payload.new.reactions } : msg
              )
            };
          });
        }

      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, activeRoom, loading]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const toggleReaction = async (messageId: string, currentReactions: any, emoji: string) => {
    if (!user) return; 
    
    const updatedReactions = currentReactions ? { ...currentReactions } : {};
    
    if (!updatedReactions[emoji]) {
      updatedReactions[emoji] = [];
    }

    const hasReacted = updatedReactions[emoji].includes(user.id);

    if (hasReacted) {
      updatedReactions[emoji] = updatedReactions[emoji].filter((id: string) => id !== user.id);
      if (updatedReactions[emoji].length === 0) {
        delete updatedReactions[emoji];
      }
    } else {
      updatedReactions[emoji].push(user.id);
    }

    const { error } = await supabase
      .from('chat_messages')
      .update({ reactions: updatedReactions })
      .eq('id', messageId);

    if (error) console.error("Error updating reaction:", error);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;
  
    const userMsg = newMessage.trim();
    setNewMessage(''); 
  
    const { error: userError } = await supabase.from('chat_messages').insert({
      content: userMsg,
      user_id: user.id,
      room_name: activeRoom, 
      parent_id: replyingTo ? replyingTo.id : null 
    });

    setReplyingTo(null); 

    if (userError) {
      alert("Failed to send: " + userError.message);
      return;
    }
  
    const cleanMsg = userMsg.toLowerCase();
    const matchedBot = bots.find(bot => bot.trigger_word === cleanMsg);
  
    if (matchedBot) {
      const { error: botError } = await supabase.from('chat_messages').insert({
        content: `🤖 SANCTUARY BOT:\n\n${matchedBot.response_text || ''}`,
        user_id: user.id, 
        room_name: activeRoom,
        image_url: matchedBot.image_url || null
      });
      
      if (botError) console.error("Error deploying bot:", botError);
    }
  };

  if (loading) return <div className="h-[100dvh] bg-black flex items-center justify-center font-cinzel text-orange-500 animate-pulse uppercase tracking-[0.3em]">Igniting...</div>;

  const activeChannelName = [...PUBLIC_CHANNELS, { id: 'admin-chat', name: 'Rise Admin Chat' }].find(c => c.id === activeRoom)?.name || 'Unknown Room';
  
  const currentBackground = ROOM_BACKGROUNDS[activeRoom] || ROOM_BACKGROUNDS['global'];
  const isVideo = currentBackground.endsWith('.mp4');

  return (
    <main className="h-[100dvh] w-full flex flex-col overflow-hidden pt-16 md:pt-24 pb-20 md:pb-0 bg-black relative">
      
      {isVideo ? (
        <video 
          key={currentBackground}
          autoPlay 
          muted 
          loop 
          playsInline 
          className="absolute inset-0 w-full h-full object-contain z-0 pointer-events-none"
        >
          <source src={currentBackground} type="video/mp4" />
        </video>
      ) : (
        <div 
          key={currentBackground}
          className="absolute inset-0 w-full h-full z-0 pointer-events-none bg-contain bg-no-repeat bg-center transition-all duration-500"
          style={{ backgroundImage: `url('${currentBackground}')` }}
        />
      )}

      <div className="absolute inset-0 bg-black/85 z-0 pointer-events-none" />
      
      {/* UPGRADED TOP BAR WITH BACK BUTTON */}
      <div className="flex-none p-4 bg-black/40 border-b border-orange-900/30 backdrop-blur-md z-10 relative flex justify-between items-center">
         <div className="flex items-center gap-3">
           
           {/* THE ESCAPE HATCH */}
           <Link 
             href="/" 
             className="text-gray-400 hover:text-orange-500 transition-colors flex items-center justify-center bg-black/50 p-2 rounded-full border border-transparent hover:border-orange-500/50 shadow-md"
             title="Return to Main Site"
           >
             <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
             </svg>
           </Link>

           <h1 className="font-cinzel text-orange-500 text-sm md:text-xl uppercase tracking-[0.2em] shadow-black drop-shadow-md">
             {activeChannelName}
           </h1>
         </div>
         
         <button 
           onClick={() => {
             navigator.clipboard.writeText(`https://www.embersoflight.net/chat-embed?room=${activeRoom}`);
             alert(`Stream Suite Embed Link for ${activeChannelName} copied to your clipboard!`);
           }}
           className="px-3 py-1.5 bg-black/60 border border-orange-900/50 hover:bg-orange-600/80 hover:border-orange-500 text-gray-300 hover:text-white rounded cursor-pointer text-[10px] md:text-xs font-cinzel tracking-widest transition-all shadow-md"
         >
           📋 COPY EMBED LINK
         </button>
      </div>

      <div className="flex-1 flex overflow-hidden w-full max-w-7xl mx-auto z-10 relative">
        
        <div className="hidden md:flex w-64 flex-col border-r border-orange-900/30 p-4 overflow-y-auto bg-black/40 backdrop-blur-sm">
          {PUBLIC_CHANNELS.map(ch => (
            <button key={ch.id} onClick={() => setActiveRoom(ch.id)} className={`w-full text-left p-3 rounded-lg font-cinzel text-[10px] uppercase tracking-widest transition-all mb-1 ${activeRoom === ch.id ? 'bg-orange-600/90 text-white shadow-[0_0_10px_rgba(234,88,12,0.5)]' : 'text-gray-400 hover:text-orange-500 hover:bg-white/5'}`}>
              {ch.name}
            </button>
          ))}
          {isAdmin && (
            <button onClick={() => setActiveRoom('admin-chat')} className={`w-full text-left p-3 rounded-lg font-cinzel text-[10px] uppercase tracking-widest border border-red-900/50 mt-4 ${activeRoom === 'admin-chat' ? 'bg-red-800 text-white' : 'text-red-600 hover:bg-red-900/40'}`}>
              Admin Chat
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-col min-w-0 h-full">
          
          <div className="flex-none bg-black/60 border-b border-orange-500/30 p-3 shrink-0 backdrop-blur-sm z-10 relative">
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-orange-400 font-cinzel text-xs uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Live Broadcast
              </span>
            </div>
            
            <iframe 
              src="https://zeno.fm/player/rise-radio-woqo" 
              width="100%" 
              height="120" 
              frameBorder="0" 
              scrolling="no" 
              className="rounded-lg shadow-2xl shrink-0"
            ></iframe>
          </div>

          {activeRoom === 'group-songs' && (
            <div className="flex-none bg-black/60 border-b border-orange-900/30 p-4 shrink-0 backdrop-blur-md">
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-2 mb-3">
                  <input 
                    type="text" 
                    placeholder="Paste Smule link to play..."
                    value={inputLink}
                    onChange={(e) => setInputLink(e.target.value)}
                    className="flex-grow bg-black/80 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 focus:border-orange-500 outline-none text-sm font-cormorant transition-colors"
                  />
                  <button 
                    onClick={handleLoadSong}
                    className="px-5 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-cinzel text-xs tracking-widest rounded-lg transition-all shadow-md shrink-0"
                  >
                    LOAD
                  </button>
                </div>

                {currentSong && (
                  <div className="w-full h-[160px] md:h-[180px] shrink-0 bg-black rounded-lg border border-gray-800 overflow-hidden relative shadow-lg">
                    <iframe 
                      src={currentSong} 
                      className="w-full h-full absolute top-0 left-0"
                      frameBorder="0"
                      allow="autoplay; fullscreen"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth [&::-webkit-scrollbar]:hidden">
            {currentMessages.map((msg) => {
              const parentMsg = msg.parent_id ? currentMessages.find(m => m.id === msg.parent_id) : null;

              return (
                <div key={msg.id} className={`flex flex-col ${msg.user_id === user?.id ? 'items-end' : 'items-start'}`}>
                  <span className="text-[9px] font-cinzel text-orange-500 mb-1 tracking-widest uppercase drop-shadow-md">
                      {msg.profiles?.username || msg.profiles?.full_name || 'Anonymous Seeker'}
                  </span>
                  
                  <div className={`max-w-[85%] p-3 rounded-2xl text-xl md:text-2xl font-bold font-cormorant shadow-xl flex flex-col ${msg.user_id === user?.id ? 'bg-orange-600/90 text-white rounded-tr-none backdrop-blur-sm' : 'bg-zinc-900/80 text-gray-200 rounded-tl-none border border-orange-900/30 backdrop-blur-sm'}`}>
                      
                    {msg.parent_id && (
                      <div className="bg-black/30 border-l-4 border-orange-400/50 rounded-r p-2 mb-2 text-sm text-gray-300/90">
                        <span className="font-cinzel text-orange-300/80 text-[10px] uppercase tracking-widest block mb-1">
                          Replying to {parentMsg?.profiles?.username || parentMsg?.profiles?.full_name || 'a seeker'}
                        </span>
                        <span className="line-clamp-2 italic text-base">
                          {parentMsg ? (parentMsg.content || '[Attached Image]') : 'Message scroll has faded...'}
                        </span>
                      </div>
                    )}

                    {msg.content && (
                      <div className="whitespace-pre-wrap">
                        <Linkify text={msg.content} />
                      </div>
                    )}

                    {msg.image_url && (
                      <img 
                        src={msg.image_url} 
                        alt="Attached image" 
                        className="mt-3 max-w-full md:max-w-[250px] rounded-lg border border-black/30 shadow-lg" 
                      />
                    )}

                    <div className="flex items-center flex-wrap gap-2 mt-3 pt-2 border-t border-white/10 relative">
                      
                      {msg.reactions && Object.entries(msg.reactions).map(([emoji, users]: [string, any]) => {
                        if (!users || users.length === 0) return null;
                        const hasReacted = user && users.includes(user.id);
                        return (
                          <button 
                            key={emoji}
                            onClick={() => toggleReaction(msg.id, msg.reactions, emoji)}
                            className={`text-[12px] px-2 py-0.5 rounded-full border transition-colors ${hasReacted ? 'bg-orange-500/40 border-orange-400 text-white' : 'bg-black/30 border-gray-600 hover:border-gray-400 text-gray-300'}`}
                          >
                            {emoji} {users.length}
                          </button>
                        );
                      })}

                      <div className="relative">
                        <button 
                          onClick={() => setActivePickerId(activePickerId === msg.id ? null : msg.id)}
                          className={`text-[12px] px-2 py-0.5 rounded-full border transition-all ${activePickerId === msg.id ? 'bg-black/50 border-gray-400 text-white' : 'text-gray-400 border-transparent hover:bg-black/30 hover:text-white'}`}
                        >
                          +😀
                        </button>
                        
                        {activePickerId === msg.id && (
                          <div className="flex absolute bottom-full left-0 mb-2 bg-zinc-900 border border-orange-900/70 rounded-xl p-2 gap-2 shadow-2xl z-50">
                            {EMOJI_OPTIONS.map(em => (
                              <button 
                                key={em} 
                                onClick={() => {
                                  toggleReaction(msg.id, msg.reactions, em);
                                  setActivePickerId(null); 
                                }}
                                className="text-lg hover:scale-125 transition-transform"
                              >
                                {em}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <button 
                        onClick={() => setReplyingTo(msg)} 
                        className="text-[10px] text-gray-300 hover:text-white ml-auto font-cinzel tracking-widest border border-transparent hover:border-orange-400/50 rounded px-2 py-1 transition-all"
                      >
                        ↩ REPLY
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>

          {replyingTo && (
            <div className="flex-none bg-orange-900/40 border-t border-orange-500/50 p-2 flex justify-between items-center px-4 backdrop-blur-md">
              <span className="text-xs font-cinzel text-orange-200 truncate">
                Replying to: <span className="text-white">"{replyingTo.content?.substring(0, 40)}..."</span>
              </span>
              <button onClick={() => setReplyingTo(null)} className="text-red-400 hover:text-red-300 text-xs font-bold px-2 tracking-widest">
                ✕ CANCEL
              </button>
            </div>
          )}

          <form onSubmit={sendMessage} className="flex-none p-3 bg-black/80 backdrop-blur-md border-t border-orange-900/30 flex gap-2">
            <input type="text" disabled={!user} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Speak your truth..." className="flex-1 bg-zinc-950/80 border border-orange-900/50 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-orange-500 font-cormorant" />
            <button type="submit" className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2 rounded-full font-cinzel text-[10px] tracking-widest transition-colors shadow-md shadow-orange-900/50">
              SEND
            </button>
          </form>

          <div className="md:hidden flex-none bg-black/90 backdrop-blur-md border-t border-orange-900/40 flex overflow-x-auto p-2 gap-2 [&::-webkit-scrollbar]:hidden">
            {PUBLIC_CHANNELS.map(ch => (
              <button key={ch.id} onClick={() => setActiveRoom(ch.id)} className={`flex-shrink-0 px-3 py-1.5 rounded-full font-cinzel text-[9px] tracking-tighter border transition-colors ${activeRoom === ch.id ? 'bg-orange-600 text-white border-orange-500 shadow-[0_0_8px_rgba(234,88,12,0.6)]' : 'bg-zinc-900/50 text-gray-400 border-orange-900/30'}`}>
                {ch.shortName}
              </button>
            ))}
            {isAdmin && <button onClick={() => setActiveRoom('admin-chat')} className={`flex-shrink-0 px-3 py-1.5 rounded-full font-cinzel text-[9px] tracking-tighter border ${activeRoom === 'admin-chat' ? 'bg-red-800 text-white border-red-500' : 'bg-red-950/50 text-red-600 border-red-900/30'}`}>ADMIN</button>}
          </div>
        </div>
      </div>
    </main>
  );
}

// THE NEW LINKIFIER
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