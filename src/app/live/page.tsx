'use client';

import React, { useState } from 'react';

export default function LivePage() {
  // THE MASTER SWITCH: Set to 'true' for live video, 'false' for the Phoenix banner.
  const [isLive, setIsLive] = useState(false); 

  const TWITCH_CHANNEL = "riseradionetworks";
  const PARENT_DOMAINS = "&parent=embersoflight.net&parent=localhost";

  // VERIFIED ZENO STREAMS
  const RISE_RADIO_MAIN = "https://ms-radio.net/cp/widgets/player/single/?p=https://zeno.fm/player/4wd4w83qgy8uv";
  const RISE_AWAKENINGS = "https://ms-radio.net/cp/widgets/player/single/?p=https://zeno.fm/player/hvh0vw6jdowtv";

  return (
    <main className="min-h-screen bg-black pt-24 pb-12 px-4 flex flex-col items-center overflow-x-hidden">
      <div className="w-full max-w-6xl flex flex-col gap-6 md:gap-10">
        
        {/* VIDEO SECTION */}
        <div className="w-full bg-gray-900/40 border border-orange-900/30 rounded-3xl p-4 md:p-6 shadow-2xl backdrop-blur-md">
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black relative border border-orange-950/50 shadow-inner">
            {isLive ? (
              <iframe
                src={`https://player.twitch.tv/?channel=${TWITCH_CHANNEL}${PARENT_DOMAINS}&muted=false&autoplay=true`}
                className="w-full h-full"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <img 
                  src="/offline-banner.png" 
                  alt="Station Offline" 
                  className="absolute inset-0 w-full h-full object-cover opacity-70"
                />
                <div className="relative z-10 text-center px-4">
                  <h2 className="font-cinzel text-xl md:text-3xl text-orange-500 tracking-[0.3em] uppercase drop-shadow-[0_0_15px_rgba(0,0,0,1)]">
                    Station Offline
                  </h2>
                  <p className="font-cormorant text-gray-300 italic text-sm md:text-lg mt-2 drop-shadow-md">
                    The embers are resting. Audio streams remain active below.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AUDIO & CHAT SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
          
          {/* Audio Players (Left Side) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* STREAM 1: RISE RADIO MAIN */}
            <div className="bg-gray-900/50 border border-orange-900/20 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
              <h3 className="font-cinzel text-orange-500 uppercase tracking-widest text-sm mb-4 border-b border-orange-900/20 pb-2">
                🔴 Rise Radio // Main
              </h3>
              <div className="rounded-xl overflow-hidden border border-orange-900/10 shadow-inner bg-black/40">
                <iframe 
                  src={RISE_RADIO_MAIN} 
                  width="100%" 
                  height="120" 
                  frameBorder="0" 
                  scrolling="no"
                ></iframe>
              </div>
            </div>

            {/* STREAM 2: RISE AWAKENINGS */}
            <div className="bg-gray-900/50 border border-orange-900/20 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
              <h3 className="font-cinzel text-orange-500 uppercase tracking-widest text-sm mb-4 border-b border-orange-900/20 pb-2">
                🟠 Rise Awakenings
              </h3>
              <div className="rounded-xl overflow-hidden border border-orange-900/10 shadow-inner bg-black/40">
                <iframe 
                  src={RISE_AWAKENINGS} 
                  width="100%" 
                  height="120" 
                  frameBorder="0" 
                  scrolling="no"
                ></iframe>
              </div>
            </div>
          </div>

          {/* Twitch Chat (Right Side) */}
          <div className="lg:col-span-1 bg-gray-900/60 border border-orange-900/30 rounded-2xl flex flex-col h-[450px] lg:h-auto shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-orange-900/20 bg-orange-950/10">
              <h3 className="font-cinzel text-orange-500 uppercase tracking-widest text-center text-sm">
                Live Sanctuary Chat
              </h3>
            </div>
            <div className="flex-1">
              {isLive ? (
                <iframe
                  id="chat_embed"
                  src={`https://www.twitch.tv/embed/${TWITCH_CHANNEL}/chat?${PARENT_DOMAINS}&darkpopout`}
                  className="w-full h-full"
                ></iframe>
              ) : (
                <div className="h-full flex items-center justify-center p-8 text-center bg-black/20">
                  <p className="font-cormorant italic text-gray-500 text-lg">
                    Twitch chat is offline. The community stays warm in the Global Sanctuary.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}