'use client';

import React, { useState } from 'react';

export default function LivePage() {
  // THE MASTER SWITCH: Set this to 'true' when you are live!
  // Set to 'false' to show the beautiful "Station Offline" visual.
  const [isLive, setIsLive] = useState(false); 

  const TWITCH_CHANNEL = "riseradionetworks";
  // The secured parent domains that are allowed to embed your stream
  const PARENT_DOMAINS = "&parent=embersoflight.net&parent=localhost";

  // Zeno FM links for the audio (these will stay)
  const ZENO_PLAYER_URL = "https://ms-radio.net/cp/widgets/player/single/?p=https://zeno.fm/player/riseradionetwork";

  return (
    <main className="min-h-screen bg-black pt-28 pb-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-7xl flex flex-col gap-8">
        
        {/* SECTION 1: THE VIDEO (With "Offline" Placeholder) */}
        <div className="bg-gray-900/50 border border-orange-900/30 rounded-3xl p-6 shadow-xl backdrop-blur-sm">
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner relative border border-orange-950/50">
            
            {isLive ? (
              // SECURED TWITCH PLAYER (Muted by default for better user experience)
              <iframe
                src={`https://player.twitch.tv/?channel=${TWITCH_CHANNEL}${PARENT_DOMAINS}&muted=true&autoplay=true`}
                className="w-full h-full"
                allowFullScreen
              ></iframe>
            ) : (
              // THE BEAUTIFUL "OFFLINE" SANCTUARY
              <div className="relative w-full h-full flex items-center justify-center">
                <img 
                  src="/offline-banner.png" 
                  alt="Station Offline - The Embers are Resting" 
                  className="w-full h-full object-cover"
                />
                  {/* Simple button to test the toggle (you can remove this later) */}
                <button 
                  onClick={() => setIsLive(true)}
                  className="absolute bottom-10 bg-orange-600/50 text-white font-cinzel text-xs px-4 py-2 rounded-full backdrop-blur-sm"
                >
                  (Dev Mode: Test 'Go Live')
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: AUDIO PLAYERS AND CHAT (Side-by-Side) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Audio Players (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Audio Stream 1 */}
            <div className="bg-gray-900/30 border border-orange-900/20 rounded-2xl p-6 shadow-md">
              <h3 className="font-cinzel text-orange-500 uppercase tracking-widest text-lg mb-4">Rise Audio Stream 1</h3>
              <iframe src={ZENO_PLAYER_URL} width="100%" height="100" frameBorder="0" scrolling="no" className="rounded-lg"></iframe>
            </div>
            
            {/* Audio Stream 2 (Placeholder) */}
            <div className="bg-gray-900/30 border border-orange-900/20 rounded-2xl p-6 shadow-md">
              <h3 className="font-cinzel text-orange-500 uppercase tracking-widest text-lg mb-4">Rise Audio Stream 2</h3>
              <iframe src={ZENO_PLAYER_URL} width="100%" height="100" frameBorder="0" scrolling="no" className="rounded-lg"></iframe>
            </div>
          </div>

          {/* SECURED TWITCH CHAT (1/3 width, only shows if Live) */}
          <div className="lg:col-span-1 bg-gray-900/50 border border-orange-900/30 rounded-2xl p-4 shadow-xl backdrop-blur-sm h-full flex flex-col">
            <h3 className="font-cinzel text-orange-500 uppercase tracking-widest text-center text-xl mb-4 p-2 border-b border-orange-900/20">Live Sanctuary Chat</h3>
            {isLive ? (
              <iframe
                id="chat_embed"
                src={`https://www.twitch.tv/embed/${TWITCH_CHANNEL}/chat?${PARENT_DOMAINS}`}
                className="w-full h-full flex-1 rounded-xl"
              ></iframe>
            ) : (
               <div className="flex-1 flex items-center justify-center text-center p-6 bg-gray-950/50 rounded-xl border border-orange-900/10 font-cormorant italic text-gray-500">
                Chat is restricted when the broadcast is offline... 
                The conversation continues in the Global Sanctuary.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}