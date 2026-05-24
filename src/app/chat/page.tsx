'use client';
import Image from 'next/image';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid } from '@giphy/react-components';

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
  'the-messengers': '/images/main-images/Cover Art/messengers-new.jpg',
  'brindles-vision': '/images/main-images/Cover Art/brindles-vision-bg.png',
  'honkytonk-heaven': '/images/main-images/Cover Art/honkey-tonk-heaven-main.jpg',
  'defining-your-character': '/images/jmc-edits-palettes/defining-your-character-bg.mp4', 
  'mystic-mist': '/images/main-images/Cover Art/mystic-mist.jpg', 
  'admin-chat': '/images/rise-radio-logo.png' 
};

const gf = new GiphyFetch('8IJKtjYvrjEQjtwpcGUkKMqqMaQaazIy');

export default function ChatPage() {
  const [messagesByRoom, setMessagesByRoom] = useState<Record<string, any[]>>({});
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [activePickerId, setActivePickerId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearch, setGifSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [privateRecipient, setPrivateRecipient] = useState<{id: string, username: string} | null>(null);
  const [dmUsers, setDmUsers] = useState<{id: string, username: string, full_name: string}[]>([]);
  const [privateMessages, setPrivateMessages] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeRoom, setActiveRoom] = useState('global');
  const [loading, setLoading] = useState(true);
  
  const [currentSong, setCurrentSong] = useState('');
  const [inputLink, setInputLink] = useState('');
  
  const supabase = createClient();
  const scrollRef = useRef<HTMLDivElement>(null);
const currentMessages = useMemo(() => {
    // If we have a target lock, show the secret vault!
    if (privateRecipient) return privateMessages;
    
    // Otherwise, show the normal public room.
    return messagesByRoom[activeRoom] || [];
  }, [messagesByRoom, activeRoom, privateRecipient, privateMessages]);
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
    const fetchDmUsers = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .neq('id', user.id); // This makes sure you don't show up in your own DM list!

      if (error) {
        console.error("Error fetching DM users:", error.message);
      } else if (data) {
        setDmUsers(data);
      }
    };

    fetchDmUsers();
 }, [user, supabase]);

 // FETCH PRIVATE MESSAGES & LISTEN FOR NEW ONES
  useEffect(() => {
    if (!user || !privateRecipient) {
      setPrivateMessages([]);
      return;
    }

    const fetchDMs = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`id, content, image_url, created_at, user_id, room_name, parent_id, recipient_id, reactions, profiles ( full_name, username )`)
        // This magic line says: "Get messages I sent to them, OR messages they sent to me"
        .or(`and(user_id.eq.${user.id},recipient_id.eq.${privateRecipient.id}),and(user_id.eq.${privateRecipient.id},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true })
        .limit(1000);

      if (error) {
        console.error("Error fetching DMs:", error.message);
      } else if (data) {
        setPrivateMessages(data);
      }
    };

    fetchDMs();

    // Set up a real-time listener just for this specific conversation
    const dmChannel = supabase.channel(`dms_${user.id}_${privateRecipient.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
      }, async (payload: any) => {
        const incomingMsg = payload.new;
        
        // Double check this message belongs in THIS private chat
        const isForMeFromThem = incomingMsg.recipient_id === user.id && incomingMsg.user_id === privateRecipient.id;
        const isFromMeToThem = incomingMsg.user_id === user.id && incomingMsg.recipient_id === privateRecipient.id;
        
        if (isForMeFromThem || isFromMeToThem) {
          const { data: profile } = await supabase.from('profiles').select('full_name, username').eq('id', incomingMsg.user_id).single();
          const msgWithProfile = { ...incomingMsg, profiles: profile };
          
          setPrivateMessages(prev => [...prev, msgWithProfile]);
        }
      }).subscribe();

    // Clean up the listener when you click away
    return () => {
      supabase.removeChannel(dmChannel);
    };
  }, [user, privateRecipient, supabase]);

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
        .select(`id, content, image_url, created_at, user_id, room_name, parent_id, recipient_id, reactions, profiles ( full_name, username )`)
        .eq('room_name', activeRoom) 
        .is('recipient_id', null) // <-- Hides whispers from the public feed!
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
          // Ignore whispers in the public feed
          if (incomingMsg.recipient_id !== null) return;

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
    const scrollToBottom = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };

    // 1. Scroll immediately when messages change
    scrollToBottom();

    // 2. Scroll again after a 500ms delay 
    // This catches the scroll position AFTER images/players have finished loading
    const timer = setTimeout(scrollToBottom, 500);
    
    return () => clearTimeout(timer);
  }, [currentMessages, activeRoom]);

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

  const fetchGifs = (offset: number) => {
  return gifSearch ? gf.search(gifSearch, { offset, limit: 10 }) : gf.trending({ offset, limit: 10 });
};

