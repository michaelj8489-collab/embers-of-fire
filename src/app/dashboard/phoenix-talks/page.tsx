/* eslint-disable */
'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import MerchGallery from '@/components/MerchGallery';

const phoenixProducts = [
  { 
    id: 1, 
    name: "Phoenix Falls Baseball Cap", 
    price: "$17.36", 
    image: "https://images-api.printify.com/mockup/69cec4f7905c4029f50a4bde/104282/53890/phoenix-talks-baseball-cap-inspirational-faith-design-phoenix-falls.jpg?camera_label=front&revision=1775158609409&s=2048", 
    link: "https://embers-of-light.printify.me/product/27752380" 
  },
  { 
    id: 2, 
    name: "Unisex Heavy Cotton Tee", 
    price: "$31.35", 
    image: "https://images-api.printify.com/mockup/69c3ebb1484a05af4d015a2e/12100/92570/phoenix-talks-unisex-heavy-cotton-tee.jpg?camera_label=front&revision=1775077363566&s=2048", 
    link: "https://embers-of-light.printify.me/product/27560198" 
  },
  { 
    id: 3, 
    name: "Ceramic Mug (11oz, 15oz)", 
    price: "$7.93", 
    image: "https://images-api.printify.com/mockup/69c3402b29d2eb7b2906a7b8/65216/6310/phoenix-talks-ceramic-mug-11oz-15oz.jpg?camera_label=front&revision=1775077516149&s=2048", 
    link: "https://embers-of-light.printify.me/product/27551615" 
  },
  { 
    id: 4, 
    name: "Cotton Canvas Tote Bag", 
    price: "$18.68", 
    image: "https://images-api.printify.com/mockup/69c3f77adfc5bce200091b86/101409/93895/phoenix-talks-cotton-canvas-tote-bag.jpg?camera_label=front&revision=1775077355814&s=2048", 
    link: "https://embers-of-light.printify.me/product/27560982" 
  },
  { 
    id: 5, 
    name: "Heavy Blend™ Hooded Sweatshirt", 
    price: "$30.92", 
    image: "https://images-api.printify.com/mockup/69c426e3f4a6bbf9820c5f24/32912/98424/phoenix-talks-unisex-heavy-blend-hooded-sweatshirt.jpg?camera_label=front&revision=1775077264789&s=2048", 
    link: "https://embers-of-light.printify.me/product/27564906" 
  },
  { 
    id: 6, 
    name: "Phoenix Talks Custom Deck", 
    price: "$16.69", 
    image: "https://images-api.printify.com/mockup/69c701ef53e54911530e235f/72763/16651/poker-playing-cards-phoenix-talks-custom-deck-ace-spade-design.jpg?camera_label=front-2&revision=1775077508717&s=2048", 
    link: "https://embers-of-light.printify.me/product/27610080" 
  }
];

export default function PhoenixTalksPage() {
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
       
       {/* 2. THE BACKGROUND IMAGE (Placed inside the wrapper, absolute position) */}
       <div className="fixed inset-0 z-0">
        <Image
          src="/images/main-images/Cover Art/phoenix-talks-bg.jpg"
          alt="Phoenix Talks Background"
          fill
          priority
          className="object-cover opacity-30"
         />
         <div className="absolute inset-0 bg-[#4B0082]/20 z-10 pointer-events-none"></div>
         <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90 z-10 pointer-events-none"></div>
       </div>

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Header />

        <main className="flex-grow flex flex-col items-center pt-24 pb-12 px-4 w-full">
          <div className="w-full max-w-7xl mx-auto">
            
            {/* Standard Nav Link Fix */}
            <div className="mb-12">
              <Link href="/dashboard" className="text-orange-500 hover:text-orange-400 font-cinzel tracking-widest transition-colors flex items-center gap-2 w-fit uppercase text-sm font-bold">
                <span>←</span> BACK TO DASHBOARD
              </Link>
            </div>

            {/* Show Title */}
            <div className="text-center mb-12">
              <h1 className="font-cinzel-decorative font-bold text-center text-5xl md:text-7xl mb-4 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-200 to-orange-400">
                Phoenix Talks
              </h1>
              <p className="font-cinzel text-xl text-orange-200/80 italic tracking-widest uppercase">
                Rise through the conversation.
              </p>
            </div>

            <SectionDivider />

            {/* Player Section */}
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

              <div className="w-full border border-orange-900/50 rounded-xl overflow-hidden shadow-2xl bg-black relative md:h-[600px]">
                {activeView === 'live' ? (
                  <div className="flex flex-col md:flex-row w-full h-full">
                    {/* VIDEO: Aspect-video on mobile, fills height on desktop */}
                    <iframe 
                      src={`https://player.twitch.tv/?channel=riseradionetworks&parent=${parentDomain || 'embersoflight.net'}`} 
                      className="w-full aspect-video md:aspect-auto md:flex-grow md:h-full" 
                      frameBorder="0" 
                      allowFullScreen
                    ></iframe>
                    {/* CHAT: Capped height on mobile, full height/width on desktop */}
                    <iframe 
                      src={`https://www.twitch.tv/embed/riseradionetworks/chat?parent=${parentDomain || 'embersoflight.net'}&darkpopout`} 
                      className="w-full h-[350px] md:w-[350px] md:h-full border-t md:border-l border-orange-900/30" 
                      frameBorder="0"
                    ></iframe>
                  </div>
                ) : (
                  <div className="w-full h-full aspect-video">
                    <iframe
                      src="https://www.youtube.com/embed/videoseries?list=PL5HonD7o0fAp_Pws2VBvgcn8q-nd4anjF"
                      className="w-full h-full"
                      frameBorder="0"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
              </div>
            </div>

            <SectionDivider />

            <MerchGallery showName="Phoenix Talks" products={phoenixProducts} />

            <SectionDivider />

            <section className="w-full mb-24">
              <h2 className="font-cinzel-decorative text-center text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-200 uppercase tracking-widest mb-12">
                The Story of Phoenix Talks
              </h2>

              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="w-full md:w-1/2 relative aspect-video md:aspect-[4/3] rounded-2xl border border-orange-900/30 overflow-hidden shadow-[0_0_30px_rgba(234,88,12,0.15)]">
                  <Image
                  src="/images/jmc-edits-palettes/phoenix-talks-bio.png"
                  alt="The History of Phoenix Talks"
                   className="w-full h-full object-contain" 
                  />
                </div>

                <div className="w-full md:w-1/2 flex flex-col justify-center">
                  <div className="font-cormorant text-xl text-gray-300 space-y-6 leading-relaxed">
                    <p>
                      <em className="text-orange-400 font-semibold italic">Phoenix Talks</em> was born in February 2024 from a chance meeting at a gathering. Brindlewolf and Diane had never met before and yet both attended the same event. A small spark of friendship had already been ignited.
                    </p>
                    <p>
                      After the event, he reached out on Facebook to connect. Reading one of her posts, he had something to add in the comments that sparked an idea within Diane to create a podcast. Of course, he jumped at the chance. They got on the phone and talked for hours. The idea for Phoenix Talks was born in that conversation.
                    </p>
                    <p>
                      <em className="text-orange-400 font-semibold italic">Phoenix Talks</em> is a unique show where each week they dive into a topic surrounding a singular element of mental health and well-being to give their insights based on experience and knowledge. What makes it unique is that it's not prepared. 
                    </p>
                    <p>
                      They have a rule that they don't discuss the show and its topic until they go live on air. The conversation is completely organic with each show turning into a mini-master class on the branches of the topic.
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