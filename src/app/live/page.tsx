/* eslint-disable */
'use client';

import React, { useState, useEffect } from 'react';

export default function LivePage() {
  // Hardcoded to true so you can see it working immediately!
  const [isLive, setIsLive] = useState(true); 
  const [parentDomain, setParentDomain] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setParentDomain(window.location.hostname);
    }
  }, []);

  const STREAM_1_WIDGET = "https://stream.zeno.fm/4wd4w83qgy8uv";
  const STREAM_2_WIDGET = "https://stream.zeno.fm/hvh0vw6jdowtv";

  return (
    <main className="min-h-screen bg-black pt-24 pb-32 px-4 flex flex-col items-center overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto space-y-12">
        
        {/* 1. ZENO PLAYERS (Pinned at the top for quick audio access) */}
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

        {/* 2. TWITCH BROADCAST (Exact clone of Phoenix Talks Layout) */}
        <div className="w-full border border-orange-900/50 rounded-xl overflow-hidden shadow-2xl bg-black relative md:h-[600px]">
          {isLive ? (
            <div className="flex flex-col md:flex-row w-full h-full">
              {/* VIDEO */}
              <iframe 
                src={`https://player.twitch.tv/?channel=riseradionetworks&parent=${parentDomain || 'embersoflight.net'}&autoplay=true`} 
                className="w-full aspect-video md:aspect-auto md:flex-grow md:h-full" 
                frameBorder="0" 
                allowFullScreen
              ></iframe>
              
              {/* CHAT */}
              <iframe 
                src={`https://www.twitch.tv/embed/riseradionetworks/chat?parent=${parentDomain || 'embersoflight.net'}&darkpopout`} 
                className="w-full h-[400px] md:w-[350px] md:h-full border-t md:border-l border-orange-900/30" 
                frameBorder="0"
              ></iframe>
            </div>
          ) : (
            <div className="w-full h-full aspect-video md:aspect-auto flex items-center justify-center bg-gradient-to-br from-orange-950/20 via-black to-black relative">
               <div className="absolute w-64 h-64 bg-orange-600/5 rounded-full blur-[100px]"></div>
               <div className="relative z-10 font-cinzel text-orange-500/80 text-sm md:text-xl tracking-[0.5em] uppercase animate-pulse text-center px-6">
                  Broadcast Resting
               </div>
            </div>
          )}
        </div>
        
      </div>
    </main>
  );
}