const sendGifMessage = async (gifUrl: string) => {
  if (!user) return;
  const { error } = await supabase.from('chat_messages').insert({
    user_id: user.id,
    room_name: activeRoom,
    image_url: gifUrl,
    parent_id: replyingTo ? replyingTo.id : null
  });
  setReplyingTo(null);
  if (error) alert("Failed to send GIF: " + error.message);
};

const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file || !user) return;

  // The Bouncer: Check file size (5MB = 5 * 1024 * 1024 bytes)
  if (file.size > 5242880) {
    alert("File is too large! Please keep it under 5MB.");
    // Clear the input
    if (fileInputRef.current) fileInputRef.current.value = '';
    return;
  }

  setIsUploading(true); // <-- This right here fixes your last error!

  try {
    // 1. Create a unique file name so images don't overwrite each other
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    // 2. Upload the file to our new bucket
    const { error: uploadError } = await supabase.storage
      .from('chat_uploads')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // 3. Get the public URL for the image
    const { data: { publicUrl } } = supabase.storage
      .from('chat_uploads')
      .getPublicUrl(fileName);

    // 4. Save it as a chat message (exactly like a GIF)
    const { error: messageError } = await supabase.from('chat_messages').insert({
      user_id: user.id,
      room_name: activeRoom,
      image_url: publicUrl,
      parent_id: replyingTo ? replyingTo.id : null
    });

    if (messageError) throw messageError;
    
    setReplyingTo(null);
  } catch (error: any) {
    alert("Upload failed: " + error.message);
  } finally {
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }
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
      parent_id: replyingTo ? replyingTo.id : null,
      recipient_id: privateRecipient ? privateRecipient.id : null
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

  if (loading) return <div className="h-[100dvh] bg-black flex items-center justify-center font-cinzel text-orange-500 animate-pulse uppercase tracking-[0.3em] text-lg">Igniting...</div>;

  const activeChannelName = [...PUBLIC_CHANNELS, { id: 'admin-chat', name: 'Rise Admin Chat' }].find(c => c.id === activeRoom)?.name || 'Unknown Room';
  
  const currentBackground = ROOM_BACKGROUNDS[activeRoom] || ROOM_BACKGROUNDS['global'];
  const isVideo = currentBackground.endsWith('.mp4');

  return (
    <main className="h-screen w-full flex flex-col bg-black overflow-hidden text-lg relative">
      
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
        <Image
          key={currentBackground}
          src={currentBackground}
          alt={`${activeRoom} background`}
          fill
          className="object-contain z-0 pointer-events-none transition-opacity duration-500"
          priority // Loads the default background instantly

        />
      )}

      <div className="absolute inset-0 bg-black/85 z-0 pointer-events-none" />
      
      
     {/* RESPONSIVE TOP BAR: Polar Opposites */}
        <div className="flex-none p-4 md:p-6 bg-black/80 border-b border-orange-900/50 backdrop-blur-md z-20 w-full flex justify-between items-center">
  {/* LEFT: BACK BUTTON */}
  <div className="flex items-center">
    <Link 
      href="/" 
      className="text-gray-400 hover:text-orange-500 transition-colors flex items-center justify-center bg-black/50 p-3 rounded-full border border-orange-900/30 hover:border-orange-500/50 shadow-md"
      title="Return to Sanctuary">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </Link>
  </div>

  {/* RIGHT: EMBED BUTTON */}
  <div className="flex items-center">
    <button 
      onClick={() => {
        navigator.clipboard.writeText(`https://www.embersoflight.net/chat-embed?room=${activeRoom}`);
        alert(`Embed link for ${activeChannelName} copied!`);
      }}
      className="px-4 py-2 bg-black/60 border border-orange-900/50 hover:bg-orange-600/80 hover:border-orange-500 text-gray-300 hover:text-white rounded-lg cursor-pointer text-sm font-cinzel tracking-widest transition-all shadow-md"
    >
      📋 COPY EMBED
    </button>
  </div>
