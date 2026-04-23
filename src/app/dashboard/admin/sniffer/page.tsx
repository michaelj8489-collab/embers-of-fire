'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SmuleSniffer from '@/components/SmuleSniffer';

export default function SnifferPage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col bg-black font-cormorant text-gray-200 overflow-x-hidden">
      
      {/* FIXED PHOENIX BACKGROUND (Matching the Dashboard) */}
      <div className="fixed inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-30">
          <source src="/images/jmc-edits-palettes/phoenix-arriving.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow flex flex-col items-center pt-32 md:pt-48 pb-24 px-4">
          <div className="w-full max-w-7xl mx-auto text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(255,0,0,0.3)]">
              The Signal Sniffer
            </h1>
            <p className="mt-4 text-orange-500/60 font-cinzel text-sm md:text-base tracking-[0.3em] uppercase">
              Admin Interception Console
            </p>
          </div>

          {/* THE SNIFFER COMPONENT */}
          <SmuleSniffer />
          
        </main>

        <Footer />
      </div>
    </div>
  );
}