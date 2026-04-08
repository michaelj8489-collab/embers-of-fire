'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <div 
      className="min-h-screen text-gray-200 flex flex-col relative bg-cover bg-center bg-fixed font-cormorant"
      style={{ backgroundImage: "url('/images/phoenix-revised.png')" }}
    >
      {/* Dark overlay to make sure the text is still easy to read over the fire */}
      <div className="absolute inset-0 bg-black/80 z-0 pointer-events-none"></div>

      {/* Main Content Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Header />

        <main className="flex-grow flex flex-col items-center pt-24 pb-12 px-4 w-full">
          <div className="w-full max-w-5xl">
            
            {/* Welcome Banner & Video */}
            <div className="text-center mb-16 border-b border-orange-900/50 pb-8">
               <h1 className="font-cinzel-decorative font-bold text-center text-5xl md:text-7xl mb-4 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
                The Sanctuary
              </h1>
              <p className="font-cinzel text-xl text-orange-200/80 italic">
                Your home for Rise Radio Network.
              </p>
            </div>

            {/* LIVE TRANSMISSION SCHEDULE */}
            <section className="mb-20">
              <h2 className="font-cinzel text-3xl text-center text-orange-500 mb-10 tracking-[0.2em] uppercase">
                Live Transmission Schedule
              </h2>
              
              <div className="bg-black/60 border border-orange-900/30 rounded-xl overflow-hidden shadow-2xl">
                
                {/* Tuesday */}
                <div className="flex flex-col sm:flex-row border-b border-orange-900/30 hover:bg-black/80 transition-colors">
                  <div className="bg-black/70 p-6 sm:w-1/3 flex items-center border-b sm:border-b-0 sm:border-r border-orange-900/30">
                    <h3 className="font-cinzel text-2xl font-bold text-orange-400 uppercase tracking-widest">Tuesdays</h3>
                  </div>
                  <div className="p-6 sm:w-2/3">
                    <div className="flex justify-between items-center group">
                      <Link href="/dashboard/brindles-vision" className="flex items-center">
                        <span className="font-cormorant text-2xl font-semibold text-gray-200">Brindle's Vision</span>
                        <span className="font-sans text-sm text-orange-600/70 italic ml-2 group-hover:text-orange-500 transition-colors">(CLICK HERE)</span>
                      </Link>
                      <span className="text-orange-400 font-mono text-sm bg-black/60 px-2 py-1 rounded border border-orange-900/30">12:00 PM EST</span>
                    </div>
                  </div>
                </div>

                {/* Wednesday */}
                <div className="flex flex-col sm:flex-row border-b border-orange-900/30 hover:bg-black/80 transition-colors">
                  <div className="bg-black/70 p-6 sm:w-1/3 flex items-center border-b sm:border-b-0 sm:border-r border-orange-900/30">
                    <h3 className="font-cinzel text-2xl font-bold text-orange-400 uppercase tracking-widest">Wednesdays</h3>
                  </div>
                  <div className="p-6 sm:w-2/3">
                    <div className="flex justify-between items-center group">
                      <Link href="/dashboard/phoenix-talks" className="flex items-center">
                        <span className="font-cormorant text-2xl font-semibold text-gray-200">Phoenix Talks</span>
                        <span className="font-sans text-sm text-orange-600/70 italic ml-2 group-hover:text-orange-500 transition-colors">(CLICK HERE)</span>
                      </Link>
                      <span className="text-orange-400 font-mono text-sm bg-black/60 px-2 py-1 rounded border border-orange-900/30">6:00 PM EST</span>
                    </div>
                  </div>
                </div>

                {/* Thursday */}
                <div className="flex flex-col sm:flex-row border-b border-orange-900/30 hover:bg-black/80 transition-colors">
                  <div className="bg-black/70 p-6 sm:w-1/3 flex items-center border-b sm:border-b-0 sm:border-r border-orange-900/30">
                    <h3 className="font-cinzel text-2xl font-bold text-orange-400 uppercase tracking-widest">Thursdays</h3>
                  </div>
                  <div className="p-6 sm:w-2/3">
                    <div className="flex justify-between items-center group">
                      <Link href="/dashboard/the-core" className="flex items-center">
                        <span className="font-cormorant text-2xl font-semibold text-gray-200">The CORE</span>
                        <span className="font-sans text-sm text-orange-600/70 italic ml-2 group-hover:text-orange-500 transition-colors">(CLICK HERE)</span>
                      </Link>
                      <span className="text-orange-400 font-mono text-sm bg-black/60 px-2 py-1 rounded border border-orange-900/30">11:00 AM EST</span>
                    </div>
                  </div>
                </div>

                {/* Friday - Just placeholder for now */}
                <div className="flex flex-col sm:flex-row hover:bg-black/80 transition-colors">
                  <div className="bg-black/70 p-6 sm:w-1/3 flex items-center border-b sm:border-b-0 sm:border-r border-orange-900/30">
                    <h3 className="font-cinzel text-2xl font-bold text-orange-400 uppercase tracking-widest">Fridays</h3>
                  </div>
                  <div className="p-6 sm:w-2/3">
                    <div className="flex justify-between items-center group">
                      <span className="font-cormorant text-2xl font-semibold text-gray-200">Illuminate w/ Lunaria</span>
                      <span className="text-orange-400 font-mono text-sm bg-black/60 px-2 py-1 rounded border border-orange-900/30">11:00 AM EST</span>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* Closing Quote */}
            <div className="mt-20">
              <p className="font-cinzel text-xl md:text-2xl text-orange-400/90 italic text-center tracking-wider font-semibold">
                'When words fail, music speaks'
              </p>
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}