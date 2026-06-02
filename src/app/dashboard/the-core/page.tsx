/* eslint-disable */
'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import MerchGallery from '@/components/MerchGallery';

const coreProducts = [
  { 
    id: 1, 
    name: "Cotton Canvas Tote Bag", 
    price: "$18.68", 
    image: "https://images-api.printify.com/mockup/69c3f9d4f4a6bbf9820c5812/101409/93895/the-core-cotton-canvas-tote-bag.jpg?camera_label=front&revision=1775077362399&s=2048", 
    link: "http://embers-of-light.printify.me/product/27561137" 
  },
  { 
    id: 2, 
    name: "Portrait Dad Hat", 
    price: "$17.36", 
    image: "https://images-api.printify.com/mockup/69ceca2dd982abe0a90403c0/82433/53890/the-core-baseball-cap-personalized-portrait-dad-gift.jpg?camera_label=front&revision=1775159994002&s=2048", 
    link: "https://embers-of-light.printify.me/product/27752762" 
  },
  { 
    id: 3, 
    name: "Catch Phrase Ceramic Mug", 
    price: "$9.44", 
    image: "https://images-api.printify.com/mockup/69c3476bd00b55550d018ea4/104692/101750/the-core-catch-phrase-ceramic-mug-11oz-15oz.jpg?camera_label=front&revision=1775077356126&s=2048", 
    link: "https://embers-of-light.printify.me/product/27552207" 
  },
  { 
    id: 4, 
    name: "Logo Ceramic Mug", 
    price: "$9.44", 
    image: "https://images-api.printify.com/mockup/69c341c1cf96d3bc180d5950/104692/101750/the-core-logo-ceramic-mug-11oz-15oz.jpg?camera_label=front&revision=1775077356981&s=2048", 
    link: "https://embers-of-light.printify.me/product/27551712" 
  },
  { 
    id: 5, 
    name: "Slogan Poker Deck", 
    price: "$16.69", 
    image: "https://images-api.printify.com/mockup/69c7001e5a39cdc26c069608/72763/16651/the-core-poker-deck-with-slogan-we-cant-make-this-sht-up.jpg?camera_label=front-2&revision=1776211566000&s=2048", 
    link: "https://embers-of-light.printify.me/product/27609966" 
  },
  { 
    id: 6, 
    name: "Unisex Heavy Cotton Tee", 
    price: "$31.35", 
    image: "https://images-api.printify.com/mockup/69c3ea035158daff1c100980/12100/92570/the-core-unisex-heavy-cotton-tee.jpg?camera_label=front&revision=1775077509372&s=2048", 
    link: "https://embers-of-light.printify.me/product/27560081" 
  },
  { 
    id: 7, 
    name: "Insulated Travel Mug (40oz)", 
    price: "$50.34", 
    image: "https://images-api.printify.com/mockup/69d99490f24d9272f2079a70/107788/104042/the-core-insulated-travel-mug-40oz.jpg?camera_label=front&revision=1775867066597&s=2048", 
    link: "https://embers-of-light.printify.me/product/27905263" 
  }
];

