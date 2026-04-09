'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function NetworkPortal() {
  return (
    <div className="relative min-h-screen w-full flex flex-col bg-black font-cormorant text-gray-200">
      
      {/* Background is now simple solid black for zero sensory overload */}

      <div className="relative z-20 flex flex-col min-h-screen w-full">
        <Header />

        <main className="flex-grow flex flex-col items-center justify-center px-4 w-full">
          <div className="w-full max-w-6xl text-center">
            
            {/* The Main Header matching your PRISTINE sanctuary style */}
            <h1 className="font-cinzel-decorative font-bold text-4xl md:text-7xl mb-16 uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-600">
              Choose Your Path
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              
              {/* PATH: THE SANCTUARY (EMBERS) */}
              <Link href="/dashboard/sanctuary" className="group flex flex-col items-center">
                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-2 border-orange-900/50 group-hover:border-orange-500 transition-all duration-700 shadow-[0_0_40px_rgba(234,88,12,0.15)] group-hover:shadow-[0_0_60px_rgba(234,88,12,0.4)] bg-neutral-900">
                  <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover grayscale-[60%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                  >
                    <source src="/images/eol-come-alive.mp4" type="video/mp4" />
                  </video>
                  {/* Subtle vignette so the video looks deeper */}
                  <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.8)]"></div>
                </div>
                <h2 className="mt-8 font-cinzel text-3xl text-orange-400 tracking-widest uppercase group-hover:text-orange-300 transition-colors">
                  The Sanctuary
                </h2>
                <p className="font-cormorant italic text-xl text-gray-500 mt-2">Embers of Light</p>
              </Link>

              {/* PATH: THE STATION (RISE) */}
              <Link href="/dashboard/rise-hub" className="group flex flex-col items-center">
                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-2 border-red-900/50 group-hover:border-red-600 transition-all duration-700 shadow-[0_0_40px_rgba(220,38,38,0.15)] group-hover:shadow-[0_0_60px_rgba(220,38,38,0.4)] bg-neutral-900">
                  <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover grayscale-[60%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                  >
                    <source src="/images/jmc-edits-palettes/rise-radio-bg.mp4" type="video/mp4" />
                  </video>
                  {/* Subtle vignette */}
                  <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.8)]"></div>
                </div>
                <h2 className="mt-8 font-cinzel text-3xl text-red-600 tracking-widest uppercase group-hover:text-red-500 transition-colors">
                  The Station
                </h2>
                <p className="font-cormorant italic text-xl text-gray-500 mt-2">RISE Radio Hub</p>
              </Link>

            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}