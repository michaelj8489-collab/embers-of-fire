'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import MerchGallery from '@/components/MerchGallery';

// --- TYPESCRIPT BLUEPRINTS ---
interface Episode {
  title: string;
  enclosureUrl: string;
  pubDate: string;
}

const honkyProducts = [
  { 
    id: 1, 
    name: "Honkey Tonk Heaven Tote Bag", 
    price: "$18.68", 
    image: "https://images-api.printify.com/mockup/69c6d60f5d464f51890b3889/101409/93895/honkey-tonk-heaven-cotton-canvas-tote-bag.jpg?camera_label=front&revision=1775077288055&s=2048", 
    link: "https://embers-of-light.printify.me/product/27606139" 
  },
  { 
    id: 2, 
    name: "Honky Tonk Heaven Baseball Cap", 
    price: "$17.36", 
    image: "https://images-api.printify.com/mockup/69cec335905c4029f50a4b75/104280/53890/honky-tonk-heaven-baseball-cap.jpg?camera_label=front&revision=1775158224296&s=2048", 
    link: "https://embers-of-light.printify.me/product/27752272" 
  },
  { 
    id: 3, 
    name: "Unisex Heavy Cotton Tee", 
    price: "$25.36", 
    image: "https://images-api.printify.com/mockup/69c6d462ec1bf4d5cd0ae11d/12100/92570/honkey-tonk-heaven-unisex-heavy-cotton-tee.jpg?camera_label=front&revision=1775077264478&s=2048", 
    link: "https://embers-of-light.printify.me/product/27606074" 
  },
  { 
    id: 4, 
    name: "Ceramic Mug (11oz, 15oz)", 
    price: "$7.93", 
    image: "https://images-api.printify.com/mockup/69c6d59e5d464f51890b386d/65216/6310/honkey-tonk-heaven-ceramic-mug-11oz-15oz.jpg?camera_label=front&revision=1775077287644&s=2048", 
    link: "https://embers-of-light.printify.me/product/27606109" 
  },
  { 
    id: 5, 
    name: "Country Bar Themed Poker Cards", 
    price: "$16.69", 
    image: "https://images-api.printify.com/mockup/69c6f73ddfda05aa090e5226/72763/16751/honky-tonk-heaven-poker-playing-cards-country-bar-themed-deck.jpg?camera_label=context-2&revision=1775077289097&s=2048", 
    link: "https://embers-of-light.printify.me/product/27609187" 
  }
];