export default function TheCorePage() {
  const [activeView, setActiveView] = useState<'archive' | 'live'>('archive');
  const [parentDomain, setParentDomain] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setParentDomain(window.location.hostname);
    }
  }, []);

  const SectionDivider = () => (
    <div className="w-full h-px bg-gradient-to-r from-transparent via-orange-900/40 to-transparent my-16"></div>
  );

  return (
       // 1. THIS DIV IS THE PAGE WRAPPER (Keep it!)
       <div className="relative min-h-screen w-full flex flex-col bg-black font-cormorant text-gray-200 overflow-x-hidden">
         
         {/* VIDEO BACKGROUND - 20% Opacity */}
         <video 
           autoPlay 
           loop 
           muted 
           playsInline 
           className="absolute inset-0 w-full h-full object-cover z-0 fixed opacity-20"
         >
           {/* Placeholder video until the user drops in the new MP4 */}
           <source src="/images/jmc-edits-palettes/phoenix-arriving.mp4" type="video/mp4" />
         </video>
         <div className="absolute inset-0 z-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none fixed" /> 
      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Header />

        <main className="flex-grow flex flex-col items-center pt-24 pb-12 px-4 w-full">
          <div className="w-full max-w-7xl mx-auto">
            
            <div className="mb-12">
              <Link href="/dashboard" className="text-orange-500 hover:text-orange-400 font-cinzel tracking-widest transition-colors flex items-center gap-2 w-fit uppercase text-sm font-bold">
                <span>←</span> BACK TO DASHBOARD
              </Link>
            </div>

            <div className="text-center mb-12">
              <h1 className="font-cinzel-decorative font-bold text-center text-5xl md:text-7xl mb-4 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-200">
                The CORE
              </h1>
              <p className="font-cinzel text-xl text-orange-200/80 italic tracking-widest uppercase">
                Stripping away the layers.
              </p>
            </div>

            <SectionDivider />

            {/* --- SMART PLAYER & CHAT SECTION --- */}
            <div className="mb-12 relative">
              <div className="flex justify-center gap-4 mb-8">
                <button 
                  onClick={() => setActiveView('live')}
                  className={`px-6 py-2 font-cinzel text-sm border transition-all rounded-full uppercase tracking-widest active:scale-95 ${activeView === 'live' ? 'border-orange-500 text-orange-500 bg-orange-500/10 shadow-[0_0_15px_rgba(234,88,12,0.3)]' : 'border-gray-600 text-gray-500'}`}
                >
                  🔴 Live Stream & Chat
                </button>
                <button 
                  onClick={() => setActiveView('archive')}
                  className={`px-6 py-2 font-cinzel text-sm border transition-all rounded-full uppercase tracking-widest active:scale-95 ${activeView === 'archive' ? 'border-orange-500 text-orange-500 bg-orange-500/10 shadow-[0_0_15px_rgba(234,88,12,0.3)]' : 'border-gray-600 text-gray-500'}`}
                >
                  🎬 The Archives
                </button>
              </div>

              <div className="w-full border border-orange-900/50 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(234,88,12,0.15)] bg-black relative">
                {activeView === 'live' ? (
                  <div className="flex flex-col md:flex-row w-full md:h-[600px]">
                    {/* VIDEO: Aspect-video on mobile, fills height on desktop */}
                    <div className="w-full aspect-video md:aspect-auto md:flex-grow md:h-full bg-black">
                      {parentDomain && (
                        <iframe
                          src={`https://player.twitch.tv/?channel=riseradionetworks&parent=${parentDomain}&muted=false&autoplay=true`}
                          className="w-full h-full" 
                          frameBorder="0" 
                          allowFullScreen={true}
                        />
                      )}
                    </div>
                    {/* CHAT: Capped height on mobile, full height/width on desktop */}
                    <div className="w-full h-[350px] md:w-[350px] md:h-full border-t md:border-t-0 md:border-l border-orange-900/30">
                      {parentDomain && (
                        <iframe
                          src={`https://www.twitch.tv/embed/riseradionetworks/chat?parent=${parentDomain}&darkpopout`}
                          className="w-full h-full"
                          frameBorder="0"
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-video">
                    <iframe
                      src="https://www.youtube.com/embed/videoseries?list=PL5HonD7o0fApxMMgPdDGINANFeG8KBL6V"
                      className="w-full h-full"
                      frameBorder="0"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
              </div>
              <p className="text-center font-cormorant italic text-gray-500 mt-4">
                {activeView === 'live' ? 'You are watching The CORE Live!' : 'Viewing The CORE Archives. Join us live Thursdays at 11 AM EST.'}
              </p>
            </div>

            <SectionDivider />

            <MerchGallery showName="The CORE" products={coreProducts} />

            <SectionDivider />

            <section className="w-full mb-24">
              <h2 className="font-cinzel-decorative text-center text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-200 uppercase tracking-widest mb-12">
                Welcome to The CORE!
              </h2>

              <div className="flex flex-col md:flex-row items-center gap-12 mb-12">
                <div className="w-full md:w-1/2 relative aspect-video md:aspect-[4/3] rounded-2xl border border-orange-900/30 overflow-hidden shadow-[0_0_30px_rgba(234,88,12,0.15)]">
                  <img 
                    src="/images/jmc-edits-palettes/the-core-new-trio.png" 
                    alt="Welcome to The CORE" 
                    className="w-full h-full object-contain" 
                  />
                </div>
                <div className="w-full md:w-1/2 flex flex-col justify-center">
                  <div className="font-cormorant text-xl text-gray-300 space-y-5 leading-relaxed">
                    <p>
                      Step into a one-of-a-kind guidance experience you simply won't find anywhere else. <em className="text-orange-400 font-semibold">The CORE</em> is where Michka "BrindleWolf" Grant, Rev. Diane R. DeBiasi, and Michael J. Cox come together to illuminate your path.
                    </p>
                    <p>
                      Each week, to kick off the show, this dynamic trio performs a vital ritual: sitting in entirely different states, within the sanctity of their own spaces, they each pull a single card from their individual tarot decks. The crucial factor that makes this guidance unique is that none of them have any clue what the others have pulled until the show actually starts.
                    </p>
                    <p>
                      As they reveal their cards live on air, something truly magical often happens—the cards align so perfectly that they seem planned, effortlessly coming together into one cohesive message. That undeniable synchronicity is where their iconic catchphrase was born: <strong className="text-orange-500 font-bold">"We can't make this sh*t up!"</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                <div className="w-full md:w-1/2 relative aspect-video md:aspect-[4/3] rounded-2xl border border-orange-900/30 overflow-hidden shadow-[0_0_30px_rgba(234,88,12,0.15)]">
                  <img 
                    src="/images/jmc-edits-palettes/the-core-new-trio.png" 
                    alt="The CORE Origin" 
                    className="w-full h-full object-contain" 
                  />
                </div>
                <div className="w-full md:w-1/2 flex flex-col justify-center">
                  <h2 className="font-cinzel-decorative text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-200 uppercase tracking-widest mb-6">
                    How We Began
                  </h2>
                  <div className="font-cormorant text-xl text-gray-300 space-y-5 leading-relaxed">
                    <p>
                      The spark for this unique collaboration ignited entirely organically. It all started when Karrie guest-hosted an episode of <em className="text-orange-400 font-semibold">Phoenix Talks</em> with Michka and Diane. Michka's mother immediately saw the palpable magic between them and suggested they start a show as a trio.
                    </p>
                    <blockquote className="border-l-4 border-orange-500/50 pl-5 py-3 my-4 italic text-orange-200/90 bg-orange-950/20 rounded-r-lg">
                      "You know, the three of you would do really well together... Why don't you guys think about starting a podcast where it's all three of you?"
                    </blockquote>
                    <p>
                      By combining their individual spiritual gifts and coaching styles into one unified voice, they brought that vision to life—and <em className="text-orange-400 font-semibold">The CORE</em> was born.
                    </p>
                    <p>
                      Recently, Karrie decided to step back from her role, leaving a profound legacy behind. To ensure the show's powerful guidance continues, Michael J. Cox has picked up the slack and stepped in, bringing his own unique energy to honor the show's original vision and guide it into its next chapter.
                    </p>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}