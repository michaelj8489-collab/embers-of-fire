'use client';

import React from 'react';

export default function DefiningYourCharacterPage() {
  return (
    <div className="relative min-h-screen bg-black text-gray-200 pt-32 pb-20 px-6 overflow-hidden">
      
      {/* BACKGROUND IMAGE - Set to 20% opacity against the black background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: "url('/images/jmc-edits-palettes/defining-your-character.jpg')" }}
      />
      
      {/* VIGNETTE OVERLAY - Fades the edges into the black background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black via-transparent to-black" />

      <div className="relative z-10 max-w-5xl mx-auto">
        
        {/* SHOW TITLE HEADER */}
        <div className="text-center mb-16">
          <h1 className="font-cinzel-decorative text-4xl md:text-7xl text-orange-500 uppercase tracking-[0.15em] mb-4 drop-shadow-[0_0_20px_rgba(234,88,12,0.5)]">
            Defining Your Character
          </h1>
          <p className="font-cormorant italic text-xl md:text-2xl text-orange-300/90 tracking-widest">
            Returning to RISE Radio — April 19, 2026
          </p>
          <div className="h-px w-64 bg-gradient-to-r from-transparent via-orange-900/50 to-transparent mx-auto mt-8" />
        </div>

        {/* RISE RADIO LIVE PLAYER */}
        <section className="max-w-xl mx-auto mb-24">
          <div className="bg-zinc-900/60 border border-orange-500/20 p-8 rounded-2xl backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <h2 className="font-cinzel text-xs uppercase tracking-[0.4em] text-gray-400">Live RISE Radio Stream</h2>
            </div>
            
            {/* ZENO STATION PLAYER */}
            <audio controls className="w-full h-12 accent-orange-500">
              <source src="https://stream.zeno.fm/4wd4w83qgy8uv" type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            
            <p className="font-cormorant text-center text-gray-500 mt-4 italic text-sm tracking-wide">
              Tune in for the broadcast on RISE Radio
            </p>
          </div>
        </section>

        {/* DEDICATED ARCHIVES */}
        <section>
          <div className="flex items-center gap-4 mb-10">
            <div className="h-px flex-1 bg-orange-900/30"></div>
            <h2 className="font-cinzel text-lg text-orange-400 uppercase tracking-[0.3em]">The Archives</h2>
            <div className="h-px flex-1 bg-orange-900/30"></div>
          </div>

          <div className="bg-black/50 border border-orange-900/20 rounded-xl overflow-hidden backdrop-blur-sm">
            {/* ZENO PODCAST EMBED (Uses the RSS link data automatically) */}
            <iframe 
              src="https://zeno.fm/podcast/defining-your-character/embed/" 
              width="100%" 
              height="450px" 
              frameBorder="0" 
              scrolling="no"
              className="opacity-80 hover:opacity-100 transition-opacity"
            ></iframe>
          </div>
          
          <div className="text-center mt-8">
            <a 
              href="https://podcast.zenomedia.com/api/public/podcasts/abc09539-d2ed-404a-b34c-43a1f76999af/rss" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-cormorant text-orange-900/60 hover:text-orange-500 text-sm italic transition-colors tracking-widest"
            >
              Access RSS Feed
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}