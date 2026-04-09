'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function UnplugAmeliaPage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-hidden font-cormorant text-gray-200">
      <div className="absolute inset-0 z-0">
        <img src="/images/media-4/unplug-amelia.png" alt="Unplug Background" className="w-full h-full object-cover fixed opacity-40" />
        <div className="absolute inset-0 bg-[#4B0082]/40 z-10 pointer-events-none fixed"></div>
        <div className="absolute inset-0 bg-black/80 z-10 pointer-events-none fixed"></div>
      </div>
      <div className="relative z-20 flex flex-col min-h-screen w-full">
        <Header />
        <main className="flex-grow flex flex-col items-center pt-24 pb-12 px-4 w-full">
          <div className="w-full max-w-4xl">
            <Link href="/dashboard/rise-hub" className="text-[#8A2BE2] hover:text-[#FF8C00] font-cinzel tracking-widest transition-colors mb-12 flex items-center gap-2 w-fit"><span>←</span> BACK TO STATION</Link>
            <div className="text-center mb-16">
              <h1 className="font-cinzel-decorative font-bold text-5xl md:text-7xl mb-6 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#FF4500] via-[#FFD700] to-[#FF4500]">Unplug w/ Amelia</h1>
              <p className="font-cinzel text-2xl text-[#FFF8DC]/90 italic tracking-wide">"Acoustic vibes and raw talent from the heart of the community."</p>
            </div>
            <div className="w-full bg-black/60 backdrop-blur-md p-8 rounded-2xl border border-[#4B0082]/50 shadow-[0_0_50px_rgba(75,0,130,0.3)] mb-12">
               <h3 className="font-cinzel text-[#FFD700] text-center mb-8 tracking-[0.2em] uppercase">Unplug w/ Amelia: Live Broadcast</h3>
               <div className="w-full flex justify-center"><iframe src="https://zeno.fm/player/rise-radio-woqo" width="100%" height="120" frameBorder="0" scrolling="no" className="rounded-lg shadow-2xl"></iframe></div>
            </div>
            <div className="bg-[#4B0082]/10 border-l-4 border-[#FF4500] p-8 rounded-r-xl">
               <h4 className="font-cinzel text-[#FF8C00] mb-4 uppercase tracking-widest">About Unplug w/ Amelia</h4>
               <p className="font-cormorant text-xl text-[#FFF8DC]/80 leading-relaxed italic">Welcome to Unplug w/ Amelia. This dedicated space is designed to showcase the unique energy and acoustic expression that defines the RISE community. Join us as we tune into the frequencies that inspire connection, creativity, and the power of independent music.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}