'use client';

import React, { useState } from 'react';

export default function LivePage() {
  // 📻 THE FREQUENCIES (Locked and Loaded)
  const twitchChannel = "riseradionetworks"; 
  const riseRadioUrl = "https://stream.zeno.fm/4wd4w83qgy8uv";
  const riseAwakeningsUrl = "https://stream.zeno.fm/hvh0vw6jdowtv";

  // State to track which radio station is playing
  const [activeStation, setActiveStation] = useState<'rise' | 'awakenings'>('rise');

  return (
    <main className="min-h-screen pt-24 pb-28 px-4 flex flex-col items-center bg-black">
      
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="font-cinzel-decorative text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 tracking-widest uppercase">
          The Frequency
        </h1>
        <p className="font-cormorant text-gray-400 text-lg mt-2 italic">
          Tune into the pulse of the Sanctuary.
        </p>
      </div>

      {/* Twitch Video Section */}
      <div className="w-full max-w-4xl bg-gray-900/80 border border-orange-900/50 rounded-xl overflow-hidden mb-10 shadow-[0_0_20px_rgba(234,88,12,0.15)]">
        <div className="bg-gradient-to-r from-orange-950 to-black p-4 border-b border-orange-900/50 flex justify-between items-center">
          <h2 className="font-cinzel text-xl text-gray-200 tracking-widest uppercase">Live Broadcast</h2>
          <span className="flex items-center gap-2 text-red-500 text-sm font-bold font-cinzel tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span> LIVE
          </span>
        </div>
        
        {/* The Twitch Embed */}
        <div className="aspect-video w-full bg-black flex items-center justify-center relative">
          <iframe
            src={`https://player.twitch.tv/?channel=${twitchChannel}&parent=embersoflight.net&parent=localhost`}
            height="100%"
            width="100%"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full border-none"
          ></iframe>
        </div>
      </div>

      {/* Rise Radio Audio Section with Switcher */}
      <div className="w-full max-w-4xl bg-gray-900/80 border border-orange-900/50 rounded-xl p-6 shadow-[0_0_20px_rgba(234,88,12,0.15)] flex flex-col items-center text-center">
        <h2 className="font-cinzel text-2xl text-gray-200 tracking-widest uppercase mb-2">Network Audio</h2>
        <p className="font-cormorant text-gray-400 mb-6">Select your frequency below.</p>
        
        {/* The Station Switcher Buttons */}
        <div className="flex gap-4 w-full mb-6">
          <button 
            onClick={() => setActiveStation('rise')}
            className={`flex-1 py-3 rounded-lg font-cinzel tracking-wider transition-all duration-300 ${
              activeStation === 'rise' 
                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.4)]' 
                : 'bg-black border border-orange-900/50 text-gray-400 hover:text-orange-400'
            }`}
          >
            RISE RADIO
          </button>
          
          <button 
            onClick={() => setActiveStation('awakenings')}
            className={`flex-1 py-3 rounded-lg font-cinzel tracking-wider transition-all duration-300 ${
              activeStation === 'awakenings' 
                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.4)]' 
                : 'bg-black border border-orange-900/50 text-gray-400 hover:text-orange-400'
            }`}
          >
            AWAKENINGS
          </button>
        </div>

        {/* The Audio Player */}
        <div className="w-full bg-black/50 p-4 rounded-lg border border-orange-900/30">
          <audio 
            key={activeStation} 
            controls 
            autoPlay 
            className="w-full"
          >
            <source 
              src={activeStation === 'rise' ? riseRadioUrl : riseAwakeningsUrl} 
              type="audio/mpeg" 
            />
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>

    </main>
  );
}