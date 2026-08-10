'use client';

import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const supabase = useMemo(() => createClient(), []);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (active) setIsLoggedIn(Boolean(session?.user));
    };

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setIsLoggedIn(Boolean(session?.user));
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <footer className="relative z-20 mt-auto w-full border-t border-orange-900/60 bg-black/95 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className={`grid gap-10 font-cormorant text-gray-400 ${isLoggedIn ? 'grid-cols-1 text-center md:grid-cols-4 md:text-left' : 'grid-cols-1 text-center'}`}>
          <div className={`flex flex-col items-center space-y-4 ${isLoggedIn ? 'md:items-start' : ''}`}>
            <h3 className="font-cinzel text-2xl tracking-widest text-orange-500">RISE RADIO</h3>
            <p className="text-sm italic md:text-base">Igniting the spark. Fueling the journey.</p>
          </div>

          {isLoggedIn ? (
            <>
              <div className="flex flex-col space-y-3">
                <h4 className="mb-2 inline-block border-b border-orange-900/30 pb-2 font-cinzel uppercase tracking-widest text-white">
                  The Sanctuary
                </h4>
                <Link href="/dashboard" className="transition-colors duration-300 hover:text-orange-400">Dashboard</Link>
                <Link href="/dashboard#network-schedule" className="transition-colors duration-300 hover:text-orange-400">Show Calendar</Link>
                <Link href="/dashboard/membership" className="transition-colors duration-300 hover:text-orange-400">Membership</Link>
                <Link href="/community-standards" className="transition-colors duration-300 hover:text-orange-400">Community Standards</Link>
              </div>

              <div className="flex flex-col space-y-3">
                <h4 className="mb-2 inline-block border-b border-orange-900/30 pb-2 font-cinzel uppercase tracking-widest text-white">
                  Connect
                </h4>
                <a href="https://www.facebook.com/profile.php?id=61578647787283" target="_blank" rel="noopener noreferrer" className="transition-colors duration-300 hover:text-orange-400">Embers of Light Facebook</a>
                <a href="https://www.facebook.com/groups/riseawakenings" target="_blank" rel="noopener noreferrer" className="transition-colors duration-300 hover:text-orange-400">Rise Awakenings Facebook</a>
                <a href="https://www.youtube.com/@EmbersOfLight1111" target="_blank" rel="noopener noreferrer" className="transition-colors duration-300 hover:text-orange-400">EOL YouTube</a>
                <a href="https://lnk.bio/embers_of_light?fbclid=IwY2xjawRcZ4dleHRuA2FlbQIxMABicmlkETFQVlFJUDdvbXM5WGVseGJ5c3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHryIDMNmBh5Xe3M9nTvf5aFx23XhIHK6G6pIqas6fl5C2vapWNLQynDE9-_B_aem_oakVqv4TJ7zaBn_3RM94bw" target="_blank" rel="noopener noreferrer" className="transition-colors duration-300 hover:text-orange-400">lnk.bio for podcasts</a>
              </div>

              <div className="flex flex-col space-y-3">
                <h4 className="mb-2 inline-block border-b border-orange-900/30 pb-2 font-cinzel uppercase tracking-widest text-white">
                  Host Websites
                </h4>
                <a href="https://www.lnk.bio/brindlewolf" target="_blank" rel="noopener noreferrer" className="transition-colors duration-300 hover:text-orange-400">Brindle Wolf</a>
                <a href="https://www.healingrose.org/" target="_blank" rel="noopener noreferrer" className="transition-colors duration-300 hover:text-orange-400">Rev Diane R. Dibiasi</a>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="border-t border-orange-900/40 py-4 md:py-6">
        <div className="mx-auto flex w-full max-w-7xl flex-row items-center justify-between gap-2 px-3 sm:px-6 md:px-12">
          <div className="flex min-w-0 shrink items-center text-left font-cormorant text-gray-400">
            <p className="truncate text-[9px] leading-tight sm:text-xs md:text-sm">
              &copy; {currentYear} <span className="font-cinzel font-bold tracking-tighter text-orange-500 sm:tracking-wider">EMBERS OF LIGHT</span>. <span className="hidden sm:inline">All rights reserved.</span>
            </p>
          </div>

          <div className="flex shrink-0 flex-row items-center gap-1 sm:gap-4">
            <span className="hidden text-[9px] italic text-gray-400 xxs:inline sm:text-xs md:text-sm">Designed by</span>
            <div className="group flex cursor-default flex-row items-center gap-1 sm:gap-3">
              <Image
                src="/images/crimson-leo.png"
                alt="Crimson Leo Designs Logo"
                width={40}
                height={40}
                className="h-4 w-4 object-contain drop-shadow-[0_0_8px_rgba(255,0,0,0.6)] transition-transform duration-300 group-hover:scale-110 sm:h-8 sm:w-8 md:h-10 md:w-10"
              />
              <span className="whitespace-nowrap bg-gradient-to-r from-red-600 to-indigo-500 bg-clip-text font-cinzel text-[9px] font-bold tracking-tighter text-transparent drop-shadow-sm transition-colors group-hover:from-red-500 group-hover:to-indigo-400 sm:text-sm sm:tracking-widest md:text-lg">
                Crimson Leo Designs
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
