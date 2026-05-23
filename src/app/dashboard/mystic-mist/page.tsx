'use client';

import Image from 'next/image';
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function MysticMistPage() {
  return (
    <div className="relative min-h-screen bg-black text-gray-200 overflow-hidden font-cormorant">
      
      {/* BACKGROUND IMAGE */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/main-images/Cover Art/mystic-mist-bg.jpg" 
          alt="Mystic Mist Background" 
          className="w-full h-full object-cover fixed opacity-30" 
        />
        <div className="absolute inset-0 bg-[#4B0082]/20 z-10 pointer-events-none fixed"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90 z-10 pointer-events-none fixed"></div>
      </div>

      <div className="relative z-20 flex flex-col min-h-screen w-full">
        <Header />

        <main className="flex-grow flex flex-col items-center pt-32 pb-12 px-6 w-full">
          <div className="w-full max-w-7xl mx-auto">
            
            {/* BACK TO DASHBOARD LINK */}
            <div className="mb-12">
              <Link href="/dashboard" className="text-orange-500 hover:text-orange-400 font-cinzel tracking-widest transition-colors flex items-center gap-2 w-fit uppercase text-sm font-bold">
                <span>←</span> BACK TO DASHBOARD
              </Link>
            </div>

            {/* SHOW TITLE HEADER */}
            <div className="text-center mb-16 border-b border-orange-900/30 pb-12">
              <h1 className="font-cinzel-decorative text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-200 to-orange-400 uppercase tracking-widest mb-4 drop-shadow-[0_0_20px_rgba(234,88,12,0.3)]">
                Mystic Mist with Amanda
              </h1>
              <h2 className="font-cinzel text-3xl text-orange-600 tracking-[0.2em] font-bold uppercase mt-2 drop-shadow-md">
                TBA
              </h2>
              <p className="font-cinzel italic text-xl md:text-2xl text-orange-300/80 tracking-widest uppercase mt-4">
                Drift into the vibe.
              </p>
            </div>

            {/* LIVE AUDIO PLAYER BOX */}
            <section className="max-w-2xl mx-auto mb-16">
              <div className="bg-zinc-900/60 border border-orange-500/20 p-8 rounded-2xl backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                  </span>
                  <h2 className="font-cinzel text-xs uppercase tracking-[0.4em] text-gray-400 font-bold">Live Broadcast Stream</h2>
                </div>
                
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
                
                <p className="font-cormorant text-center text-orange-400 mt-4 italic text-lg tracking-wide font-bold">
                  Premiere Date Coming Soon
                </p>
              </div>
            </section>

            {/* MEET THE HOST SECTION */}
            <section className="w-full mt-24 mb-24 text-center border-t border-orange-900/20 pt-20">
              <h2 className="font-cinzel-decorative text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 uppercase tracking-widest mb-6">
                Meet The Host
              </h2>
              <div className="w-32 h-px bg-gradient-to-r from-transparent via-orange-900/60 to-transparent mx-auto mb-16"></div>

              <div className="grid grid-cols-1 md:grid-cols-[300px_1px_1fr] items-center gap-10 md:gap-16 bg-black/60 backdrop-blur-sm p-8 md:p-12 rounded-2xl border border-orange-900/30 shadow-2xl text-left">
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-[280px] h-[350px] rounded-lg border border-orange-900/40 overflow-hidden shadow-2xl">
                    <Image
                      src="/images/misc/amanda-bio.jpg" 
                      alt="Amanda (Papaduck78)"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="mt-6">
                    <h3 className="font-cinzel text-2xl text-orange-500 tracking-widest uppercase font-bold">
                      Amanda
                    </h3>
                    <p className="font-cinzel text-sm text-orange-300/60 tracking-widest uppercase mt-1">Papaduck78</p>
                  </div>
                </div>

                <div className="hidden md:block w-px h-full min-h-[300px] bg-gradient-to-b from-transparent via-orange-900/40 to-transparent"></div>

                <div className="flex flex-col justify-center">
                  <div className="relative">
                    <span className="absolute -top-10 -left-6 text-8xl font-serif text-orange-900/20 pointer-events-none">“</span>
                    <div className="font-cormorant text-xl md:text-2xl text-gray-200 leading-relaxed italic relative z-10 space-y-4">
                      <p>
                        Amanda, also known as Papaduck78, is a distinctive voice on Rise Radio. A rich contralto vocalist, she has been creating music on Smule for over a decade, connecting with listeners through her expressive style.
                      </p>
                      <p>
                        Based in England, UK, she brings a grounded yet ethereal energy to the airwaves, hosting live jam sessions that capture raw, spontaneous moments.
                      </p>
                      <p>
                        Passionate about community, Amanda showcases fellow Rise members’ music, supporting emerging artists and creating an inclusive, atmospheric listening experience. Tune in to Mystic Mist and drift into the vibe.
                      </p>
                    </div>
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