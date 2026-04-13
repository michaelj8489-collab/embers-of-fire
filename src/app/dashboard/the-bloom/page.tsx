'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MerchGallery from '@/components/MerchGallery';

const bloomProducts = [
  { id: 1, name: "Low Profile Baseball Cap", price: "$17.36", image: "https://images-api.printify.com/mockup/69cec66addebb5f8370786f2/104280/53890/the-bloom-low-profile-baseball-cap.jpg?camera_label=front&revision=1775159095182&s=2048", link: "https://embers-of-light.printify.me/product/27752482" },
  { id: 2, name: "Unisex Heavy Cotton Tee", price: "$31.35", image: "https://images-api.printify.com/mockup/69c3ee43f4a6bbf9820c5657/12100/92570/the-bloom-unisex-heavy-cotton-tee.jpg?camera_label=front&revision=1775077503615&s=2048", link: "https://embers-of-light.printify.me/product/27560397" },
  { id: 3, name: "Ceramic Mug (11oz, 15oz)", price: "$9.44", image: "https://images-api.printify.com/mockup/69c3ed039003cbb4a4052fdc/104692/101750/the-bloom-ceramic-mug-11oz-15oz.jpg?camera_label=front&revision=1775077354876&s=2048", link: "https://embers-of-light.printify.me/product/27560337" },
  { id: 4, name: "Cotton Canvas Tote Bag", price: "$18.68", image: "https://images-api.printify.com/mockup/69c3f631451dae57710f9abb/101409/93895/the-bloom-cotton-canvas-tote-bag.jpg?camera_label=front&revision=1775077686552&s=400", link: "https://embers-of-light.printify.me/product/27560885" },
  { id: 5, name: "Heavy Blend™ Hooded Sweatshirt", price: "$30.92", image: "https://images-api.printify.com/mockup/69c425bf7a696940f8027bf3/32912/98425/the-bloom-unisex-heavy-blend-hooded-sweatshirt.jpg?camera_label=back&revision=1775077355722&s=2048", link: "https://embers-of-light.printify.me/product/27564745" }
];

export default function TheBloomPage() {
  const [activeView, setActiveView] = useState<'archive' | 'live'>('archive');
  const [parentDomain, setParentDomain] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') { setParentDomain(window.location.hostname); }
  }, []);

  return (
    <div className="min-h-screen text-gray-200 flex flex-col relative bg-cover bg-center bg-fixed font-cormorant" style={{ backgroundImage: "url('/images/main-images/Cover Art/bloom-new.jpg')" }}>
      <div className="absolute inset-0 bg-black/95 z-0 pointer-events-none"></div>
      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12 text-center">
          <h1 className="text-6xl font-cinzel text-white mb-4 tracking-[0.2em]">THE BLOOM</h1>
          <p className="text-orange-500 tracking-widest uppercase text-sm font-bold mb-12">Hosted by Rev. Diane R. DeBiasi</p>
          
          <div className="flex gap-4 justify-center mb-12">
            <button onClick={() => setActiveView('live')} className={`px-8 py-2 rounded-full font-cinzel tracking-widest transition-all ${activeView === 'live' ? 'bg-orange-600 shadow-[0_0_20px_rgba(234,88,12,0.5)]' : 'bg-white/5 text-gray-400'}`}>LIVE STREAM</button>
            <button onClick={() => setActiveView('archive')} className={`px-8 py-2 rounded-full font-cinzel tracking-widest transition-all ${activeView === 'archive' ? 'bg-orange-600 shadow-[0_0_20px_rgba(234,88,12,0.5)]' : 'bg-white/5 text-gray-400'}`}>ARCHIVES</button>
          </div>

          <div className="max-w-6xl mx-auto mb-20 bg-black/60 rounded-2xl overflow-hidden border border-orange-500/20 shadow-2xl backdrop-blur-md">
            {activeView === 'live' ? (
              <div className="flex flex-col lg:flex-row h-[600px]">
                <iframe src={`https://player.twitch.tv/?channel=riseradionetworks&parent=${parentDomain || 'embersoflight.net'}`} height="100%" width="100%" className="lg:w-3/4" allowFullScreen></iframe>
                <iframe src={`https://www.twitch.tv/embed/riseradionetworks/chat?parent=${parentDomain || 'embersoflight.net'}`} height="100%" width="100%" className="lg:w-1/4"></iframe>
              </div>
            ) : (
              <div className="p-12 py-32">
                <h3 className="text-2xl font-cinzel text-white mb-6">The Bloom Archive</h3>
                <a href="https://youtube.com/playlist?list=PLKmO6Km32njT-1QD5R76W1Mv-eD-eijIE" target="_blank" rel="noopener noreferrer" className="inline-block px-10 py-3 bg-red-700 hover:bg-red-600 text-white rounded-full font-cinzel tracking-widest transition-all">VIEW ON YOUTUBE</a>
              </div>
            )}
          </div>

          <section className="max-w-5xl mx-auto mb-20 text-left grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="w-full aspect-square border border-orange-500/20 rounded-2xl overflow-hidden bg-zinc-900 shadow-lg">
              <img src="/images/main-images/Cover Art/Diane Solo.png" alt="Rev. Diane R. DeBiasi" className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-700" />
            </div>
            <div>
              <h2 className="text-3xl font-cinzel text-orange-500 mb-6">Rev. Diane R. DeBiasi</h2>
              <p className="text-gray-300 leading-relaxed font-cormorant text-2xl italic">
                "Rev. Diane R. DeBiasi, a co-founder of RISE Radio, hosts The Bloom every Monday morning. Her program serves as a sanctuary dedicated to spiritual growth, creative unfolding, and the sharing of gentle, intuitive wisdom."
              </p>
            </div>
          </section>

          <MerchGallery showName="The Bloom" products={bloomProducts} />
        </main>
        <Footer />
      </div>
    </div>
  );
}