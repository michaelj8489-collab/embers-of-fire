'use client';

import React, { useState, useEffect } from 'react';

export default function LivePage() {
  // Toggle this to true when you are actually broadcasting!
  const [isLive, setIsLive] = useState(false); 
  const [domain, setDomain] = useState('');

  const TWITCH_CHANNEL = "riseradionetworks";

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDomain(window.location.hostname);
    }
  }, []);

  const STREAM_1_WIDGET = "https://stream.zeno.fm/4wd4w83qgy8uv";
  const STREAM_2_WIDGET = "https://stream.zeno.fm/hvh0vw6jdowtv";

  return (
    <main className="min-h-screen bg-black pt-24 pb-32 px-4 flex flex-col items-center overflow-x-hidden">
      <div className="w-full max-w-5xl space-y-6">
        
        {/* 1. ZENO PLAYERS (NOW AT THE TOP) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900/50 p-4 rounded-2xl border border-orange-900/20">
            <h3 className="font-cinzel text-orange-500 text-[10px] mb-3 uppercase tracking-widest">Rise Radio Main</h3>
            <iframe src={STREAM_1_WIDGET} width="100%" height="120" frameBorder="0" scrolling="no" className="rounded-lg"></iframe>
          </div>

          <div className="bg-gray-900/50 p-4 rounded-2xl border border-orange-900/20">
            <h3 className="font-cinzel text-orange-500 text-[10px] mb-3 uppercase tracking-widest">Rise Awakenings</h3>
            <iframe src={STREAM_2_WIDGET} width="100%" height="120" frameBorder="0" scrolling="no" className="rounded-lg"></iframe>
          </div>
        </div>

        {/* 2. THE UNIFIED BROADCAST MODULE (VIDEO + CHAT BACK-TO-BACK) */}
        <div className="w-full rounded-3xl overflow-hidden border border-orange-900/30 bg-black shadow-2xl flex flex-col">
          
          {/* TWITCH VIDEO (Top Half) */}
          <div className="aspect-video w-full bg-black relative border-b border-orange-900/30">
            {isLive && domain ? (
              <iframe 
                src={`https://player.twitch.tv/?channel=${TWITCH_CHANNEL}&parent=${domain}&autoplay=true&muted=false`} 
                className="absolute inset-0 w-full h-full" 
                allowFullScreen
              ></iframe>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                 <img src="/offline-banner.png" alt="Offline" className="w-full h-full object-cover opacity-30" />
                 <div className="absolute font-cinzel text-orange-500 text-sm tracking-[0.4em] uppercase animate-pulse">Broadcast Resting</div>
              </div>
            )}
          </div>

          {/* TWITCH CHAT (Bottom Half - No space between) */}
          <div className="h-[450px] flex flex-col bg-gray-900/40">
            <div className="p-2 bg-orange-950/20 border-b border-orange-900/10 text-center font-cinzel text-orange-500 text-[9px] tracking-[0.2em] uppercase">
              Sanctuary Live Feed
            </div>
            <div className="flex-1">
              {isLive && domain ? (
                <iframe 
                  src={`https://www.twitch.tv/embed/${TWITCH_CHANNEL}/chat?parent=${domain}&darkpopout`} 
                  className="w-full h-full"
                ></iframe>
              ) : (
                <div className="flex h-full items-center justify-center font-cormorant italic text-gray-600 px-10 text-center text-base">
                  Chat will ignite when the broadcast begins.
                </div>
              )}
            </div>
          </div>

        </div>
        
      </div>
    </main>
  );
}