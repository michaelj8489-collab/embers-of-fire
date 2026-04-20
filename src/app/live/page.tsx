'use client';

import React, { useState } from 'react';

export default function LivePage() {
  const [isLive, setIsLive] = useState(false); 

  const TWITCH_CHANNEL = "riseradionetworks";
  const PARENT_DOMAINS = "&parent=embersoflight.net&parent=localhost";

  // Using the exact Zeno widget format from your working desktop version
  const STREAM_1_WIDGET = "https://ms-radio.net/cp/widgets/player/single/?p=https://zeno.fm/player/4wd4w83qgy8uv";
  const STREAM_2_WIDGET = "https://ms-radio.net/cp/widgets/player/single/?p=https://zeno.fm/player/hvh0vw6jdowtv";

  return (
    <main className="min-h-screen bg-black pt-24 pb-24 px-4 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-8">
        
        {/* TWITCH PLAYER */}
        <div className="aspect-video w-full rounded-3xl overflow-hidden border border-orange-900/30 bg-black relative shadow-2xl">
          {isLive ? (
            <iframe src={`https://player.twitch.tv/?channel=${TWITCH_CHANNEL}${PARENT_DOMAINS}&autoplay=true`} className="w-full h-full" allowFullScreen></iframe>
          ) : (
            <img src="/offline-banner.png" alt="Offline" className="w-full h-full object-cover opacity-60" />
          )}
        </div>

        {/* ZENO PLAYERS - STACKED FOR MOBILE CLARITY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900/50 p-4 rounded-2xl border border-orange-900/20">
            <h3 className="font-cinzel text-orange-500 text-xs mb-3 uppercase tracking-widest">Rise Radio Main</h3>
            <iframe src={STREAM_1_WIDGET} width="100%" height="120" frameBorder="0" scrolling="no" className="rounded-lg"></iframe>
          </div>

          <div className="bg-gray-900/50 p-4 rounded-2xl border border-orange-900/20">
            <h3 className="font-cinzel text-orange-500 text-xs mb-3 uppercase tracking-widest">Rise Awakenings</h3>
            <iframe src={STREAM_2_WIDGET} width="100%" height="120" frameBorder="0" scrolling="no" className="rounded-lg"></iframe>
          </div>
        </div>

        {/* TWITCH CHAT (MOVED BELOW PLAYERS FOR MOBILE) */}
        <div className="w-full h-[400px] bg-gray-900/50 rounded-3xl border border-orange-900/30 overflow-hidden shadow-xl">
           <div className="p-3 bg-orange-950/20 border-b border-orange-900/20 text-center font-cinzel text-orange-500 text-xs tracking-widest">Live Sanctuary Chat</div>
           {isLive ? (
             <iframe src={`https://www.twitch.tv/embed/${TWITCH_CHANNEL}/chat?${PARENT_DOMAINS}&darkpopout`} className="w-full h-full"></iframe>
           ) : (
             <div className="flex h-full items-center justify-center font-cormorant italic text-gray-500 px-10 text-center">Visual broadcast is resting. Check the Global Sanctuary for chat!</div>
           )}
        </div>
      </div>
    </main>
  );
}