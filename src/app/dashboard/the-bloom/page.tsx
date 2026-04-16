'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import MerchGallery from '@/components/MerchGallery';

const bloomProducts = [
  { id: 1, name: "Low Profile Baseball Cap", price: "$17.36", image: "https://images-api.printify.com/mockup/69cec66addebb5f8370786f2/104280/53890/the-bloom-low-profile-baseball-cap.jpg?camera_label=front&revision=1775159095182&s=2048", link: "https://embers-of-light.printify.me/product/27752482" },
  { id: 2, name: "Unisex Heavy Cotton Tee", price: "$31.35", image: "https://images-api.printify.com/mockup/69c3ee43f4a6bbf9820c5812/12100/92570/the-bloom-unisex-heavy-cotton-tee.jpg?camera_label=front&revision=1775077503615&s=2048", link: "https://embers-of-light.printify.me/product/27560397" },
  { id: 3, name: "Ceramic Mug (11oz, 15oz)", price: "$9.44", image: "https://images-api.printify.com/mockup/69c3ed039003cbb4a4052fdc/104692/101750/the-bloom-ceramic-mug-11oz-15oz.jpg?camera_label=front&revision=1775077354876&s=2048", link: "https://embers-of-light.printify.me/product/27560337" },
  { id: 4, name: "Cotton Canvas Tote Bag", price: "$18.68", image: "https://images-api.printify.com/mockup/69c3f631451dae57710f9abb/101409/93895/the-bloom-cotton-canvas-tote-bag.jpg?camera_label=front&revision=1775077686552&s=400", link: "https://embers-of-light.printify.me/product/27560885" },
  { id: 5, name: "Heavy Blend™ Hooded Sweatshirt", price: "$30.92", image: "https://images-api.printify.com/mockup/69c425bf7a696940f8027bf3/32912/98425/the-bloom-unisex-heavy-blend-hooded-sweatshirt.jpg?camera_label=back&revision=1775077355722&s=2048", link: "https://embers-of-light.printify.me/product/27564745" },
  { id: 6, name: "Artistic Rose Playing Cards", price: "$16.69", image: "https://images-api.printify.com/mockup/69c702d28ac9a0544a0eaf42/72763/16404/the-bloom-poker-playing-cards-artistic-rose-design-casino-deck.jpg?camera_label=front&revision=1775077509146&s=2048", link: "https://embers-of-light.printify.me/product/27610177" }
];

