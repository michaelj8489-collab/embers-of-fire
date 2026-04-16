'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function LoginPage() {
  return (
    <div className="min-h-screen relative bg-black text-gray-200 flex flex-col font-cormorant">
      {/* Background Image - 30% Opacity */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-30 fixed"
        style={{ backgroundImage: "url('/images/main-images/Cover Art/sanctuary-bg.jpg')" }} 
      />
      
      {/* Vignette Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/80 via-transparent to-black pointer-events-none fixed" />

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Header />

        <main className="flex-grow flex flex-col items-center justify-center px-4 pt-20 pb-12">
          <div className="w-full max-w-md relative">
            
            {/* --- THE HOVERING PHOENIX --- */}
            {/* Higher z-index and negative bottom margin creates the overlap effect */}
            <div className="flex justify-center relative z-20 -mb-16 md:-mb-24">
              <img 
                src="/images/main-images/RISE LOGO NO BG.png" 
                alt="Rise Radio Phoenix" 
                className="w-48 md:w-72 h-auto drop-shadow-[0_0_40px_rgba(234,88,12,0.6)] transition-transform hover:scale-110 duration-700"
              />
            </div>

            {/* --- LOGIN CARD --- */}
            <div className="relative z-10 bg-zinc-950/80 backdrop-blur-2xl border border-orange-500/20 p-8 pt-24 md:pt-32 rounded-[2.5rem] shadow-[0_0_60px_rgba(0,0,0,0.8)] border-b-orange-900/50">
              <div className="text-center mb-10">
                <h2 className="font-cinzel text-3xl text-orange-500 tracking-[0.2em] uppercase font-bold">Portal Access</h2>
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-orange-500/40 to-transparent mx-auto mt-4" />
              </div>

              {/* AUTH COMPONENT / FORM AREA */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="font-cinzel text-xs uppercase tracking-widest text-gray-400 ml-2">Seeker Credentials</label>
                  <input 
                    type="email" 
                    placeholder="Enter Email..." 
                    className="w-full bg-black/40 border border-zinc-800 p-4 rounded-2xl focus:border-orange-500 outline-none transition-all font-cormorant text-lg placeholder:text-zinc-700" 
                  />
                </div>
                
                <button className="w-full group relative overflow-hidden bg-gradient-to-br from-orange-600 to-red-800 p-4 rounded-2xl font-cinzel tracking-[0.3em] uppercase font-bold text-white shadow-lg transition-all active:scale-95">
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