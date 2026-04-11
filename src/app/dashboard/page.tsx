'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function UnifiedDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userTier, setUserTier] = useState<string>('seeker'); // Default room
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', session.user.id)
          .single();
          
        if (profile && profile.subscription_tier) {
          setUserTier(profile.subscription_tier);
        }
      }
    };

    checkSession();
  }, [supabase]);

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
      
      {/* FIXED PHOENIX BACKGROUND */}
      <div className="fixed inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-30">
          <source src="/images/jmc-edits-palettes/phoenix-arriving.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow flex flex-col items-center pt-32 pb-12 px-6 md:px-12 lg:px-20 w-full">
          <div className="w-full flex flex-col items-center">
            
            {/* HERO VIDEOS */}
            <div className="flex flex-col md:flex-row gap-16 md:gap-32 items-center justify-center mb-16">
              
              {/* THE SANCTUARY (Smart Link!) */}
              <Link href={isLoggedIn ? `/sanctuary/${userTier}` : '/login'} className="flex flex-col items-center group cursor-pointer">
                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-2 border-orange-900/50 shadow-[0_0_50px_rgba(234,88,12,0.2)] bg-neutral-900 transition-all duration-700 group-hover:border-orange-500 group-hover:shadow-[0_0_80px_rgba(234,88,12,0.4)]">
                  <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60 transition-opacity duration-700 group-hover:opacity-100">
                    <source src="/images/eol-come-alive.mp4" type="video/mp4" />
                  </video>
                </div>
                <h2 className="mt-8 font-cinzel text-3xl text-orange-400 tracking-widest uppercase group-hover:text-orange-300 transition-colors">The Sanctuary</h2>
              </Link>

              {/* THE STATION */}
              <Link href="/dashboard/station" className="flex flex-col items-center group cursor-pointer">
                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-2 border-red-900/50 shadow-[0_0_50px_rgba(220,38,38,0.2)] bg-neutral-900 transition-all duration-700 group-hover:border-red-600 group-hover:shadow-[0_0_80px_rgba(220,38,38,0.4)]">
                  <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60 transition-opacity duration-700 group-hover:opacity-100">
                    <source src="/images/jmc-edits-palettes/rise-radio-bg.mp4" type="video/mp4" />
                  </video>
                </div>
                <h2 className="mt-8 font-cinzel text-3xl text-red-600 tracking-widest uppercase group-hover:text-red-500 transition-colors">The Station</h2>
              </Link>

            </div>

            {/* NEW: THE SANCTUARY EXPLANATION BOX */}
            <div className="w-full max-w-5xl mx-auto mb-24 bg-gradient-to-b from-orange-900/20 to-black/60 backdrop-blur-md border border-orange-500/30 p-10 md:p-16 rounded-[2rem] shadow-2xl text-center relative overflow-hidden group">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50"></div>
              <h3 className="font-cinzel text-3xl md:text-4xl text-orange-400 mb-6 tracking-widest uppercase">What is The Sanctuary?</h3>
              <p className="text-xl md:text-2xl text-gray-300 font-cormorant leading-relaxed max-w-3xl mx-auto mb-8">
                Think of this Dashboard as our main lobby, but <strong className="text-orange-500 font-bold">The Sanctuary</strong> is your exclusive VIP Lounge. 
                Depending on your Seeker, Keeper, or Flame Bearer tier, stepping into The Sanctuary unlocks a private community board. 
                Check back daily for exclusive broadcasts, behind-the-scenes updates, and direct transmissions tailored just for you.
              </p>
              <p className="text-sm font-cinzel text-orange-500/70 tracking-[0.3em] uppercase">
                Click the glowing bird above to step into your room.
              </p>
            </div>

            {/* SPARK & FREQUENCIES */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 mb-24 w-full">
              <div className="bg-black/60 backdrop-blur-md border border-orange-900/30 p-10 rounded-2xl flex flex-col justify-between shadow-2xl">
                <div>
                  <h3 className="font-cinzel text-orange-500 text-2xl mb-6 tracking-widest uppercase">The Spark</h3>
                  <p className="text-gray-300 mb-8 leading-relaxed italic text-2xl font-bold">
                    "RISE Radio isn't just a station. It's a community where singers come to be heard, feel something, and connect through music."
                  </p>
                  <p className="text-gray-400 text-lg leading-relaxed mb-6">
                    <span className="text-orange-400 font-bold uppercase">Rise Radio</span> began with two voices and a burning desire to inspire deeper conversations.
                  </p>
                </div>
                <div className="border-l-4 border-orange-600 pl-6 py-4 bg-orange-900/10">
                  <p className="text-gray-300 text-sm tracking-widest uppercase">Fueling the fire of independent connection.</p>
                </div>
              </div>

              <div className="bg-black/60 backdrop-blur-md border border-red-900/30 p-10 rounded-2xl shadow-2xl">
                <h3 className="font-cinzel text-red-500 text-2xl mb-8 tracking-widest uppercase">Frequencies</h3>
                <div className="space-y-12">
                  <div>
                    <h4 className="font-cinzel text-white text-xs tracking-[0.3em] uppercase mb-4">Rise Radio: The Signal</h4>
                    <iframe src="https://zeno.fm/player/rise-radio-woqo" width="100%" height="120" frameBorder="0" scrolling="no" className="rounded-lg opacity-90 filter hover:grayscale-0 grayscale transition-all"></iframe>
                  </div>
                  <div>
                    <h4 className="font-cinzel text-white text-xs tracking-[0.3em] uppercase mb-4">Rise Awakenings: The Core</h4>
                    <iframe src="https://zeno.fm/player/rise-awakenings" width="100%" height="120" frameBorder="0" scrolling="no" className="rounded-lg opacity-90 filter hover:grayscale-0 grayscale transition-all"></iframe>
                  </div>
                </div>
              </div>
            </div>

            {/* FULL WIDTH SCHEDULE */}
            <section className="mb-24 w-full">
              <h3 className="font-cinzel text-center text-5xl mb-16 tracking-[0.4em] text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 uppercase font-bold">Network Schedule</h3>
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm shadow-2xl">
                <table className="w-full border-collapse font-cinzel text-sm">
                  <thead>
                    <tr className="bg-neutral-900/90 text-orange-400 text-lg">
                      <th className="p-8 text-left uppercase tracking-widest">Show</th>
                      <th className="p-8 text-center uppercase tracking-widest">Day</th>
                      <th className="p-8 text-right uppercase tracking-widest">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((show) => (
                      <tr key={show.name} className="border-t border-white/5 hover:bg-orange-900/20 transition-all group">
                        <td className="p-8">
                          <Link href={show.href} className="flex flex-col">
                            <span className="text-2xl text-gray-200 group-hover:text-orange-400 transition-colors">{show.name}</span>
                            <span className={`text-xs mt-1 uppercase font-bold tracking-widest ${show.status === 'LIVE' ? 'text-green-500 animate-pulse' : show.status === 'Coming Soon' ? 'text-blue-400' : 'text-gray-500'}`}>
                              {show.status}
                            </span>
                          </Link>
                        </td>
                        <td className="p-8 text-center text-xl text-gray-400 group-hover:text-gray-100">{show.day}</td>
                        <td className="p-8 text-right text-xl text-gray-400 group-hover:text-gray-100">{show.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* DONOR SECTION */}
            <section className="w-full bg-gradient-to-r from-orange-950/40 via-black to-red-950/40 border-y border-orange-900/40 p-20 text-center rounded-[3rem] mb-12 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
              <h3 className="font-cinzel text-5xl text-orange-500 mb-8 uppercase tracking-[0.2em]">Guardian of the Embers</h3>
              <p className="text-2xl italic text-gray-300 mb-12 max-w-4xl mx-auto font-cormorant leading-relaxed">
                By standing here within the Embers, you are fueling the fire. Your support allows this independent platform to reach those who need it most.
              </p>
              <Link href="/dashboard/donate" className="inline-block bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 text-white px-16 py-6 rounded-full font-cinzel text-2xl tracking-[0.4em] transition-all shadow-[0_0_40px_rgba(234,88,12,0.4)] hover:scale-105 active:scale-95 uppercase font-bold">
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