export default function TheBloomPage() {
  const [activeView, setActiveView] = useState<'archive' | 'live'>('archive');
  const [parentDomain, setParentDomain] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') { setParentDomain(window.location.hostname); }
  }, []);

  return (
    <div 
      className="min-h-screen text-gray-200 flex flex-col relative bg-cover bg-center bg-fixed font-cormorant"
      style={{ backgroundImage: "url('/images/main-images/Cover Art/bloom-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/90 z-0 pointer-events-none fixed"></div>

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Header />

        <main className="flex-grow flex flex-col items-center pt-24 pb-12 px-4 w-full">
          <div className="w-full max-w-7xl mx-auto">
            
            {/* Standard Nav Fix */}
            <div className="mb-12">
              <Link href="/dashboard" className="text-orange-500 hover:text-orange-400 font-cinzel tracking-widest transition-colors flex items-center gap-2 w-fit uppercase text-sm font-bold">
                <span>←</span> BACK TO DASHBOARD
              </Link>
            </div>

            {/* Show Title */}
            <div className="text-center mb-16 border-b border-orange-900/30 pb-12">
              <h1 className="font-cinzel-decorative font-bold text-center text-5xl md:text-7xl mb-4 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-200 to-orange-400">
                The Bloom
              </h1>
              <p className="font-cinzel text-xl text-orange-200/80 italic uppercase tracking-[0.3em]">
                Hosted by Rev. Diane R. DeBiasi
              </p>
            </div>

            {/* Smart Player Section */}
            <div className="mb-16 relative">
              <div className="flex justify-center gap-4 mb-8">
                <button onClick={() => setActiveView('live')} className={`px-6 py-2 font-cinzel text-sm border transition-all rounded-full uppercase tracking-widest active:scale-95 ${activeView === 'live' ? 'border-orange-500 text-orange-500 bg-orange-500/10 shadow-[0_0_15px_rgba(234,88,12,0.3)]' : 'border-gray-600 text-gray-500'}`}>🔴 Live Stream</button>
                <button onClick={() => setActiveView('archive')} className={`px-6 py-2 font-cinzel text-sm border transition-all rounded-full uppercase tracking-widest active:scale-95 ${activeView === 'archive' ? 'border-orange-500 text-orange-500 bg-orange-500/10 shadow-[0_0_15px_rgba(234,88,12,0.3)]' : 'border-gray-600 text-gray-500'}`}>🎬 The Archives</button>
              </div>

              <div className="w-full border border-orange-900/50 rounded-xl overflow-hidden shadow-2xl bg-black relative md:h-[600px]">
                {activeView === 'live' ? (
                  <div className="flex flex-col md:flex-row w-full h-full">
                    <iframe src={`https://player.twitch.tv/?channel=riseradionetworks&parent=${parentDomain || 'embersoflight.net'}`} className="flex-grow h-full" frameBorder="0" allowFullScreen></iframe>
                    <iframe src={`https://www.twitch.tv/embed/riseradionetworks/chat?parent=${parentDomain || 'embersoflight.net'}&darkpopout`} className="w-full md:w-[350px] h-[400px] md:h-full border-t md:border-l border-orange-900/30" frameBorder="0"></iframe>
                  </div>
                ) : (
                  <div className="w-full h-full aspect-video">
                    <iframe src="https://www.youtube.com/embed/videoseries?list=PLKmO6Km32njT-1QD5R76W1Mv-eD-eijIE" className="w-full h-full" frameBorder="0" allowFullScreen></iframe>
                  </div>
                )}
              </div>
            </div>

            {/* --- MERCH GALLERY --- */}
            <MerchGallery showName="The Bloom" products={bloomProducts} />

            {/* Meet The Host Section */}
            <section className="w-full mt-24 mb-24 text-center border-t border-orange-900/20 pt-20">
              <h2 className="font-cinzel-decorative text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 uppercase tracking-widest mb-6">Meet The Host</h2>
              <div className="w-32 h-px bg-gradient-to-r from-transparent via-orange-400/60 to-transparent mx-auto mb-16"></div>

              <div className="grid grid-cols-1 md:grid-cols-[300px_1px_1fr] items-center gap-10 md:gap-16 bg-black/60 backdrop-blur-sm p-8 md:p-12 rounded-2xl border border-orange-900/30 shadow-2xl text-left">
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-[280px] h-[350px] rounded-lg border border-orange-900/40 overflow-hidden shadow-2xl">
                    <img src="/images/main-images/Cover Art/Diane Solo.png" alt="Rev. Diane R. DeBiasi" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-in-out" />
                  </div>
                  <div className="mt-6">
                    <h3 className="font-cinzel text-2xl text-orange-500 tracking-widest uppercase font-bold">Rev. Diane R. DeBiasi</h3>
                  </div>
                </div>

                <div className="hidden md:block w-px h-full min-h-[300px] bg-gradient-to-b from-transparent via-orange-900/40 to-transparent"></div>

                <div className="flex flex-col justify-center">
                  <div className="relative">
                    <span className="absolute -top-10 -left-6 text-8xl font-serif text-orange-900/20 pointer-events-none">“</span>
                    <p className="font-cormorant text-xl md:text-2xl text-gray-200 leading-relaxed italic relative z-10">
                      "Rev. Diane R. DeBiasi, a co-founder of RISE Radio, hosts The Bloom every Monday morning. Her program serves as a sanctuary dedicated to spiritual growth, creative unfolding, and the sharing of gentle, intuitive wisdom."
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