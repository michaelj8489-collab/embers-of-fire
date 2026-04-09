'use client'; 

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function BrindlesVisionPage() {
  // We use a "state" to track which view is active: 'archive' or 'live'
  const [activeView, setActiveView] = useState<'archive' | 'live'>('archive');
  const [parentDomain, setParentDomain] = useState('');

  // Detect current domain for Twitch security
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setParentDomain(window.location.hostname);
    }
  }, []);

  return (
    <div 
      className="min-h-screen text-gray-200 flex flex-col relative bg-cover bg-center bg-fixed font-cormorant"
      style={{ backgroundImage: "url('/images/main-images/Cover Art/brindles-vision-bg.png')" }}
    >
      <div className="absolute inset-0 bg-black/90 z-0 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Header />

        <main className="flex-grow flex flex-col items-center pt-24 pb-12 px-4 w-full">
          <div className="w-full max-w-7xl">
            
            {/* Back Button */}
            <div className="mb-8">
              <Link href="/dashboard/sanctuary" className="text-orange-500 hover:text-orange-400 font-cinzel tracking-widest transition-colors flex items-center gap-2 w-fit">
                <span>←</span> BACK TO SANCTUARY
              </Link>
            </div>

            {/* Show Title */}
            <div className="text-center mb-16 border-b border-orange-900/50 pb-8">
              <h1 className="font-cinzel-decorative font-bold text-center text-5xl md:text-7xl mb-4 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
                Brindle's Vision
              </h1>
              <p className="font-cinzel text-xl text-orange-200/80 italic">
                Tune into the frequency.
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
                  <div className="flex flex-col md:flex-row w-full aspect-video md:aspect-auto md:h-[600px]">
                    <div className="flex-grow h-full bg-black">
                      {parentDomain && (
                        <iframe
                          src={`https://player.twitch.tv/?channel=riseradionetworks&parent=${parentDomain}&muted=false&autoplay=true`}
                          className="w-full h-full"
                          frameBorder="0"
                          allowFullScreen={true}
                        ></iframe>
                      )}
                    </div>
                    <div className="w-full md:w-[350px] h-[400px] md:h-full border-t md:border-t-0 md:border-l border-orange-900/30">
                      {parentDomain && (
                        <iframe
                          src={`https://www.twitch.tv/embed/riseradionetworks/chat?parent=${parentDomain}&darkpopout`}
                          className="w-full h-full"
                          frameBorder="0"
                        ></iframe>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-video">
                    <iframe
                      src="https://www.youtube.com/embed/videoseries?list=PLKmO6Km32njSDRIYBDZcUbzqQFYQGmXIr"
                      className="w-full h-full"
                      frameBorder="0"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}

              </div>
              <p className="text-center font-cormorant italic text-gray-500 mt-4">
                {activeView === 'live' ? 'You are watching LIVE. Join the chat!' : 'Viewing The Archives. Join us live Tuesdays at 12 PM EST.'}
              </p>
            </div>

            {/* --- MEET THE HOST SECTION --- */}
            <section className="w-full mt-20 mb-24 text-center">
              <h2 className="font-cinzel-decorative text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 uppercase tracking-widest mb-6">
                Meet The Host
              </h2>
              <div className="w-32 h-px bg-gradient-to-r from-transparent via-orange-900/60 to-transparent mx-auto mb-16"></div>

              <div className="grid grid-cols-1 md:grid-cols-[300px_1px_1fr] items-center gap-10 md:gap-16 bg-black/60 backdrop-blur-sm p-8 md:p-12 rounded-2xl border border-orange-900/30 shadow-2xl">
                <div className="flex flex-col items-center">
                  <div className="relative w-[280px] h-[350px] rounded-lg border border-orange-900/40 overflow-hidden shadow-[0_0_20px_rgba(234,88,12,0.1)]">
                    <img
                      src="/images/brindle-bio.JPG" 
                      alt="Michka Grant"
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-in-out"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent"></div>
                  </div>
                  <div className="mt-6">
                    <h3 className="font-cinzel text-2xl text-orange-500 tracking-widest uppercase font-bold">
                      Michka Grant
                    </h3>
                    <p className="font-cormorant text-gray-400 italic text-lg">RISE Co-Founder & Host</p>
                  </div>
                </div>

                <div className="hidden md:block w-px h-full min-h-[300px] bg-gradient-to-b from-transparent via-orange-900/40 to-transparent"></div>
                <div className="block md:hidden w-full h-px bg-gradient-to-r from-transparent via-orange-900/40 to-transparent my-4"></div>

                <div className="text-left flex flex-col justify-center">
                  <div className="relative">
                    <span className="absolute -top-10 -left-6 text-8xl font-serif text-orange-900/20 pointer-events-none">“</span>
                    <p className="font-cormorant text-xl md:text-2xl text-gray-200 leading-relaxed italic relative z-10">
                      Michka Grant is the heartbeat of Rise Radio. As a co-founder and the visionary behind Brindle’s Vision, Michka utilizes his deep understanding of frequency and performance to curate an inclusive sanctuary for emerging and established talent. 
                      <br /><br />
                      His mission is to fuel the connection between singer and listener, building an awareness-driven community one broadcast at a time.
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