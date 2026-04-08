'use client'; 

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function TheCorePage() {
  const [activeView, setActiveView] = useState<'archive' | 'live'>('archive');

  return (
    <div 
      className="min-h-screen text-gray-200 flex flex-col relative bg-cover bg-center bg-fixed font-cormorant"
      style={{ backgroundImage: "url('/images/main-images/Cover Art/core-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/90 z-0 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Header />

        <main className="flex-grow flex flex-col items-center pt-24 pb-12 px-4 w-full">
          <div className="w-full max-w-7xl">
            
            {/* Back Button */}
            <div className="mb-8">
              <Link href="/dashboard" className="text-orange-500 hover:text-orange-400 font-cinzel tracking-widest transition-colors flex items-center gap-2 w-fit">
                <span>←</span> BACK TO SANCTUARY
              </Link>
            </div>

            {/* Show Title */}
            <div className="text-center mb-16 border-b border-orange-900/50 pb-8">
              <h1 className="font-cinzel-decorative font-bold text-center text-5xl md:text-7xl mb-4 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
                The CORE
              </h1>
              <p className="font-cinzel text-xl text-orange-200/80 italic">
                Stripping away the layers.
              </p>
            </div>

            {/* --- SMART PLAYER & CHAT SECTION --- */}
            <div className="mb-16 relative">
              <div className="flex justify-center gap-4 mb-8">
                <button 
                  onClick={() => setActiveView('live')}
                  className={`px-6 py-2 font-cinzel text-sm border transition-all rounded-full uppercase tracking-widest active:scale-95 ${activeView === 'live' ? 'border-orange-500 text-orange-500 bg-orange-500/10 shadow-[0_0_15px_rgba(234,88,12,0.3)]' : 'border-gray-600 text-gray-500'}`}
                >
                  🔴 Live Stream & Chat
                </button>
                <button 
                  onClick={() => setActiveView('archive')}
                  className={`px-6 py-2 font-cinzel text-sm border transition-all rounded-full uppercase tracking-widest active:scale-95 ${activeView === 'archive' ? 'border-orange-500 text-orange-500 bg-orange-500/10 shadow-[0_0_15px_rgba(234,88,12,0.3)]' : 'border-gray-600 text-gray-500'}`}
                >
                  🎬 The Archives
                </button>
              </div>

              <div className="w-full border border-orange-900/50 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(234,88,12,0.15)] bg-black relative">
                
                {activeView === 'live' ? (
                  <div className="flex flex-col md:flex-row w-full md:h-[600px]">
                    <div className="flex-grow h-full bg-black">
                      <iframe
                        src="https://player.twitch.tv/?channel=riseradionetworks&parent=embers-of-fire-4lgo.vercel.app&muted=true&autoplay=false"
                        className="w-full h-full"
                        frameBorder="0"
                        allowFullScreen={true}
                      ></iframe>
                    </div>
                    <div className="w-full md:w-[350px] h-[400px] md:h-full border-t md:border-t-0 md:border-l border-orange-900/30">
                      <iframe
                        src="https://www.twitch.tv/embed/riseradionetworks/chat?parent=embers-of-fire-4lgo.vercel.app&darkpopout"
                        className="w-full h-full"
                        frameBorder="0"
                      ></iframe>
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-video">
                    <iframe
                      src="https://www.youtube.com/embed/videoseries?list=PL5HonD7o0fApxMMgPdDGINANFeG8KBL6V"
                      className="w-full h-full"
                      frameBorder="0"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}

              </div>
              <p className="text-center font-cormorant italic text-gray-500 mt-4">
                {activeView === 'live' ? 'You are watching The CORE Live!' : 'Viewing The CORE Archives. Join us live Thursdays at 11 AM EST.'}
              </p>
            </div>

           {/* --- MEET THE FOUNDERS SECTION --- */}
            <section className="w-full mt-20 mb-24 text-center">
              <h2 className="font-cinzel-decorative text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 uppercase tracking-widest mb-6">
                Meet The Founders
              </h2>
              <div className="w-32 h-px bg-gradient-to-r from-transparent via-orange-900/60 to-transparent mx-auto mb-16"></div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-stretch">
                
                {/* Host 1: Michka */}
                <div className="flex flex-col items-center">
                  <div className="relative w-full max-w-[280px] aspect-[4/5] rounded-2xl border border-orange-900/30 overflow-hidden shadow-2xl mb-6 group">
                    <img src="/images/misc/michka-core-bio.jpg" alt="Michka Grant" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  </div>
                  <h3 className="font-cinzel text-2xl text-orange-500 tracking-widest uppercase font-bold mb-2">Michka Grant</h3>
                  <p className="font-cormorant text-gray-300 italic leading-relaxed px-4">
                    Visionary host and co-founder of RISE, Michka brings a deep focus on frequency and soul-led performance to the heart of every discussion.
                  </p>
                </div>

                {/* Host 2: Karrie */}
                <div className="flex flex-col items-center">
                  <div className="relative w-full max-w-[280px] aspect-[4/5] rounded-2xl border border-orange-900/30 overflow-hidden shadow-2xl mb-6 group">
                    {/* Check if this needs to be Karrie.jpg or karrie.jpg! */}
                    <img src="/images/misc/karrie.jpg" alt="Karrie Northrup" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  </div>
                  <h3 className="font-cinzel text-2xl text-orange-500 tracking-widest uppercase font-bold mb-2">Karrie Northrup</h3>
                  <p className="font-cormorant text-gray-300 italic leading-relaxed px-4">
                    As a co-founder of RISE, Karrie is dedicated to stripping away the layers of the ego to find the authentic core of the artistic journey.
                  </p>
                </div>

                {/* Host 3: Rev. Diane */}
                <div className="flex flex-col items-center">
                  <div className="relative w-full max-w-[280px] aspect-[4/5] rounded-2xl border border-orange-900/30 overflow-hidden shadow-2xl mb-6 group">
                    <img src="/images/misc/Diane Solo.jpg" alt="Rev. Diane R DeBiasi" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  </div>
                  <h3 className="font-cinzel text-2xl text-orange-500 tracking-widest uppercase font-bold mb-2">Rev. Diane R DeBiasi</h3>
                  <p className="font-cormorant text-gray-300 italic leading-relaxed px-4">
                    Rev. Diane explores the intersection of spiritual depth and creative wisdom, guiding listeners through the journey of the soul.
                  </p>
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