export default function HonkyTonkPage() {
  // --- RSS FEED STATE (Now with TypeScript definitions!) ---
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);

  // --- FETCH RSS FEED DATA ---
  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        const rssUrl = "https://podcast.zenomedia.com/api/public/podcasts/agxzfnplbm8tc3RhdHNyKwsSCkF1dGhFbnRpdHkYgICwodK2xgoMCxIHUG9kY2FzdBiAgMjmvvu8CwyiAQdsaWJyYXJ5/rss";
        const res = await fetch(rssUrl);
        const text = await res.text();
        
        // Parse the XML response
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');
        const items = Array.from(xml.querySelectorAll('item'));

        // Extract the episode data we need
        const parsedEpisodes: Episode[] = items.map(item => ({
          title: item.querySelector('title')?.textContent || 'Unknown Episode',
          enclosureUrl: item.querySelector('enclosure')?.getAttribute('url') || '',
          pubDate: item.querySelector('pubDate')?.textContent || ''
        })).filter(ep => ep.enclosureUrl); // Only keep items that actually have an audio file attached

        setEpisodes(parsedEpisodes);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch podcast feed:", err);
        setLoading(false);
      }
    };

    fetchPodcast();
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-hidden font-cormorant text-gray-200">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/media-4/honky-tonk-heaven.jpg" 
          alt="Honky Tonk Background" 
          className="w-full h-full object-cover fixed opacity-40" 
        />
        <div className="absolute inset-0 bg-[#4B0082]/40 z-10 pointer-events-none fixed"></div>
        <div className="absolute inset-0 bg-black/80 z-10 pointer-events-none fixed"></div>
      </div>

      <div className="relative z-20 flex flex-col min-h-screen w-full">
        <Header />
        
        <main className="flex-grow flex flex-col items-center pt-24 pb-12 px-4 w-full">
          <div className="w-full max-w-7xl px-4 md:px-0">
            
            {/* Standard Nav Link Fix */}
            <div className="mb-12">
              <Link href="/dashboard" className="text-orange-500 hover:text-orange-400 font-cinzel tracking-widest transition-colors flex items-center gap-2 w-fit uppercase text-sm font-bold">
                <span>←</span> BACK TO DASHBOARD
              </Link>
            </div>

            {/* Hero Header */}
            <div className="text-center mb-16 border-b border-orange-900/30 pb-12">
              <h1 className="font-cinzel-decorative font-bold text-5xl md:text-7xl mb-6 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#FF4500] via-[#FFD700] to-[#FF4500]">
                Honky Tonk Heaven
              </h1>
              <p className="font-cinzel text-2xl text-[#FFF8DC]/90 italic tracking-wide">
                "Classic country and southern soul."
              </p>
            </div>

            {/* LIVE Player Section */}
            <div className="w-full max-w-4xl mx-auto bg-black/60 backdrop-blur-md p-8 rounded-2xl border border-orange-500/20 shadow-2xl mb-8">
               <h3 className="font-cinzel text-orange-400 text-center mb-8 tracking-[0.2em] uppercase font-bold">Honky Tonk Heaven: Live Broadcast</h3>
               <div className="w-full flex justify-center">
                 <iframe 
                   src="https://zeno.fm/player/rise-radio-woqo" 
                   width="100%" 
                   height="120" 
                   frameBorder="0" 
                   scrolling="no" 
                   className="rounded-lg shadow-2xl"
                 ></iframe>
               </div>
            </div>

            {/* ARCHIVE Player Section (The New RSS Integration) */}
            <div className="w-full max-w-4xl mx-auto bg-black/60 backdrop-blur-md p-8 rounded-2xl border border-orange-500/20 shadow-2xl mb-16">
               <h3 className="font-cinzel text-orange-400 text-center mb-8 tracking-[0.2em] uppercase font-bold">The Archives: Past Episodes</h3>
               
               {loading ? (
                  <p className="text-center font-cormorant text-orange-200/60 italic text-xl animate-pulse">Loading the vault...</p>
               ) : episodes.length > 0 ? (
                  <div className="flex flex-col gap-6">
                    
                    {/* The Active Audio Player */}
                    {activeEpisode ? (
                      <div className="bg-orange-900/20 border border-orange-500/40 p-4 rounded-xl">
                        <h4 className="font-cinzel text-orange-300 font-bold mb-4 text-lg">{activeEpisode.title}</h4>
                        <audio controls src={activeEpisode.enclosureUrl} className="w-full h-12 outline-none rounded-lg" autoPlay>
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    ) : (
                      <div className="bg-black/40 border border-gray-800 p-4 rounded-xl text-center">
                         <p className="font-cinzel text-gray-400 tracking-wide text-sm">SELECT AN EPISODE BELOW TO PLAY</p>
                      </div>
                    )}

                    {/* The Scrollable Episode List */}
                    <div className="max-h-80 overflow-y-auto flex flex-col gap-3 pr-2 scrollbar-thin scrollbar-thumb-orange-700 scrollbar-track-black/40">
                      {episodes.map((ep, idx) => {
                        const isPlaying = activeEpisode?.enclosureUrl === ep.enclosureUrl;
                        return (
                          <button
                            key={idx}
                            onClick={() => setActiveEpisode(ep)}
                            className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                              isPlaying
                                ? 'bg-orange-600/30 border-orange-500 text-white shadow-lg'
                                : 'bg-black/50 border-gray-800 text-gray-300 hover:border-orange-500/50 hover:bg-orange-900/20'
                            }`}
                          >
                            <div className={`font-cinzel font-bold text-lg mb-1 ${isPlaying ? 'text-orange-300' : ''}`}>
                              {ep.title}
                            </div>
                            <div className="font-cormorant text-sm opacity-60">
                              {new Date(ep.pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
               ) : (
                  <p className="text-center font-cormorant text-gray-400 italic text-xl">No archived episodes found.</p>
               )}
            </div>

            {/* --- MERCH GALLERY --- */}
            <MerchGallery showName="Honky Tonk Heaven" products={honkyProducts} />

            {/* --- INFO SECTION: ABOUT & HOST --- */}
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 mb-16">
              
              {/* About Section */}
              <div className="bg-orange-900/10 border-l-4 border-orange-600 p-8 rounded-r-xl flex flex-col justify-center">
                 <h4 className="font-cinzel text-orange-500 mb-4 uppercase tracking-widest font-bold">About Honky Tonk Heaven</h4>
                 <p className="font-cormorant text-xl text-gray-200 leading-relaxed italic">
                   Welcome to Honky Tonk Heaven. This dedicated space is designed to showcase the unique energy and soulful expression that defines the RISE community. Join us as we tune into the frequencies that inspire connection, creativity, and the power of independent music.
                 </p>
              </div>

              {/* Meet the Host Section */}
              <div className="bg-black/40 border border-orange-500/20 p-8 rounded-xl flex flex-col items-center text-center shadow-lg">
                 <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-orange-500 mb-6 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                   <img 
                     src="/images/misc/Will.jpg" 
                     alt="Will Iommi - Host of Honky Tonk Heaven" 
                     className="w-full h-full object-cover" 
                   />
                 </div>
                 <h4 className="font-cinzel text-orange-400 mb-2 uppercase tracking-widest font-bold text-xl">Meet the Host</h4>
                 <h5 className="font-cinzel text-gray-200 mb-4 text-lg tracking-wider">Will Iommi</h5>
                 <p className="font-cormorant text-lg text-gray-400 leading-relaxed italic">
                   With a deep-rooted love for classic country and southern soul, Will Iommi brings the authentic sounds of Honky Tonk Heaven to the RISE Radio Network. Will is dedicated to highlighting independent artists and sharing the powerful storytelling that defines the country genre. Whether he's spinning timeless classics or uncovering new voices, his passion for the music and the RISE community shines through every broadcast.
                 </p>
              </div>

            </div>

          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}