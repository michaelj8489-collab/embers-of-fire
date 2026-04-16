'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import MerchGallery from '@/components/MerchGallery';

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

            {/* Smart Player Section */}
            <div className="w-full max-w-4xl mx-auto bg-black/60 backdrop-blur-md p-8 rounded-2xl border border-orange-500/20 shadow-2xl mb-16">
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

            {/* --- MERCH GALLERY --- */}
            <MerchGallery showName="Honky Tonk Heaven" products={honkyProducts} />

            {/* About Section */}
            <div className="max-w-4xl mx-auto bg-orange-900/10 border-l-4 border-orange-600 p-8 rounded-r-xl mt-16">
               <h4 className="font-cinzel text-orange-500 mb-4 uppercase tracking-widest font-bold">About Honky Tonk Heaven</h4>
               <p className="font-cormorant text-xl text-gray-200 leading-relaxed italic">
                 Welcome to Honky Tonk Heaven. This dedicated space is designed to showcase the unique energy and soulful expression that defines the RISE community. Join us as we tune into the frequencies that inspire connection, creativity, and the power of independent music.
               </p>
            </div>

          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}