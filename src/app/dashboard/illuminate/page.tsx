'use client'; 

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import MerchGallery from '@/components/MerchGallery';

const illuminateProducts = [
  { id: 1, name: "Insulated Travel Mug (40oz)", price: "$50.34", image: "https://images-api.printify.com/mockup/69d992cdcca0c3b3780b6090/107788/104042/illuminate-with-lunaria-insulated-travel-mug-40oz.jpg?camera_label=front&revision=1775866643638&s=2048", link: "https://embers-of-light.printify.me/product/27905175" },
  { id: 2, name: "Hardcover Matte Journal", price: "$12.63", image: "https://images-api.printify.com/mockup/69d98aed7404a2552503e640/65223/7338/illuminate-with-lunaria-hardcover-journal-matte.jpg?camera_label=front&revision=1775864673803&s=2048", link: "https://embers-of-light.printify.me/product/27904693" },
  { id: 3, name: "Low Profile Baseball Cap", price: "$17.36", image: "https://images-api.printify.com/mockup/69cec3ba4b32c89c4a0ef1d9/104281/53890/illuminate-with-lunaria-low-profile-baseball-cap.jpg?camera_label=front&revision=1775158288912&s=2048", link: "https://embers-of-light.printify.me/product/27752296" },
  { id: 4, name: "\"No Bullshit\" T-Shirt", price: "$14.27", image: "https://images-api.printify.com/mockup/69c721962d9a5fba5b0a853a/83516/51812/illuminate-with-lunaria-no-bullshit-t-shirt.jpg?camera_label=front&revision=1775077517095&s=2048", link: "https://embers-of-light.printify.me/product/27614620" },
  { id: 5, name: "Unisex Heavy Cotton Tee", price: "$31.35", image: "https://images-api.printify.com/mockup/69c34ee0ba056790a10afdee/12004/92570/illuminate-with-lunaria-unisex-heavy-cotton-tee.jpg?camera_label=front&revision=1775145953666&s=2048", link: "https://embers-of-light.printify.me/product/27552948" },
  { id: 6, name: "Ceramic Mug (11oz, 15oz)", price: "$9.44", image: "https://images-api.printify.com/mockup/69c343ba2495e7aee406955c/104692/101750/illuminate-with-lunaria-ceramic-mug-11oz-15oz.jpg?camera_label=front&revision=1775077362602&s=2048", link: "https://embers-of-light.printify.me/product/27551886" },
  { id: 7, name: "Cotton Canvas Tote Bag", price: "$18.68", image: "https://images-api.printify.com/mockup/69c3faca03e9be5c6d0cf802/101409/93895/illuminate-with-lunaria-cotton-canvas-tote-bag.jpg?camera_label=front&revision=1775077349636&s=2048", link: "https://embers-of-light.printify.me/product/27561230" },
  { id: 8, name: "Poker Playing Cards", price: "$16.69", image: "https://images-api.printify.com/mockup/69c6fd9e8ac9a0544a0eae29/72763/16404/illuminate-with-lunaria-poker-playing-cards.jpg?camera_label=front&revision=1775077516671&s=2048", link: "https://embers-of-light.printify.me/product/27609831" },
  { id: 9, name: "Heavy Blend™ Hooded Sweatshirt", price: "$30.92", image: "https://images-api.printify.com/mockup/69c42944e473cf815004557d/32912/98424/illuminate-with-lunaria-unisex-heavy-blend-hooded-sweatshirt.jpg?camera_label=front&revision=1775077270735&s=2048", link: "https://embers-of-light.printify.me/product/27565095" }
];

export default function IlluminatePage() {
  const [activeView, setActiveView] = useState<'archive' | 'live'>('archive');
  const [parentDomain, setParentDomain] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') { setParentDomain(window.location.hostname); }
  }, []);

  return (
    <div className="min-h-screen text-gray-200 flex flex-col relative bg-cover bg-center bg-fixed font-cormorant"
         style={{ backgroundImage: "url('/images/main-images/Cover Art/illuminate-bg.jpg')" }}>
      <div className="absolute inset-0 bg-black/90 z-0 pointer-events-none fixed"></div>
      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Header />
        <main className="flex-grow flex flex-col items-center pt-24 pb-12 px-4 w-full">
          <div className="w-full max-w-7xl mx-auto">
            <div className="mb-12">
              <Link href="/dashboard" className="text-orange-500 hover:text-orange-400 font-cinzel tracking-widest transition-colors flex items-center gap-2 w-fit uppercase text-sm font-bold">
                <span>←</span> BACK TO DASHBOARD
              </Link>
            </div>
            <div className="text-center mb-16 border-b border-orange-900/30 pb-12">
              <h1 className="font-cinzel-decorative font-bold text-5xl md:text-7xl mb-4 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-200 to-orange-400">Illuminate</h1>
              <p className="font-cinzel text-xl text-orange-200/80 italic">Shedding light on the shadows with Lunaria.</p>
            </div>
            <div className="mb-16 relative">
              <div className="flex justify-center gap-4 mb-8">
                <button onClick={() => setActiveView('live')} className={`px-6 py-2 font-cinzel text-sm border rounded-full uppercase tracking-widest active:scale-95 ${activeView === 'live' ? 'border-orange-500 text-orange-500 bg-orange-500/10' : 'border-gray-600 text-gray-500'}`}>🔴 Live Stream</button>
                <button onClick={() => setActiveView('archive')} className={`px-6 py-2 font-cinzel text-sm border rounded-full uppercase tracking-widest active:scale-95 ${activeView === 'archive' ? 'border-orange-500 text-orange-500 bg-orange-500/10' : 'border-gray-600 text-gray-500'}`}>🎬 The Archives</button>
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
                  <div className="w-full h-full aspect-video"><iframe src="https://www.youtube.com/embed/Aqw4_0Cl2J8" className="w-full h-full" frameBorder="0" allowFullScreen></iframe></div>
                )}
              </div>
            </div>
            <MerchGallery showName="Illuminate" products={illuminateProducts} />
            <section className="w-full mt-24 mb-24 text-center border-t border-orange-900/20 pt-20">
              <h2 className="font-cinzel-decorative text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 uppercase tracking-widest mb-6">Meet Your Guide</h2>
              <div className="max-w-4xl bg-black/60 backdrop-blur-sm p-8 rounded-2xl border border-orange-900/30 shadow-2xl flex flex-col md:flex-row items-center gap-12 text-left mx-auto">
                <img src="/images/jmc-edits-palettes/lunaria-bio-pic.png" alt="Karrie Lynne" className="w-full max-w-[300px] aspect-[4/5] object-contain" />
                <div>
                  <h3 className="font-cinzel text-3xl text-orange-500 tracking-widest uppercase font-bold mb-2">Karrie Lynne (Lunaria)</h3>
                  <p className="font-cormorant text-xl text-orange-200/70 italic mb-6">Co-Founder of Rise Radio & Lead Host</p>
                  <p className="font-cormorant text-gray-300 text-lg leading-relaxed text-justify">Known for her intuitive insight and compassionate nature, Lunaria is a listener, healer, reader, teacher, and guide—a gentle, caring soul who helps others find a little more love and light in their lives.</p>
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