'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
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
    <div 
      className="min-h-screen text-gray-200 flex flex-col relative bg-cover bg-center bg-fixed font-cormorant"
      style={{ backgroundImage: "url('/images/main-images/Cover Art/messengers-new.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/90 z-0 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Header />

        <main className="flex-grow flex flex-col items-center pt-24 pb-12 px-4 w-full">
          <div className="w-full max-w-7xl">
            
            <div className="mb-8">
              <Link href="/dashboard/sanctuary" className="text-orange-500 hover:text-orange-400 font-cinzel tracking-widest transition-colors flex items-center gap-2 w-fit">
                <span>←</span> BACK TO SANCTUARY
              </Link>
            </div>

            <div className="text-center mb-16 border-b border-orange-900/50 pb-8">
              <h1 className="font-cinzel-decorative font-bold text-center text-5xl md:text-7xl mb-4 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
                The Messengers
              </h1>
              <p className="font-cinzel text-xl text-orange-200/80 italic">Tune into the frequency.</p>
            </div>

            <div className="mb-16 relative">
              <div className="flex justify-center gap-4 mb-8">
                <button onClick={() => setActiveView('live')} className={`px-6 py-2 font-cinzel text-sm border transition-all rounded-full uppercase tracking-widest active:scale-95 ${activeView === 'live' ? 'border-orange-500 text-orange-500 bg-orange-500/10' : 'border-gray-600 text-gray-500'}`}>🔴 Live Stream</button>
                <button onClick={() => setActiveView('archive')} className={`px-6 py-2 font-cinzel text-sm border transition-all rounded-full uppercase tracking-widest active:scale-95 ${activeView === 'archive' ? 'border-orange-500 text-orange-500 bg-orange-500/10' : 'border-gray-600 text-gray-500'}`}>🎬 The Archives</button>
              </div>

              <div className="w-full border border-orange-900/50 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(234,88,12,0.15)] bg-black relative">
                {activeView === 'live' ? (
                  <div className="flex flex-col md:flex-row w-full aspect-video md:aspect-auto md:h-[600px]">
                    <iframe src={`https://player.twitch.tv/?channel=riseradionetworks&parent=${parentDomain || 'embersoflight.net'}`} className="flex-grow h-full" frameBorder="0" allowFullScreen></iframe>
                    <iframe src={`https://www.twitch.tv/embed/riseradionetworks/chat?parent=${parentDomain || 'embersoflight.net'}&darkpopout`} className="w-full md:w-[350px] h-[400px] md:h-full border-t md:border-l border-orange-900/30" frameBorder="0"></iframe>
                  </div>
                ) : (
                  <div className="w-full aspect-video">
                    <iframe src="https://www.youtube.com/embed/videoseries?list=PLKmO6Km32njQ46KfUQgXQ0wnE3_PEtZwK" className="w-full h-full" frameBorder="0" allowFullScreen></iframe>
                  </div>
                )}
              </div>
            </div>

            <section className="w-full mt-20 mb-24 text-center">
              <h2 className="font-cinzel-decorative text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 uppercase tracking-widest mb-6">Meet The Hosts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="relative group overflow-hidden rounded-xl border border-orange-900/40 aspect-[4/5]">
                   <img src="/images/brindle-bio.JPG" alt="Michka Grant" className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-700" />
                   <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/60 backdrop-blur-md">
                      <p className="font-cinzel text-orange-500 text-lg">Michka Grant</p>
                   </div>
                </div>
                <div className="relative group overflow-hidden rounded-xl border border-orange-900/40 aspect-[4/5]">
                   <img src="/images/misc/lunaria.jpg" alt="Karrie Lynne" className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-700" />
                   <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/60 backdrop-blur-md">
                      <p className="font-cinzel text-orange-500 text-lg">Karrie Lynne</p>
                   </div>
                </div>
              </div>
              <div className="bg-black/60 p-8 rounded-2xl border border-orange-900/30 text-center">
                <p className="font-cormorant text-xl md:text-2xl text-gray-200 italic leading-relaxed">
                  "As the driving forces behind Rise Radio, they share a unified dream: to help bring people together and find inner peace through music, tarot, and other creative means. The Messengers is the space where their shared vision comes to life."
                </p>
              </div>
            </section>

            <MerchGallery showName="The Messengers" products={messengerProducts} />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}