</div>

      <div className="flex-1 flex overflow-hidden w-full z-10 relative">
        
        <div className="hidden md:flex w-64 flex-col border-r border-orange-900/30 p-4 overflow-y-auto bg-black/40 backdrop-blur-sm">
          {PUBLIC_CHANNELS.map(ch => (
            <button key={ch.id} onClick={() => setActiveRoom(ch.id)} className={`w-full text-left p-3 rounded-lg font-cinzel text-lg uppercase tracking-widest transition-all mb-1 ${activeRoom === ch.id ? 'bg-orange-600/90 text-white shadow-[0_0_10px_rgba(234,88,12,0.5)]' : 'text-gray-400 hover:text-orange-500 hover:bg-white/5'}`}>
              {ch.name}
            </button>
          ))}

          {/* DIRECT MESSAGES SECTION */}
          <div className="mt-8 mb-4">
            <h3 className="text-orange-500/80 font-cinzel text-sm font-bold mb-3 uppercase tracking-wider px-4">
              Direct Messages
            </h3>
            <ul className="space-y-1">
              {dmUsers.map((dmUser) => (
                <li key={dmUser.id}>
                  <button
                    onClick={() => setPrivateRecipient(dmUser)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-all font-cinzel ${
                      privateRecipient?.id === dmUser.id
                        ? 'bg-purple-900/50 text-purple-200 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                        : 'text-gray-400 hover:bg-zinc-800/50 hover:text-white'
                    }`}
                  >
                    <span className="truncate block">@{dmUser.username}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {isAdmin && (
            <button onClick={() => setActiveRoom('admin-chat')} className={`w-full text-left p-3 rounded-lg font-cinzel text-lg uppercase tracking-widest border border-red-900/50 mt-auto ${activeRoom === 'admin-chat' ? 'bg-red-800 text-white' : 'text-red-600 hover:bg-red-900/40'}`}>
              Admin Chat
            </button>
          )}
        </div>
        <div className="flex-1 flex flex-col min-w-0 h-full">
          
          <div className="flex-none bg-black/60 border-b border-orange-500/30 p-3 shrink-0 backdrop-blur-sm z-10 relative">
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-orange-400 font-cinzel text-lg uppercase tracking-widest flex items-center gap-2">
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
              className="rounded-lg shadow-xl shrink-0"
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
                    className="flex-grow bg-black/80 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 focus:border-orange-500 outline-none text-base font-cinzel transition-colors"
                  />
                  <button 
                    onClick={handleLoadSong}
                    className="px-5 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-cinzel text-base tracking-widest rounded-lg transition-all shadow-md shrink-0"
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
                  <span className="text-lg font-bold font-cinzel text-orange-500 mb-1 tracking-widest uppercase drop-shadow-md">
                    {msg.profiles?.username || msg.profiles?.full_name || 'Anonymous Seeker'}
                  </span>
                                    
                  <div className={`max-w-[85%] p-3 rounded-md text-lg font-bold font-cinzel shadow-xl flex flex-col ${msg.user_id === user?.id ? 'bg-orange-600/90 text-white rounded-tr-none backdrop-blur-sm' : 'bg-zinc-900/80 text-gray-200 rounded-tl-none border border-orange-900/30 backdrop-blur-sm'}`}>
                      
                    {msg.parent_id && (
                      <div className="bg-black/30 border-l-4 border-orange-400/50 rounded-r p-2 mb-2 text-lg text-gray-300/90">
                        <span className="font-cinzel text-orange-300/80 text-lg uppercase tracking-widest block mb-1">
                          Replying to {parentMsg?.profiles?.username || parentMsg?.profiles?.full_name || 'a seeker'}
                        </span>
                        <span className="line-clamp-2 italic text-lg text-gray-400">
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
                  <Image 
                    src={msg.image_url} 
                    alt="Attached image" 
                    width={250}
                    height={250}
                    className="mt-3 md:w-[250px] md:h-[250px] object-contain rounded-lg border border-black/30 shadow-lg" 
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
                            className={`text-lg px-2 py-0.5 rounded-full border transition-colors ${hasReacted ? 'bg-orange-500/40 border-orange-400 text-white' : 'bg-black/30 border-gray-600 hover:border-gray-400 text-gray-300'}`}
                          >
                            {emoji} {users.length}
                          </button>
                        );
                      })}

                      <div className="relative">
                        <button 
                          onClick={() => setActivePickerId(activePickerId === msg.id ? null : msg.id)}
                          className={`text-lg px-2 py-0.5 rounded-full border transition-all ${activePickerId === msg.id ? 'bg-black/50 border-gray-400 text-white' : 'text-gray-400 border-transparent hover:bg-black/30 hover:text-white'}`}
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
                        className="text-lg text-gray-300 hover:text-white ml-auto font-cinzel tracking-widest border border-transparent hover:border-orange-400/50 rounded px-2 py-1 transition-all"
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
              <span className="text-lg font-cinzel text-orange-200 truncate">
                Replying to: <span className="text-white">"{replyingTo.content?.substring(0, 40)}..."</span>
              </span>
              <button onClick={() => setReplyingTo(null)} className="text-red-400 hover:text-red-300 text-lg font-bold px-2 tracking-widest">
                ✕ CANCEL
              </button>
            </div>
          )}

          <div className="flex-none relative">
  {/* EMOJI PICKER */}
  {showEmojiPicker && (
    <div className="absolute bottom-full left-4 mb-2 z-50 shadow-2xl">
      <EmojiPicker 
        theme={Theme.DARK} 
        onEmojiClick={(emojiObject) => {
          setNewMessage(prev => prev + emojiObject.emoji);
          setShowEmojiPicker(false);
        }} 
      />
    </div>
  )}

  {/* GIF PICKER */}
  {showGifPicker && (
    <div className="absolute bottom-full left-4 mb-2 z-50 shadow-2xl bg-zinc-900 border border-orange-900/70 rounded-xl p-3 w-[320px] flex flex-col gap-3 max-h-[400px]">
      <input
        type="text"
        placeholder="Search GIPHY..."
        value={gifSearch}
        onChange={(e) => setGifSearch(e.target.value)}
        className="w-full bg-black/50 border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-orange-500 font-cinzel text-sm"
      />
      <div className="overflow-y-auto flex-1 rounded bg-black/20 [&::-webkit-scrollbar]:hidden">
        <Grid
          width={294}
          columns={2}
          fetchGifs={fetchGifs}
          key={gifSearch} 
          onGifClick={(gif, e) => {
            e.preventDefault();
            sendGifMessage(gif.images.original.url);
            setShowGifPicker(false);
            setGifSearch(''); 
          }}
        />
      </div>
    </div>
  )}
  
  {/* WHISPER INDICATOR */}
  {privateRecipient && (
    <div className="bg-purple-900/40 border-t border-x border-purple-500/50 rounded-t-xl px-4 py-2 flex justify-between items-center mb-[-1px] relative z-10 backdrop-blur-md">
      <span className="text-purple-300 font-cinzel text-sm">
        Whispering to: <span className="font-bold text-white">{privateRecipient.username}</span>
      </span>
      <button 
        type="button"
        onClick={() => setPrivateRecipient(null)}
        className="text-gray-400 hover:text-red-400 transition-colors px-2"
        title="Cancel private message"
      >
        ✖
      </button>
    </div>
  )}

{/* CHAT INPUT FORM */}
  <form onSubmit={sendMessage} className="p-3 bg-black/80 backdrop-blur-md border-t border-orange-900/30 flex gap-2 items-center">
    
    {/* HIDDEN FILE INPUT */}
    <input 
      type="file" 
      accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,audio/webm,audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/aac"
      className="hidden" 
      ref={fileInputRef} 
      onChange={handleFileUpload} 
    />

    {/* ATTACHMENT BUTTON */}
    <button 
      type="button" 
      onClick={() => fileInputRef.current?.click()}
      disabled={isUploading}
      className={`text-xl transition-transform px-2 shrink-0 bg-transparent border-none cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed animate-pulse' : 'hover:scale-110 text-gray-400 hover:text-white'}`}
      title="Attach a file"
    >
      📎
    </button>

    <button 
      type="button" 
      onClick={() => {
        setShowGifPicker(!showGifPicker);
        setShowEmojiPicker(false); 
      }}
      className="text-lg font-bold font-cinzel text-gray-400 hover:text-white transition-colors px-2 shrink-0 bg-transparent border-none cursor-pointer"
      title="Add a GIF"
    >
      GIF
    </button>

    <button 
      type="button" 
      onClick={() => {
        setShowEmojiPicker(!showEmojiPicker);
        setShowGifPicker(false); 
      }}
      className="text-2xl hover:scale-110 transition-transform px-2 shrink-0 bg-transparent border-none cursor-pointer"
      title="Add an emoji"
    >
      😀
    </button>

    <input type="text" disabled={!user || isUploading} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={isUploading ? "Uploading..." : "Speak your truth..."} className="flex-1 bg-zinc-950/80 border border-orange-900/50 rounded-full px-4 py-2 text-white text-lg focus:outline-none focus:border-orange-500 font-cinzel" />
    
    <button type="submit" disabled={isUploading} className={`bg-orange-600 hover:bg-orange-500 text-white px-5 py-2 rounded-full font-cinzel text-lg tracking-widest transition-colors shadow-md shadow-orange-900/50 shrink-0 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
      SEND
    </button>
  </form>
</div>

          <div className="md:hidden flex-none bg-black/90 backdrop-blur-md border-t border-orange-900/40 flex overflow-x-auto p-2 gap-2 [&::-webkit-scrollbar]:hidden">
            {PUBLIC_CHANNELS.map(ch => (
              <button key={ch.id} onClick={() => setActiveRoom(ch.id)} className={`flex-shrink-0 px-3 py-1.5 rounded-full font-cinzel text-base tracking-tighter border transition-colors ${activeRoom === ch.id ? 'bg-orange-600 text-white border-orange-500 shadow-[0_0_8px_rgba(234,88,12,0.6)]' : 'bg-zinc-900/50 text-gray-400 border-orange-900/30'}`}>
                {ch.shortName}
              </button>
            ))}
            {isAdmin && <button onClick={() => setActiveRoom('admin-chat')} className={`flex-shrink-0 px-3 py-1.5 rounded-full font-cinzel text-base tracking-tighter border ${activeRoom === 'admin-chat' ? 'bg-red-800 text-white border-red-500' : 'bg-red-950/50 text-red-600 border-red-900/30'}`}>ADMIN</button>}
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