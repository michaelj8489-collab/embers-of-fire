'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import MerchGallery from '@/components/MerchGallery';

const dycProducts = [
  { 
    id: 1, 
    name: "DYC Cotton Canvas Tote Bag", 
    price: "$18.68", 
    image: "https://images-api.printify.com/mockup/69ded6850fd5e8d4a509b25c/101409/93895/defining-your-character-cotton-canvas-tote-bag.jpg?camera_label=front&revision=1776211818568&s=2048", 
    link: "https://embers-of-light.printify.me/product/27983321" 
  },
  { 
    id: 2, 
    name: "DYC Ceramic Mug", 
    price: "$7.93", 
    image: "https://images-api.printify.com/mockup/69ded5880fd5e8d4a509b1fc/65216/6310/defining-your-character-ceramic-mug-11oz-15oz.jpg?camera_label=front&revision=1776211414282&s=2048", 
    link: "https://embers-of-light.printify.me/product/27983190" 
  },
  { 
    id: 3, 
    name: "DYC Unisex Heavy Cotton Tee", 
    price: "$31.35", 
    image: "https://images-api.printify.com/mockup/69ded4292ce01629fd044fce/12100/92570/defining-your-character-unisex-heavy-cotton-tee.jpg?camera_label=front&revision=1776211062387&s=2048", 
    link: "https://embers-of-light.printify.me/product/27983040" 
  }
];

export default function DefiningYourCharacterPage() {
  return (
    <div className="relative min-h-screen bg-black text-gray-200 overflow-hidden font-cormorant">
      
      {/* BACKGROUND IMAGE - Updated to .png */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-20 fixed"
        style={{ backgroundImage: "url('/images/jmc-edits-palettes/defining-your-character.png')" }}
      />
      
      {/* VIGNETTE OVERLAY */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Header />

        <main className="flex-grow flex flex-col items-center pt-32 pb-12 px-6 w-full">
          <div className="w-full max-w-5xl">
            
            {/* Nav Link */}
            <div className="mb-8">
              <Link href="/dashboard/sanctuary" className="text-orange-500 hover:text-orange-400 font-cinzel tracking-widest transition-colors flex items-center gap-2 w-fit uppercase text-sm">
                <span>←</span> BACK TO SANCTUARY
              </Link>
            </div>

            {/* SHOW TITLE HEADER */}
            <div className="text-center mb-16">
              <h1 className="font-cinzel-decorative text-4xl md:text-7xl text-orange-500 uppercase tracking-[0.15em] mb-4 drop-shadow-[0_0_20px_rgba(234,88,12,0.5)]">
                Defining Your Character
              </h1>
              <p className="font-cinzel italic text-xl md:text-2xl text-orange-300/90 tracking-widest">
                Returning to RISE Radio — April 19, 2026
              </p>
              <div className="h-px w-64 bg-gradient-to-r from-transparent via-orange-900/50 to-transparent mx-auto mt-8" />
            </div>

            {/* LIVE PLAYER SECTION */}
            <section className="max-w-xl mx-auto mb-16">
              <div className="bg-zinc-900/60 border border-orange-500/20 p-8 rounded-2xl backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                  </span>
                  <h2 className="font-cinzel text-xs uppercase tracking-[0.4em] text-gray-400">Live RISE Radio Stream</h2>
                </div>
                
                <audio controls className="w-full h-12 accent-orange-500">
                  <source src="https://stream.zeno.fm/4wd4w83qgy8uv" type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
                
                <p className="font-cormorant text-center text-gray-500 mt-4 italic text-sm tracking-wide">
                  Tune in for the broadcast on RISE Radio
                </p>
              </div>
            </section>

            {/* --- MERCH GALLERY --- */}
            <MerchGallery showName="Defining Your Character" products={dycProducts} />

            {/* ARCHIVES SECTION */}
            <section className="mt-16">
              <div className="flex items-center gap-4 mb-10">
                <div className="h-px flex-1 bg-orange-900/30"></div>
                <h2 className="font-cinzel text-lg text-orange-400 uppercase tracking-[0.3em]">The Archives</h2>
                <div className="h-px flex-1 bg-orange-900/30"></div>
              </div>

              <div className="bg-black/50 border border-orange-900/20 rounded-xl overflow-hidden backdrop-blur-sm">
                <iframe 
                  src="https://zeno.fm/podcast/defining-your-character/embed/" 
                  width="100%" 
                  height="450px" 
                  frameBorder="0" 
                  scrolling="no"
                  className="opacity-80 hover:opacity-100 transition-opacity"
                ></iframe>
              </div>
            </section>

            {/* MEET THE HOST SECTION */}
            <section className="w-full mt-24 mb-24 text-center">
              <h2 className="font-cinzelDec text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 uppercase tracking-widest mb-6">
                Meet The Host
              </h2>
              <div className="w-32 h-px bg-gradient-to-r from-transparent via-orange-900/60 to-transparent mx-auto mb-16"></div>

              <div className="grid grid-cols-1 md:grid-cols-[300px_1px_1fr] items-center gap-10 md:gap-16 bg-black/60 backdrop-blur-sm p-8 md:p-12 rounded-2xl border border-orange-900/30 shadow-2xl">
                <div className="flex flex-col items-center">
                  <div className="relative w-[280px] h-[350px] rounded-lg border border-orange-900/40 overflow-hidden shadow-[0_0_20px_rgba(234,88,12,0.1)]">
                    <img
                      src="/images/jmc-edits-palettes/michael-j-bio.png" 
                      alt="Michael J Cox"
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-in-out"
                    />
                  </div>
                  <div className="mt-6">
                    <h3 className="font-cinzel text-2xl text-orange-500 tracking-widest uppercase font-bold">
                      Michael J Cox
                    </h3>
                  </div>
                </div>

                <div className="hidden md:block w-px h-full min-h-[300px] bg-gradient-to-b from-transparent via-orange-900/40 to-transparent"></div>

                <div className="text-left flex flex-col justify-center">
                  <div className="relative">
                    <span className="absolute -top-10 -left-6 text-8xl font-serif text-orange-900/20 pointer-events-none">“</span>
                    <p className="font-cormorant text-xl md:text-2xl text-gray-200 leading-relaxed italic relative z-10">
                      Michael J Cox is a dynamic musician, high-tenor vocalist, and self-published author based in Southeast Georgia. As an IT specialist for the Rise Radio Network and the host of Defining Your Character, he seamlessly blends his passions for live performance, audio production, and web development. Whether he is engaging audiences on his multi-platform broadcasts or releasing original poetry and music, Michael brings a fiercely innovative spirit to every project he takes on.
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