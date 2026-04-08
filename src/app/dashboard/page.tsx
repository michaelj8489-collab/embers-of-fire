'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-hidden font-cormorant text-gray-200">
      
      {/* --- THE LIVE VIDEO BACKGROUND --- */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover fixed"
        >
          <source src="/images/jmc-edits-palettes/phoenix-arriving.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for readability over the fire */}
        <div className="absolute inset-0 bg-black/85 z-10 pointer-events-none fixed"></div>
      </div>

      {/* --- MAIN CONTENT WRAPPER --- */}
      <div className="relative z-20 flex flex-col min-h-screen w-full">
        <Header />

        <main className="flex-grow flex flex-col items-center pt-24 pb-12 px-4 w-full">
          <div className="w-full max-w-5xl">
            
            {/* Welcome Banner & Video */}
            <div className="text-center mb-16 border-b border-orange-900/50 pb-8">
              {/* The Looping Video */}
              <div className="w-full max-w-2xl mx-auto mb-10 shadow-[0_0_30px_rgba(234,88,12,0.3)] rounded-xl overflow-hidden border border-orange-900/50">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-auto object-cover pointer-events-none"
                >
                  <source src="/images/eol-come-alive.mp4" type="video/mp4" />
                </video>
              </div>

              {/* The Stacked Title */}
              <h1 className="font-cinzel-decorative font-bold text-center flex flex-col items-center gap-2 mb-6 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
                <span className="text-4xl md:text-5xl">Welcome</span>
                <span className="text-5xl md:text-7xl">To The Embers</span>
              </h1>
              <p className="font-cinzel text-xl text-orange-200/80 italic">
                You have stepped into the Sanctuary. The signal is strong here.
              </p>
            </div>

            {/* The Legacy Section */}
            <div className="bg-black/60 backdrop-blur-sm border border-orange-900/50 rounded-2xl p-8 md:p-12 mb-16 shadow-[0_0_30px_rgba(234,88,12,0.15)]">
              <h2 className="font-cinzel-decorative text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-6 uppercase tracking-wider">The Spark That Started It All</h2>
              <div className="space-y-6 text-gray-200 leading-relaxed text-xl font-cormorant">
                <p>
                  <strong className="font-cinzel text-orange-400 font-bold text-2xl tracking-wide">Rise Radio</strong> began with a simple intention: two voices, one microphone, and a burning desire to inspire listeners with deeper conversations than what traditional radio was offering.
                </p>
                <p>
                  Karrie "Lunaria" Lynne and Brindlewolf first came together as co-hosts of <em>The Messengers</em>, a show originally created to give listeners a real experience of the kind of insight and perspective they could expect during a personal reading. What started as meaningful conversation quickly grew into a blazing fire—a space where music, awareness, and honest dialogue could coexist.
                </p>
                <p>
                  Feeling called to build something of their own, they stepped away to create <strong className="font-cinzel text-orange-400 font-bold text-2xl tracking-wide">RISE Radio</strong>, a community built on independence, authenticity, and the belief that radio could still inspire growth, connection, and thought-provoking discussion.
                </p>
                <div className="mt-8 p-6 border-l-4 border-red-600 bg-black/60 rounded-r-lg">
                  <p className="text-orange-200 font-semibold italic text-2xl">
                    By standing here within the Embers, you are doing more than just tuning in—you are fueling the fire. Your presence and support help sustain this independent platform, allowing this legacy of healing, awareness, and connection to reach those who need it most.
                  </p>
                </div>
              </div>
            </div>

            {/* Frequencies Section */}
            <div className="mb-16">
              <h2 className="font-cinzel-decorative text-4xl font-bold text-center text-orange-500 mb-10 uppercase tracking-wider">Still Rising: Our Frequencies</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Station 1 */}
                <div className="bg-black/60 backdrop-blur-sm border border-orange-900/50 rounded-xl p-8 hover:border-orange-500/50 transition-colors">
                  <h3 className="font-cinzel text-3xl font-bold text-gray-100 mb-3 border-b border-orange-900/50 pb-2">RISE Radio</h3>
                  <p className="font-cinzel text-orange-500/90 text-sm mb-4 uppercase tracking-widest font-bold">The Original Signal</p>
                  <p className="text-gray-300 font-cormorant text-xl leading-relaxed">
                    Dedicated purely to music recorded and submitted by members from the RISE Radio community. A 24-hour loop of handpicked independent art.
                  </p>
                </div>
                {/* Station 2 */}
                <div className="bg-black/60 backdrop-blur-sm border border-red-900/50 rounded-xl p-8 hover:border-red-500/50 transition-colors">
                  <h3 className="font-cinzel text-3xl font-bold text-gray-100 mb-3 border-b border-red-900/50 pb-2">RISE Awakenings</h3>
                  <p className="font-cinzel text-red-500/90 text-sm mb-4 uppercase tracking-widest font-bold">The Conscious Core</p>
                  <p className="text-gray-300 font-cormorant text-xl leading-relaxed">
                    Born to blend music with deep conversations around mental wellbeing, personal awareness, and transformational perspectives.
                  </p>
                </div>
              </div>
            </div>

            {/* Transmission Schedule */}
            <div className="mb-16 text-center">
              <h2 className="font-cinzel-decorative text-4xl font-bold text-orange-500 mb-10 uppercase tracking-wider">Live Transmission Schedule</h2>
              <div className="max-w-3xl mx-auto bg-black/60 backdrop-blur-sm border border-orange-900/50 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(234,88,12,0.2)]">
                {/* Mon-Fri Rows (Condensed for brevity, ensuring they link to show pages) */}
                {/* Monday */}
                <div className="flex flex-col sm:flex-row border-b border-orange-900/30">
                   <div className="bg-black/70 p-6 sm:w-1/3 flex items-center border-b sm:border-b-0 sm:border-r border-orange-900/30">
                     <h3 className="font-cinzel text-2xl font-bold text-orange-400 uppercase tracking-widest text-center w-full">Mondays</h3>
                   </div>
                   <div className="p-6 sm:w-2/3 space-y-4">
                     <Link href="/dashboard/the-bloom" className="flex justify-between items-center group">
                        <span className="font-cormorant text-2xl font-semibold text-gray-200">The Bloom <span className="text-orange-600/70 text-sm italic group-hover:text-orange-500 ml-2">(CLICK HERE)</span></span>
                        <span className="text-orange-400 font-mono text-sm">11:00 AM EST</span>
                     </Link>
                     <Link href="/dashboard/the-messengers" className="flex justify-between items-center group">
                        <span className="font-cormorant text-2xl font-semibold text-gray-200">The Messengers <span className="text-orange-600/70 text-sm italic group-hover:text-orange-500 ml-2">(CLICK HERE)</span></span>
                        <span className="text-orange-400 font-mono text-sm">6:00 PM EST</span>
                     </Link>
                   </div>
                </div>
                {/* Tuesday */}
                <div className="flex flex-col sm:flex-row border-b border-orange-900/30">
                  <div className="bg-black/70 p-6 sm:w-1/3 flex items-center border-r border-orange-900/30">
                    <h3 className="font-cinzel text-2xl font-bold text-orange-400 uppercase tracking-widest text-center w-full">Tuesdays</h3>
                  </div>
                  <div className="p-6 sm:w-2/3">
                    <Link href="/dashboard/brindles-vision" className="flex justify-between items-center group">
                      <span className="font-cormorant text-2xl font-semibold text-gray-200">Brindle's Vision <span className="text-orange-600/70 text-sm italic group-hover:text-orange-500 ml-2">(CLICK HERE)</span></span>
                      <span className="text-orange-400 font-mono text-sm">6:00 PM EST</span>
                    </Link>
                  </div>
                </div>
                {/* Wednesday */}
                <div className="flex flex-col sm:flex-row border-b border-orange-900/30">
                  <div className="bg-black/70 p-6 sm:w-1/3 flex items-center border-r border-orange-900/30">
                    <h3 className="font-cinzel text-2xl font-bold text-orange-400 uppercase tracking-widest text-center w-full">Wednesdays</h3>
                  </div>
                  <div className="p-6 sm:w-2/3">
                    <Link href="/dashboard/phoenix-talks" className="flex justify-between items-center group">
                      <span className="font-cormorant text-2xl font-semibold text-gray-200">Phoenix Talks <span className="text-orange-600/70 text-sm italic group-hover:text-orange-500 ml-2">(CLICK HERE)</span></span>
                      <span className="text-orange-400 font-mono text-sm">6:00 PM EST</span>
                    </Link>
                  </div>
                </div>
                {/* Thursday */}
                <div className="flex flex-col sm:flex-row border-b border-orange-900/30">
                  <div className="bg-black/70 p-6 sm:w-1/3 flex items-center border-r border-orange-900/30">
                    <h3 className="font-cinzel text-2xl font-bold text-orange-400 uppercase tracking-widest text-center w-full">Thursdays</h3>
                  </div>
                  <div className="p-6 sm:w-2/3">
                    <Link href="/dashboard/the-core" className="flex justify-between items-center group">
                      <span className="font-cormorant text-2xl font-semibold text-gray-200">The CORE <span className="text-orange-600/70 text-sm italic group-hover:text-orange-500 ml-2">(CLICK HERE)</span></span>
                      <span className="text-orange-400 font-mono text-sm">11:00 AM EST</span>
                    </Link>
                  </div>
                </div>
                {/* Friday */}
                <div className="flex flex-col sm:flex-row">
                  <div className="bg-black/70 p-6 sm:w-1/3 flex items-center border-r border-orange-900/30">
                    <h3 className="font-cinzel text-2xl font-bold text-orange-400 uppercase tracking-widest text-center w-full">Fridays</h3>
                  </div>
                  <div className="p-6 sm:w-2/3">
                    <Link href="/dashboard/illuminate" className="flex justify-between items-center group">
                      <span className="font-cormorant text-2xl font-semibold text-gray-200">Illuminate w/ Lunaria <span className="text-orange-600/70 text-sm italic group-hover:text-orange-500 ml-2">(CLICK HERE)</span></span>
                      <span className="text-orange-400 font-mono text-sm">6:00 PM EST</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* RISE Radio Community Section */}
            <div className="w-full max-w-5xl mx-auto mt-16 mb-12 bg-black/60 backdrop-blur-sm border border-orange-900/50 rounded-2xl p-8 md:p-12 shadow-[0_0_30px_rgba(234,88,12,0.15)] flex flex-col items-center">
              <img src="/images/rise-radio-logo.png" alt="Rise Radio Logo" className="w-32 h-32 md:w-40 md:h-40 rounded-full border border-orange-500/50 mb-6 object-cover" />
              <h2 className="font-cinzel-decorative text-3xl md:text-4xl text-center font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 uppercase tracking-widest mb-10">Rise Radio</h2>
              <div className="w-full max-w-md mx-auto mb-10 relative z-20">
                <iframe src="https://zeno.fm/player/rise-radio-networks" width="100%" height="120" frameBorder="0" scrolling="no" className="rounded-lg relative z-10 shadow-lg"></iframe>
              </div>
              <div className="max-w-3xl text-center space-y-6 text-gray-300 text-base md:text-lg mb-10 font-sans leading-relaxed">
                <p>RISE Radio isn't just a station. It's a community where Smule singers come to be heard, feel something, and connect through music.</p>
                <p>At RISE, singing isn't about perfection—it's about passion. Whether you're a seasoned vocalist or just sing for joy, there's a place for you here.</p>
                <p>Our team of DJs and staff help create a space that feels like a warm, welcoming home. No pressure, no judgment—just real people sharing real moments through music.</p>
              </div>
              <p className="font-cinzel text-xl md:text-2xl text-orange-400/90 italic text-center tracking-wider font-semibold">"When words fail, music speaks"</p>
            </div>

          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}