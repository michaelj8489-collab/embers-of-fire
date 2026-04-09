'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function RiseHubPage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-hidden font-cormorant text-gray-200">
      
      {/* --- THE LIVE VIDEO BACKGROUND --- */}
      <div className="absolute inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover fixed">
          <source src="/images/jmc-edits-palettes/rise-radio-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#4B0082]/20 z-10 pointer-events-none fixed"></div>
        <div className="absolute inset-0 bg-black/80 z-10 pointer-events-none fixed"></div>
      </div>

      <div className="relative z-20 flex flex-col min-h-screen w-full">
        <Header />

        <main className="flex-grow flex flex-col items-center pt-24 pb-12 px-4 w-full">
          <div className="w-full max-w-5xl">
            
            {/* Back Button to Portal */}
            <div className="mb-8">
              <Link href="/dashboard" className="text-[#8A2BE2] hover:text-[#FF8C00] font-cinzel tracking-widest transition-colors flex items-center gap-2 w-fit">
                <span>←</span> BACK TO PORTAL
              </Link>
            </div>

            {/* Welcome Banner */}
            <div className="text-center mb-16 border-b border-[#4B0082]/50 pb-8">
              <div className="w-full max-w-2xl mx-auto mb-10 shadow-[0_0_30px_rgba(75,0,130,0.4)] rounded-xl overflow-hidden border border-[#4B0082]/50">
                <video autoPlay loop muted playsInline className="w-full h-auto object-cover pointer-events-none">
                  <source src="/images/jmc-edits-palettes/rise-radio-bg.mp4" type="video/mp4" />
                </video>
              </div>

              <h1 className="font-cinzel-decorative font-bold text-center flex flex-col items-center gap-2 mb-6 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#FF4500] via-[#FFD700] to-[#FF4500]">
                <span className="text-4xl md:text-5xl">The Station</span>
                <span className="text-5xl md:text-7xl">RISE Radio Hub</span>
              </h1>
              <p className="font-cinzel text-xl text-[#FFF8DC]/80 italic">
                Where words fail, music speaks.
              </p>
            </div>

            {/* Interactive Musical Show Schedule */}
            <div className="mb-16 text-center">
              <h2 className="font-cinzel-decorative text-4xl font-bold text-[#FF8C00] mb-10 uppercase tracking-wider">Musical Transmission Schedule</h2>
              <div className="max-w-3xl mx-auto bg-black/60 backdrop-blur-sm border border-[#4B0082]/50 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(75,0,130,0.3)]">
                
                {/* Sunday: Unplug w/ Amelia */}
                <div className="flex flex-col sm:flex-row border-b border-[#4B0082]/30">
                   <div className="bg-[#4B0082]/20 p-6 sm:w-1/3 flex items-center border-b sm:border-b-0 sm:border-r border-[#4B0082]/30">
                     <h3 className="font-cinzel text-xl font-bold text-[#FFD700] uppercase tracking-widest text-center w-full">Sundays</h3>
                   </div>
                   <div className="p-6 sm:w-2/3 text-left">
                     <Link href="/dashboard/rise-hub/unplug-amelia" className="flex justify-between items-center group">
                        <span className="font-cormorant text-2xl font-semibold text-[#FFF8DC] group-hover:text-[#FF8C00] transition-colors">
                          Unplug w/ Amelia <span className="text-[#8A2BE2] text-sm italic group-hover:text-[#FFD700] ml-2 font-cinzel tracking-tighter">(CLICK HERE)</span>
                        </span>
                        <span className="text-[#FF8C00] font-mono text-sm">7:00 PM EST</span>
                     </Link>
                   </div>
                </div>

                {/* Tuesday: Rock Rewind */}
                <div className="flex flex-col sm:flex-row border-b border-[#4B0082]/30">
                  <div className="bg-[#4B0082]/20 p-6 sm:w-1/3 flex items-center border-r border-[#4B0082]/30">
                    <h3 className="font-cinzel text-xl font-bold text-[#FFD700] uppercase tracking-widest text-center w-full">Tuesdays</h3>
                  </div>
                  <div className="p-6 sm:w-2/3 text-left">
                    <Link href="/dashboard/rise-hub/rock-rewind" className="flex justify-between items-center group">
                      <span className="font-cormorant text-2xl font-semibold text-[#FFF8DC] group-hover:text-[#FF8C00] transition-colors">
                        The Rock Rewind <span className="text-[#8A2BE2] text-sm italic group-hover:text-[#FFD700] ml-2 font-cinzel tracking-tighter">(CLICK HERE)</span>
                      </span>
                      <span className="text-[#FF8C00] font-mono text-sm">8:00 PM EST</span>
                    </Link>
                  </div>
                </div>

                {/* Wednesday: Honky Tonk */}
                <div className="flex flex-col sm:flex-row border-b border-[#4B0082]/30">
                  <div className="bg-[#4B0082]/20 p-6 sm:w-1/3 flex items-center border-r border-[#4B0082]/30">
                    <h3 className="font-cinzel text-xl font-bold text-[#FFD700] uppercase tracking-widest text-center w-full">Wednesdays</h3>
                  </div>
                  <div className="p-6 sm:w-2/3 text-left">
                    <Link href="/dashboard/rise-hub/honky-tonk-heaven" className="flex justify-between items-center group">
                      <span className="font-cormorant text-2xl font-semibold text-[#FFF8DC] group-hover:text-[#FF8C00] transition-colors">
                        Honky Tonk Heaven <span className="text-[#8A2BE2] text-sm italic group-hover:text-[#FFD700] ml-2 font-cinzel tracking-tighter">(CLICK HERE)</span>
                      </span>
                      <span className="text-[#FF8C00] font-mono text-sm">8:00 PM EST</span>
                    </Link>
                  </div>
                </div>

                {/* Friday: Voices & Vivid Vibes */}
                <div className="flex flex-col sm:flex-row">
                  <div className="bg-[#4B0082]/20 p-6 sm:w-1/3 flex items-center border-r border-[#4B0082]/30">
                    <h3 className="font-cinzel text-xl font-bold text-[#FFD700] uppercase tracking-widest text-center w-full">Fridays</h3>
                  </div>
                  <div className="p-6 sm:w-2/3 text-left space-y-4">
                    <Link href="/dashboard/rise-hub/voices-on-the-rise" className="flex justify-between items-center group">
                      <span className="font-cormorant text-2xl font-semibold text-[#FFF8DC] group-hover:text-[#FF8C00] transition-colors">
                        Voices On The Rise <span className="text-[#8A2BE2] text-sm italic group-hover:text-[#FFD700] ml-2 font-cinzel tracking-tighter">(CLICK HERE)</span>
                      </span>
                      <span className="text-[#FF8C00] font-mono text-sm">6:00 PM EST</span>
                    </Link>
                    <div className="border-t border-[#4B0082]/20 pt-4">
                      <Link href="/dashboard/rise-hub/vivid-vibes" className="flex justify-between items-center group">
                        <span className="font-cormorant text-2xl font-semibold text-[#FFF8DC] group-hover:text-[#FF8C00] transition-colors">
                          Vivid Vibes <span className="text-[#8A2BE2] text-sm italic group-hover:text-[#FFD700] ml-2 font-cinzel tracking-tighter">(CLICK HERE)</span>
                        </span>
                        <span className="text-[#FF8C00] font-mono text-sm">7:00 PM EST</span>
                      </Link>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Mission Card */}
            <div className="bg-[#4B0082]/10 backdrop-blur-sm border border-[#8A2BE2]/30 rounded-2xl p-8 md:p-12 mb-16 shadow-[0_0_30px_rgba(138,43,226,0.1)] text-center font-cormorant text-2xl text-[#FFF8DC]/90 italic">
               "RISE Radio isn't just a station. It's a community where singers come to be heard, feel something, and connect through music."
            </div>

          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}