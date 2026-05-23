/* eslint-disable */
'use client'; 

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import MerchGallery from '@/components/MerchGallery';

const brindleProducts = [
  { 
    id: 1, 
    name: "Insulated Travel Mug (40oz)", 
    price: "$50.34", 
    image: "https://images-api.printify.com/mockup/69d9921381e6be64cb06ce81/107788/104042/brindles-vision-insulated-travel-mug-40oz.jpg?camera_label=front&revision=1775866534486&s=2048", 
    link: "https://embers-of-light.printify.me/product/27905156" 
  },
  { 
    id: 2, 
    name: "Hardcover Journal (Matte)", 
    price: "$12.63", 
    image: "https://images-api.printify.com/mockup/69d98fabbc276d78e10be1b6/65223/7338/brindles-vision-hardcover-journal-matte.jpg?camera_label=front&revision=1775865856500&s=2048", 
    link: "https://embers-of-light.printify.me/product/27905024" 
  },
  { 
    id: 3, 
    name: "Boundless Beyond Dad Hat", 
    price: "$17.36", 
    image: "https://images-api.printify.com/mockup/69cec58b4b32c89c4a0ef238/104278/53890/brindles-vision-baseball-cap-boundless-beyond-inspirational-dad-hat.jpg?camera_label=front&revision=1775158740741&s=2048", 
    link: "https://embers-of-light.printify.me/product/27752404" 
  },
  { 
    id: 4, 
    name: "Brindle's Vision Custom Deck", 
    price: "$16.69", 
    image: "https://images-api.printify.com/mockup/69c7026c0b1e5178180405fc/72763/16404/brindles-vision-custom-deck.jpg?camera_label=front&revision=1775077508985&s=2048", 
    link: "https://embers-of-light.printify.me/product/27610146" 
  },
  { 
    id: 5, 
    name: "Men's Loose T-shirt (AOP)", 
    price: "$14.27", 
    image: "https://images-api.printify.com/mockup/69c7095bdfda05aa090e56d9/83519/51812/brindles-vision-mens-loose-t-shirt-aop.jpg?camera_label=front&revision=1775077515971&s=2048", 
    link: "https://embers-of-light.printify.me/product/27612791" 
  },
  { 
    id: 6, 
    name: "Unisex Heavy Cotton Tee", 
    price: "$31.35", 
    image: "https://images-api.printify.com/mockup/69c3e6df727c05a77b09e713/12100/92570/brindles-vision-unisex-heavy-cotton-tee.jpg?camera_label=front&revision=1775077503107&s=2048", 
    link: "https://embers-of-light.printify.me/product/27559772" 
  },
  { 
    id: 7, 
    name: "Ceramic Mug (11oz, 15oz)", 
    price: "$9.44", 
    image: "https://images-api.printify.com/mockup/69c349798d2a35a9db00eb2c/104692/101750/brindles-vision-ceramic-mug-11oz-15oz.jpg?camera_label=front&revision=1775077357141&s=2048", 
    link: "https://embers-of-light.printify.me/product/27552349" 
  },
  { 
    id: 8, 
    name: "Unisex Heavy Blend™ Hooded Sweatshirt", 
    price: "$30.92", 
    image: "https://images-api.printify.com/mockup/69c4265ae470967b040f7302/32912/98424/brindles-vision-unisex-heavy-blend-hooded-sweatshirt.jpg?camera_label=front&revision=1775077270545&s=2048", 
    link: "https://embers-of-light.printify.me/product/27564844" 
  },
  { 
    id: 9, 
    name: "Cotton Canvas Tote Bag", 
    price: "$18.68", 
    image: "https://images-api.printify.com/mockup/69c3f6e05158daff1c100b94/101409/93895/brindles-vision-cotton-canvas-tote-bag.jpg?camera_label=front&revision=1775077362587&s=2048", 
    link: "https://embers-of-light.printify.me/product/27560933" 
  }
];

