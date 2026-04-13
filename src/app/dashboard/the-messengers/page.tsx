'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MerchGallery from '@/components/MerchGallery';

const messengerProducts = [
  { id: 1, name: "All Over Print T-Shirt", price: "$28.00", image: "https://images-api.printify.com/mockup/69c72a018b1ab6926a04e5e2/83516/53246/the-messengers-all-over-print-t-shirt.jpg?camera_label=back-on-person&revision=1775077516292&s=2048", link: "https://embers-of-light.printify.me/product/27613875/the-messengers-all-over-print-t-shirt" },
  { id: 2, name: "The Dreamkeepers Cap", price: "$24.00", image: "https://images.printify.com/mockup/69cec44f338dbae7f501adc0/104281/53890/the-messengers-cap-the-dreamkeepers-fantasy-baseball-hat.jpg?camera_label=front", link: "https://embers-of-light.printify.me/product/27752339/the-messengers-cap-the-dreamkeepers-fantasy-baseball-hat" },
  { id: 3, name: "Cotton Canvas Tote Bag", price: "$18.00", image: "https://images-api.printify.com/mockup/69c3f80803e9be5c6d0cf798/101409/93895/the-messengers-cotton-canvas-tote-bag.jpg?camera_label=front&revision=1775077355987&s=400", link: "https://embers-of-light.printify.me/product/27561004/the-messengers-cotton-canvas-tote-bag" },
  { id: 4, name: "Unisex Heavy Cotton Tee", price: "$22.00", image: "https://images-api.printify.com/mockup/69c3efb260984dddf1091ba7/12100/92570/the-messengers-unisex-heavy-cotton-tee.jpg?camera_label=front&revision=1775077356747&s=2048", link: "https://embers-of-light.printify.me/product/27560433/the-messengers-unisex-heavy-cotton-tee" },
  { id: 5, name: "Ceramic Mug", price: "$15.00", image: "https://images.printify.com/mockup/69c33ee920953e335a0838f6/65216/6312/the-messengers-ceramic-mug-11oz-15oz.jpg?camera_label=left", link: "https://embers-of-light.printify.me/product/27551482/the-messengers-ceramic-mug-11oz-15oz" },
  { id: 6, name: "Hardcover Matte Journal", price: "$20.00", image: "https://images-api.printify.com/mockup/69d991397404a2552503e760/65223/7338/the-messengers-hardcover-journal-matte.jpg?camera_label=front&revision=1775866250857&s=2048", link: "https://embers-of-light.printify.me/product/27905110/the-messengers-hardcover-journal-matte" }
];

export default function TheMessengersPage() {
  const [activeView, setActiveView] = useState<'archive' | 'live'>('archive');
  const [parentDomain, setParentDomain] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') { setParentDomain(window.location.hostname); }
  }, []);

  return (
    <div className="min-h-screen text-gray-200 flex flex-col relative bg-cover bg-center bg-fixed font-cormorant" style={{ backgroundImage: "url('/images/main-images/Cover Art/messengers-new.jpg')" }}>
      <div className="absolute inset-0 bg-black/95 z-0 pointer-events-none"></div>
      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12 text-center">
          <h1 className="text-6xl font-cinzel text-white mb-4 tracking-[0.2em]">THE MESSENGERS</h1>
          <p className="text-orange-500 tracking-widest uppercase text-sm font-bold mb-12">Official Show Page</p>
          
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
                <h3 className="text-2xl font-cinzel text-white mb-6">The Messengers Archive</h3>
                <a href="https://youtube.com/playlist?list=PLKmO6Km32njQ46KfUQgXQ0wnE3_PEtZwK" target="_blank" rel="noopener noreferrer" className="inline-block px-10 py-3 bg-red-700 hover:bg-red-600 text-white rounded-full font-cinzel tracking-widest transition-all">VIEW ON YOUTUBE</a>
              </div>
            )}
          </div>

          <section className="max-w-5xl mx-auto mb-20">
            <h2 className="text-3xl font-cinzel text-white mb-12 tracking-widest">MEET YOUR HOSTS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mb-10">
              <div className="relative group overflow-hidden rounded-xl border border-white/10 aspect-[4/5]">
                 <img src="/images/brindle-bio.JPG" alt="Michka Grant" className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700" />
                 <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/60 backdrop-blur-md">
                    <p className="font-cinzel text-orange-500 text-lg">Michka Grant</p>
                 </div>
              </div>
              <div className="relative group overflow-hidden rounded-xl border border-white/10 aspect-[4/5]">
                 <img src="/images/misc/lunaria.jpg" alt="Karrie Lynne" className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700" />
                 <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/60 backdrop-blur-md">
                    <p className="font-cinzel text-orange-500 text-lg">Karrie Lynne</p>
                 </div>
              </div>
            </div>
            <div className="bg-black/40 p-8 rounded-2xl border border-white/5 backdrop-blur-sm text-center">
              <p className="text-gray-300 leading-relaxed font-cormorant text-2xl italic">
                "As the driving forces behind Rise Radio, they share a unified dream: to help bring people together and find inner peace through music, tarot, and other creative means. The Messengers is the space where their shared vision comes to life."
              </p>
            </div>
          </section>

          <MerchGallery showName="The Messengers" products={messengerProducts} />
        </main>
        <Footer />
      </div>
    </div>
  );
}