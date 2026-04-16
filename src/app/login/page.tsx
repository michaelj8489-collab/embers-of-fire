'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function LoginPage() {
  return (
    <div className="min-h-screen relative bg-black text-gray-200 flex flex-col overflow-hidden font-cormorant">
      
      {/* --- VIDEO BACKGROUND --- */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-50"
        >
          <source src="/images/phoenix-revived.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10 pointer-events-none" />
      </div>

      <div className="relative z-20 flex flex-col min-h-screen w-full">
        <Header />

        <main className="flex-grow flex flex-col items-center justify-center px-4 w-full">
          
          {/* WRAPPER: Keeps Logo and Box locked together perfectly in the center */}
          <div className="w-full max-w-md flex flex-col items-center mt-8">
            
            {/* --- THE HOVERING PHOENIX --- */}
            {/* NO absolute positioning. We use a negative margin-bottom to pull the box up! */}
            <div className="relative z-30 w-48 md:w-64 -mb-12 md:-mb-16 pointer-events-none">
              <img 
                src="/images/main-images/RISE LOGO NO BG.png" 
                alt="Rise Radio Phoenix" 
                className="w-full h-auto drop-shadow-[0_0_40px_rgba(234,88,12,0.7)] transition-transform duration-700 hover:scale-105"
              />
            </div>

            {/* --- LOGIN BOX --- */}
            {/* Padding-top (pt) is increased here to make room for the overlapping logo */}
            <div className="relative z-20 w-full bg-zinc-950/80 backdrop-blur-md border border-orange-500/20 p-8 pt-16 md:pt-20 rounded-[2.5rem] shadow-[0_0_60px_rgba(0,0,0,0.9)]">
              <div className="text-center mb-10">
                <h2 className="font-cinzel text-3xl text-orange-500 tracking-[0.2em] uppercase font-bold">Portal Access</h2>
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-orange-500/40 to-transparent mx-auto mt-4" />
              </div>

              {/* AUTH AREA */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="font-cinzel text-xs uppercase tracking-widest text-gray-400 ml-2">Seeker Credentials</label>
                  <input 
                    type="email" 
                    placeholder="Enter Email..." 
                    className="w-full bg-black/60 border border-zinc-800 p-4 rounded-2xl focus:border-orange-500 outline-none transition-all font-cormorant text-lg text-white placeholder:text-zinc-600" 
                  />
                </div>
                
                <button className="w-full group relative overflow-hidden bg-gradient-to-br from-orange-600 to-red-800 p-4 rounded-2xl font-cinzel tracking-[0.3em] uppercase font-bold text-white shadow-xl hover:brightness-110 transition-all active:scale-95">
                  <span className="relative z-10">Enter Sanctuary</span>
                </button>

                <p className="text-center font-cormorant italic text-gray-500 text-sm mt-6">
                  Authorized access only.
                </p>
              </div>
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}