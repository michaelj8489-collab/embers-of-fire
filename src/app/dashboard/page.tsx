'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function UnifiedDashboard() {
  const schedule = [
    { name: "The Bloom", day: "Tuesdays", time: "8:00 PM EST", href: "/dashboard/the-bloom", status: "LIVE" },
    { name: "The Messengers", day: "Wednesdays", time: "7:00 PM EST", href: "/dashboard/the-messengers", status: "Active" },
    { name: "Phoenix Talks", day: "Thursdays", time: "9:00 PM EST", href: "/dashboard/phoenix-talks", status: "Active" },
    { name: "Honky Tonk Heaven", day: "Fridays", time: "8:00 PM EST", href: "/dashboard/honky-tonk-heaven", status: "Active" },
    { name: "Voices on the Rise", day: "Saturdays", time: "7:00 PM EST", href: "/dashboard/voices-on-the-rise", status: "Active" },
    { name: "Defining Your Character", day: "Starts April 19", time: "TBA", href: "/dashboard/defining-your-character", status: "Coming Soon" },
  ];

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-black font-cormorant text-gray-200 overflow-x-hidden">
      <Header />

      <main className="flex-grow flex flex-col items-center py-12 px-4 w-full">
        <div className="w-full max-w-6xl">
          
          {/* 1. SIDE-BY-SIDE HERO VIDEOS */}
          <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-center justify-center mb-20">
            <div className="flex flex-col items-center group">
              <div className="relative w-56 h-56 md:w-72 md:h-72 rounded-full overflow-hidden border-2 border-orange-900/50 shadow-[0_0_40px_rgba(234,88,12,0.15)] bg-neutral-900 transition-all duration-700 group-hover:border-orange-500">
                <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                  <source src="/images/eol-come-alive.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.8)]"></div>
              </div>
              <h2 className="mt-6 font-cinzel text-2xl text-orange-400 tracking-widest uppercase group-hover:text-orange-300 transition-colors">The Sanctuary</h2>
              <p className="font-cormorant italic text-gray-500 mt-1 uppercase text-sm tracking-tighter">Embers of Light</p>
            </div>

            <div className="flex flex-col items-center group">
              <div className="relative w-56 h-56 md:w-72 md:h-72 rounded-full overflow-hidden border-2 border-red-900/50 shadow-[0_0_40px_rgba(220,38,38,0.15)] bg-neutral-900 transition-all duration-700 group-hover:border-red-600">
                <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                  <source src="/images/jmc-edits-palettes/rise-radio-bg.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.8)]"></div>
              </div>
              <h2 className="mt-6 font-cinzel text-2xl text-red-600 tracking-widest uppercase group-hover:text-red-500 transition-colors">The Station</h2>
              <p className="font-cormorant italic text-gray-500 mt-1 uppercase text-sm tracking-tighter">RISE Radio Hub</p>
            </div>
          </div>

          {/* 2. THE SPARK & FREQUENCIES (FUSED LAYOUT) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            <div className="bg-neutral-900/40 border border-orange-900/30 p-8 rounded-lg flex flex-col justify-between">
              <div>
                <h3 className="font-cinzel text-orange-500 text-xl mb-4 tracking-wider uppercase">The Spark That Started It All</h3>
                <p className="text-gray-300 mb-6 leading-relaxed italic text-lg">
                  "RISE Radio isn't just a station. It's a community where singers come to be heard, feel something, and connect through music."
                </p>
                <p className="text-gray-400 leading-relaxed mb-6">
                  <span className="text-orange-400 font-bold">RISE RADIO</span> began with a simple intention: two voices, one microphone, and a burning desire to inspire listeners with deeper conversations than what traditional radio was offering.
                </p>
              </div>
              <div className="border-l-2 border-orange-600 pl-4 py-2 bg-orange-900/10">
                <p className="text-gray-300 text-sm">By standing here within the Embers, you are fueling the fire. Your presence helps sustain this independent platform.</p>
              </div>
            </div>

            <div className="bg-neutral-900/40 border border-red-900/30 p-8 rounded-lg">
              <h3 className="font-cinzel text-red-500 text-xl mb-6 tracking-wider uppercase">Still Rising: Our Frequencies</h3>
              <div className="space-y-8">
                <div>
                  <h4 className="font-cinzel text-white text-sm tracking-widest uppercase">Rise Radio: The Original Signal</h4>
                  <p className="text-gray-400 text-sm mt-1">Dedicated purely to music recorded and submitted by members from the RISE Radio community.</p>
                  <iframe src="https://zeno.fm/player/rise-radio-woqo" width="100%" height="100" frameBorder="0" scrolling="no" className="mt-4 rounded opacity-80 filter grayscale hover:grayscale-0 transition-all"></iframe>
                </div>
                <div>
                  <h4 className="font-cinzel text-white text-sm tracking-widest uppercase">Rise Awakenings: The Conscious Core</h4>
                  <p className="text-gray-400 text-sm mt-1">Born to blend music with deep conversations around mental wellbeing and personal awareness.</p>
                  <iframe src="https://zeno.fm/player/rise-awakenings" width="100%" height="100" frameBorder="0" scrolling="no" className="mt-4 rounded opacity-80 filter grayscale hover:grayscale-0 transition-all"></iframe>
                </div>
              </div>
            </div>
          </div>

          {/* 3. CLICKABLE NETWORK SCHEDULE */}
          <section className="mb-20">
            <h3 className="font-cinzel text-center text-4xl mb-12 tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 uppercase font-bold">Network Schedule</h3>
            <div className="overflow-hidden rounded-xl border border-white/10 shadow-2xl">
              <table className="w-full border-collapse font-cinzel text-sm">
                <thead>
                  <tr className="bg-neutral-900 text-orange-400">
                    <th className="p-5 text-left uppercase tracking-widest">Show</th>
                    <th className="p-5 text-center uppercase tracking-widest">Day</th>
                    <th className="p-5 text-right uppercase tracking-widest">Time</th>
                  </tr>
                </thead>
                <tbody className="bg-black/40">
                  {schedule.map((show) => (
                    <tr key={show.name} className="border-t border-white/5 hover:bg-orange-900/10 transition-colors group cursor-pointer">
                      <td className="p-5">
                        <Link href={show.href} className="flex flex-col">
                          <span className="text-lg text-gray-200 group-hover:text-orange-400 transition-colors">{show.name}</span>
                          <span className={`text-[10px] uppercase tracking-tighter ${show.status === 'LIVE' ? 'text-green-500' : 'text-gray-500'}`}>{show.status}</span>
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

          {/* 4. DONOR PERKS & STRIPE CTA */}
          <section className="bg-gradient-to-b from-neutral-900 to-black border border-orange-900/40 p-12 text-center rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <h3 className="font-cinzel text-4xl text-orange-500 mb-6 uppercase tracking-widest">Guardian of the Embers</h3>
            <div className="max-w-3xl mx-auto mb-10">
              <p className="text-xl italic text-gray-300 mb-8 font-cormorant">Your presence fuels the fire. Becoming a paid donor allows this legacy of healing and connection to reach those who need it most.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto border-t border-orange-900/20 pt-8">
                <div className="flex items-center gap-3 text-gray-400">
                  <span className="text-orange-600 text-xl">✦</span>
                  <span className="text-sm tracking-widest uppercase">Hi-Fi Audio Streams</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <span className="text-orange-600 text-xl">✦</span>
                  <span className="text-sm tracking-widest uppercase">Exclusive Show Archives</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <span className="text-orange-600 text-xl">✦</span>
                  <span className="text-sm tracking-widest uppercase">Early Access to DYC</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <span className="text-orange-600 text-xl">✦</span>
                  <span className="text-sm tracking-widest uppercase">Private Discord Lounge</span>
                </div>
              </div>
            </div>
            <Link 
              href="/dashboard/donate" 
              className="inline-block bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 text-white px-12 py-5 rounded-full font-cinzel text-xl tracking-[0.3em] transition-all hover:scale-105 shadow-[0_0_30px_rgba(234,88,12,0.4)] uppercase font-bold"
            >
              Become a Donor
            </Link>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}