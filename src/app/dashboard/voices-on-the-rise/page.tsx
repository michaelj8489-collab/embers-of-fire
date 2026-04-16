'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import MerchGallery from '@/components/MerchGallery';

const voicesProducts = [
  { 
    id: 1, 
    name: "Voices On The Rise Ceramic Mug", 
    price: "$9.44", 
    image: "https://images-api.printify.com/mockup/69c419d18fd62e0f9a084372/104692/101750/voices-on-the-rise-ceramic-mug-11oz-15oz.jpg?camera_label=front&revision=1775077269886&s=2048", 
    link: "https://embers-of-light.printify.me/product/27563800" 
  },
  { 
    id: 2, 
    name: "Vintage Microphone Baseball Cap", 
    price: "$17.36", 
    image: "https://images-api.printify.com/mockup/69cec98a338dbae7f501ae99/104281/55688/voices-on-the-rise-vintage-microphone-baseball-cap.jpg?camera_label=back&revision=1775159836483&s=2048", 
    link: "https://embers-of-light.printify.me/product/27752705" 
  },
  { 
    id: 3, 
    name: "Unisex Heavy Cotton Tee", 
    price: "$25.36", 
    image: "https://images-api.printify.com/mockup/69c418b0451dae57710f9fd2/12100/92570/voices-on-the-rise-unisex-heavy-cotton-tee.jpg?camera_label=front&revision=1775077357386&s=2048", 
    link: "https://embers-of-light.printify.me/product/27563715" 
  },
  { 
    id: 4, 
    name: "Cotton Canvas Tote Bag", 
    price: "$18.68", 
    image: "https://images-api.printify.com/mockup/69c41ae26b91ef31d80ce1fd/101409/93895/voices-on-the-rise-cotton-canvas-tote-bag.jpg?camera_label=front&revision=1775077263962&s=2048", 
    link: "https://embers-of-light.printify.me/product/27563857" 
  },
  { 
    id: 5, 
    name: "Podcast-Themed Card Deck", 
    price: "$16.69", 
    image: "https://images-api.printify.com/mockup/69c704326b7f4230560caeab/72763/16651/voices-on-the-rise-poker-playing-cards-podcast-themed-custom-card-deck.jpg?camera_label=front-2&revision=1775077514424&s=2048", 
    link: "https://embers-of-light.printify.me/product/27610315" 
  },
  { 
    id: 6, 
    name: "Heavy Blend™ Hooded Sweatshirt", 
    price: "$30.92", 
    image: "https://images-api.printify.com/mockup/69c42388be418911b702816b/32912/98424/voices-on-the-rise-unisex-heavy-blend-hooded-sweatshirt.jpg?camera_label=front&revision=1775077349262&s=2048", 
    link: "https://embers-of-light.printify.me/product/27564536" 
  }
];

export default function VoicesOnRisePage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-hidden font-cormorant text-gray-200">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/media-4/voices-on-the-rise.jpg" 
          alt="Voices Background" 
          className="w-full h-full object-cover fixed opacity-40" 
        />
        <div className="absolute inset-0 bg-black/80 z-10 pointer-events-none fixed"></div>
      </div>

      <div className="relative z-20 flex flex-col min-h-screen w-full">
        <Header />
        
        <main className="flex-grow flex flex-col items-center pt-24 pb-12 px-4 w-full">
          <div className="w-full max-w-7xl">
            
            {/* Standard Nav Link Fix */}
            <div className="mb-12">
              <Link href="/dashboard" className="text-orange-500 hover:text-orange-400 font-cinzel tracking-widest transition-colors flex items-center gap-2 w-fit uppercase text-sm font-bold">
                <span>←</span> BACK TO DASHBOARD
              </Link>
            </div>

            {/* Hero Section */}
            <div className="text-center mb-16 border-b border-orange-900/30 pb-12">
              <h1 className="font-cinzel-decorative font-bold text-5xl md:text-7xl mb-6 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-200 to-orange-400">
                Voices On The Rise
              </h1>
              <p className="font-cinzel text-2xl text-orange-100 italic tracking-wide">
                "Celebrating the emerging voices of our community."
              </p>
            </div>

            {/* Live Player Box */}
            <div className="w-full max-w-4xl mx-auto bg-black/60 backdrop-blur-md p-8 rounded-2xl border border-orange-500/20 shadow-2xl mb-16">
               <h3 className="font-cinzel text-orange-400 text-center mb-8 tracking-[0.2em] uppercase font-bold">Voices On The Rise: Live Broadcast</h3>
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
            <MerchGallery showName="Voices On The Rise" products={voicesProducts} />

            {/* --- MEET THE HOST SECTION --- */}
            <section className="w-full mt-24 mb-24 text-center border-t border-orange-900/20 pt-20">
              <h2 className="font-cinzel-decorative text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 uppercase tracking-widest mb-6">
                Meet The Host
              </h2>
              <div className="w-32 h-px bg-gradient-to-r from-transparent via-orange-400/60 to-transparent mx-auto mb-16"></div>

              <div className="grid grid-cols-1 md:grid-cols-[300px_1px_1fr] items-center gap-10 md:gap-16 bg-black/60 backdrop-blur-sm p-8 md:p-12 rounded-2xl border border-orange-900/30 shadow-2xl text-left">
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-[280px] h-[350px] rounded-lg border border-orange-900/40 overflow-hidden shadow-2xl">
                    <img
                      src="/images/misc/Hathery.jpg" 
                      alt="Hathery"
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-in-out"
                    />
                  </div>
                  <div className="mt-6">
                    <h3 className="font-cinzel text-2xl text-orange-500 tracking-widest uppercase font-bold">Hathery</h3>
                  </div>
                </div>

                <div className="hidden md:block w-px h-full min-h-[300px] bg-gradient-to-b from-transparent via-orange-900/40 to-transparent"></div>

                <div className="flex flex-col justify-center">
                  <div className="relative">
                    <span className="absolute -top-10 -left-6 text-8xl font-serif text-orange-900/20 pointer-events-none">“</span>
                    <p className="font-cormorant text-xl md:text-2xl text-gray-200 leading-relaxed italic relative z-10">
                      Voices On The Rise is a dedicated space designed to showcase the unique energy and vocal expression that defines the RISE community. Hosted by Hathery, we tune into the frequencies that inspire connection, creativity, and the power of independent music, celebrating the emerging voices of our world.
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