export default function BrindlesVisionPage() {
  const [activeView, setActiveView] = useState<'archive' | 'live'>('archive');
  const [parentDomain, setParentDomain] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setParentDomain(window.location.hostname);
    }
  }, []);

  return (
    // 1. THIS DIV IS THE PAGE WRAPPER (Keep it!)
    <div className="relative min-h-screen w-full flex flex-col bg-black font-cormorant text-gray-200 overflow-x-hidden">
      
      {/* 2. THE BACKGROUND IMAGE (Placed inside the wrapper, absolute position) */}
      <div className="fixed inset-0 z-0">
        <Image 
          src="/images/main-images/Cover Art/brindles-vision-bg.png"
          alt="Brindle's Vision Background"
          fill
          priority
          className="object-cover opacity-90"
          sizes="100vw"
        />
        {/* The overlay sits on top of the Image */}
        <div className="absolute inset-0 bg-black/90 z-10 pointer-events-none"></div>
      </div>

      {/* 3. YOUR CONTENT (Siblings to the background image, NOT children) */}
      <div className="relative z-20 flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow flex flex-col items-center pt-24 pb-12 px-4 w-full">
          <div className="w-full max-w-7xl mx-auto">
            
            <div className="mb-12">
              <Link href="/dashboard" className="text-orange-500 hover:text-orange-400 font-cinzel tracking-widest transition-colors flex items-center gap-2 w-fit uppercase text-sm font-bold">
                <span>←</span> BACK TO DASHBOARD
              </Link>
            </div>

            <div className="text-center mb-16 border-b border-orange-900/30 pb-12">
              <h1 className="font-cinzel-decorative font-bold text-center text-5xl md:text-7xl mb-4 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-200 to-orange-400">
                Brindle's Vision
              </h1>
              <p className="font-cinzel text-xl text-orange-200/80 italic tracking-[0.3em] uppercase">
                Hosted by Brindle Wolf
              </p>
            </div>

            <div className="mb-16 relative">
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
                    <div className="w-full h-[350px] md:w-[350px] md:h-full border-t md:border-t-0 md:border-l border-orange-900/30">
                      {parentDomain && (
                        <iframe
                          src={`https://www.twitch.tv/embed/riseradionetworks/chat?parent=${parentDomain}&parent=localhost&parent=embersoflight.net&parent=www.embersoflight.net&darkpopout`}
                          className="w-full h-full"
                          frameBorder="0"
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full aspect-video">
                    <iframe 
                      src="https://www.youtube.com/embed/videoseries?si=iGTdtFAfDKXOF02L&list=PLKmO6Km32njSDRIYBDZcUbzqQFYQGmXIr" 
                      title="YouTube video player" 
                      className="w-full h-full"
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                      referrerPolicy="strict-origin-when-cross-origin" 
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
              </div>
              <p className="text-center font-cormorant italic text-gray-500 mt-4">
                {activeView === 'live' ? 'You are watching LIVE. Join the chat!' : 'Viewing Brindle Archives. Join us live Tuesdays at 12 PM EST.'}
              </p>
            </div>

            <MerchGallery showName="Brindle's Vision" products={brindleProducts} />

            <section className="w-full mt-24 mb-24 text-center border-t border-orange-900/20 pt-20">
              <h2 className="font-cinzel-decorative text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 uppercase tracking-widest mb-6">
                Meet The Host
              </h2>
              <div className="w-32 h-px bg-gradient-to-r from-transparent via-orange-900/60 to-transparent mx-auto mb-16"></div>

              <div className="grid grid-cols-1 md:grid-cols-[300px_1px_1fr] items-center gap-10 md:gap-16 bg-black/60 backdrop-blur-sm p-8 md:p-12 rounded-2xl border border-orange-900/30 shadow-2xl text-left max-w-5xl mx-auto">
                <div className="flex flex-col items-center">
                  <div className="relative w-[280px] h-[350px] rounded-lg border border-orange-900/40 overflow-hidden shadow-[0_0_20px_rgba(234,88,12,0.1)]">
                    <Image
                      src="/images/jmc-edits-palettes/brindle-bio-pic.png" 
                      alt="Michka Grant"
                      className="w-full h-full object-contain"

                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent"></div>
                  </div>
                  <div className="mt-6">
                    <h3 className="font-cinzel text-2xl text-orange-500 tracking-widest uppercase font-bold">
                      Michka Grant
                    </h3>
                  </div>
                </div>

                <div className="hidden md:block w-px h-full min-h-[300px] bg-gradient-to-b from-transparent via-orange-900/40 to-transparent"></div>

                <div className="flex flex-col justify-center">
                  <div className="relative">
                    <span className="absolute -top-10 -left-6 text-8xl font-serif text-orange-900/20 pointer-events-none">“</span>
                    <p className="font-cormorant text-xl md:text-2xl text-gray-200 leading-relaxed italic relative z-10">
                      Michka Grant, known on air as Brindlewolf, is a seasoned coach, creator, and co-founder of RISE Radio Networks. With a background in guiding professionals out of burnout, people-pleasing, and disconnection, Michka uses heightened awareness to help others rise—like a Phoenix—from emotional ashes. As a DJ, host, and producer, he co-curates a space for authentic connection, where every show sparks self-recognition and the courage to step fully into your purpose. 
                      <br /><br />
                      His mission is to fuel the connection between singer and listener, building an awareness-driven community one broadcast at a time.
                    </p>
                    <span className="absolute -bottom-16 -right-4 text-8xl font-serif text-orange-900/20 pointer-events-none">”</span>
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