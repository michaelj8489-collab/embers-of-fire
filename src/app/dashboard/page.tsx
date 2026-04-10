'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function UnifiedDashboard() {
  // Added the missing shows and kept the existing ones
  const schedule = [
    { name: "The Bloom", day: "Tuesdays", time: "8:00 PM EST", href: "/dashboard/the-bloom", status: "LIVE" },
    { name: "The Messengers", day: "Wednesdays", time: "7:00 PM EST", href: "/dashboard/the-messengers", status: "Active" },
    { name: "Brindle's Vision", day: "Thursdays", time: "6:00 PM EST", href: "/dashboard/brindles-vision", status: "Active" },
    { name: "Phoenix Talks", day: "Thursdays", time: "9:00 PM EST", href: "/dashboard/phoenix-talks", status: "Active" },
    { name: "The CORE", day: "Fridays", time: "6:00 PM EST", href: "/dashboard/the-core", status: "Active" },
    { name: "Honky Tonk Heaven", day: "Fridays", time: "8:00 PM EST", href: "/dashboard/honky-tonk-heaven", status: "Active" },
    { name: "Illuminate", day: "Saturdays", time: "12:00 PM EST", href: "/dashboard/illuminate", status: "Active" },
    { name: "Voices on the Rise", day: "Saturdays", time: "7:00 PM EST", href: "/dashboard/voices-on-the-rise", status: "Active" },
    { name: "Defining Your Character", day: "Starts April 19", time: "TBA", href: "/dashboard/defining-your-character", status: "Coming Soon" },
  ];

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-black font-cormorant text-gray-200 overflow-x-hidden">
      
      {/* BACKGROUND VIDEO: Phoenix Arriving */}
      <div className="fixed inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover opacity-30"
        >
          <source src="/images/jmc-edits-palettes/phoenix-arriving.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

       <main className="flex-grow flex flex-col items-center pt-24 pb-12 px-4 w-full">
          <div className="w-full max-w-6xl">
            
            {/* HERO VIDEOS */}
            <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-center justify-center mb-20">
              <div className="flex flex-col items-center group cursor-pointer">
                <div className="relative w-56 h-56 md:w-72 md:h-72 rounded-full overflow-hidden border-2 border-orange-900/50 shadow-[0_0_40px_rgba(234,88,12,0.15)] bg-neutral-900 transition-all duration-700 group-hover:border-orange-500">
                  <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60">
                    <source src="/images/eol-come-alive.mp4" type="video/mp4" />
                  </video>
                </div>
                <h2 className="mt-6 font-cinzel text-2xl text-orange-400 tracking-widest uppercase">The Sanctuary</h2>
              </div>

              <div className="flex flex-col items-center group cursor-pointer">
                <div className="relative w-56 h-56 md:w-72 md:h-72 rounded-full overflow-hidden border-2 border-red-900/50 shadow-[0_0_40px_rgba(220,38,38,0.15)] bg-neutral-900 transition-all duration-700 group-hover:border-red-600">
                  <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60">
                    <source src="/images/jmc-edits-palettes/rise-radio-bg.mp4" type="video/mp4" />
                  </video>
                </div>
                <h2 className="mt-6 font-cinzel text-2xl text-red-600 tracking-widest uppercase">The Station</h2>
              </div>
            </div>

            {/* SPARK & FREQUENCIES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
              <div className="bg-black/60 backdrop-blur-md border border-orange-900/30 p-8 rounded-lg flex flex-col justify-between shadow-2xl">
                <div>
                  <h3 className="font-cinzel text-orange-500 text-xl mb-4 tracking-wider uppercase underline underline-offset-8 decoration-orange-900/50">The Spark</h3>
                  <p className="text-gray-300 mb-6 leading-relaxed italic text-lg font-bold">
                    "RISE Radio isn't just a station. It's a community where singers come to be heard, feel something, and connect through music."
                  </p>
                  <p className="text-gray-400 leading-relaxed mb-6">
                    <span className="text-orange-400 font-bold uppercase">Rise Radio</span> began with two voices and a burning desire to inspire deeper conversations.
                  </p>
                </div>
                <div className="border-l-2 border-orange-600 pl-4 py-2 bg-orange-900/10">
                  <p className="text-gray-300 text-sm">Fueling the fire of independent connection.</p>
                </div>
              </div>

              <div className="bg-black/60 backdrop-blur-md border border-red-900/30 p-8 rounded-lg shadow-2xl">
                <h3 className="font-cinzel text-red-500 text-xl mb-6 tracking-wider uppercase underline underline-offset-8 decoration-red-900/50">Frequencies</h3>
                <div className="space-y-8">
                  <div>
                    <h4 className="font-cinzel text-white text-xs tracking-[0.2em] uppercase">Rise Radio</h4>
                    <iframe src="https://zeno.fm/player/rise-radio-woqo" width="100%" height="100" frameBorder="0" scrolling="no" className="mt-4 rounded opacity-80 filter hover:grayscale-0 grayscale transition-all"></iframe>
                  </div>
                  <div>
                    <h4 className="font-cinzel text-white text-xs tracking-[0.2em] uppercase">Rise Awakenings</h4>
                    <iframe src="https://zeno.fm/player/rise-awakenings" width="100%" height="100" frameBorder="0" scrolling="no" className="mt-4 rounded opacity-80 filter hover:grayscale-0 grayscale transition-all"></iframe>
                  </div>
                </div>
              </div>
            </div>

            {/* UPDATED CLICKABLE SCHEDULE */}
            <section className="mb-20">
              <h3 className="font-cinzel text-center text-4xl mb-12 tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 uppercase font-bold">Show Schedule</h3>
              <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm">
                <table className="w-full border-collapse font-cinzel text-sm">
                  <thead>
                    <tr className="bg-neutral-900/80 text-orange-400">
                      <th className="p-5 text-left uppercase tracking-widest">Show</th>
                      <th className="p-5 text-center uppercase tracking-widest">Day</th>
                      <th className="p-5 text-right uppercase tracking-widest">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((show) => (
                      <tr key={show.name} className="border-t border-white/5 hover:bg-orange-900/20 transition-all group">
                        <td className="p-5">
                          <Link href={show.href} className="flex flex-col">
                            <span className="text-lg text-gray-200 group-hover:text-orange-400 transition-colors">{show.name}</span>
                            <span className={`text-[10px] uppercase font-bold tracking-tighter ${show.status === 'LIVE' ? 'text-green-500 animate-pulse' : show.status === 'Coming Soon' ? 'text-blue-400' : 'text-gray-500'}`}>
                              {show.status}
                            </span>
                          </Link>
                        </td>
                        <td className="p-5 text-center text-gray-400 group-hover:text-gray-200">{show.day}</td>
                        <td className="p-5 text-right text-gray-400 group-hover:text-gray-200">{show.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* DONOR SECTION */}
            <section className="bg-gradient-to-b from-neutral-900/80 to-black border border-orange-900/40 p-12 text-center rounded-3xl mb-12">
              <h3 className="font-cinzel text-3xl text-orange-500 mb-6 uppercase tracking-widest">Guardian of the Embers</h3>
              <p className="text-xl italic text-gray-300 mb-8 max-w-2xl mx-auto">Your support fuels the signal. Join our donor tiers to unlock archives and early access.</p>
              <Link 
                href="/dashboard/donate" 
                className="inline-block bg-orange-700 hover:bg-orange-600 text-white px-12 py-4 rounded-full font-cinzel text-lg tracking-[0.3em] transition-all shadow-[0_0_30px_rgba(234,88,12,0.3)]"
              >
                Become a Donor
              </Link>
            </section>

          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}