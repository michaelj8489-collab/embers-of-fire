'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // THE EXORCISM: This tells the Header to wait for the actual client browser 
  // to ask Supabase for the real truth before drawing the buttons.
  useEffect(() => {
    setIsMounted(true); // Wakes up the client side

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    checkSession();

    // This listens for when they actually click sign out/in and updates instantly
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    router.push('/login');
  };

  const shows = [
    { name: "The Bloom", href: "/dashboard/the-bloom" },
    { name: "The Messengers", href: "/dashboard/the-messengers" },
    { name: "Brindle's Vision", href: "/dashboard/brindles-vision" },
    { name: "Phoenix Talks", href: "/dashboard/phoenix-talks" },
    { name: "The CORE", href: "/dashboard/the-core" },
    { name: "Illuminate", href: "/dashboard/illuminate" },
    { name: "Honky Tonk Heaven", href: "/dashboard/honky-tonk-heaven" },
    { name: "Voices on the Rise", href: "/dashboard/voices-on-the-rise" },
    { name: "Defining Your Character", href: "/dashboard/defining-your-character" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full border-b border-orange-900/50 bg-black/95 backdrop-blur-md z-[100]">
      <div className="w-full px-6 md:px-10 py-4 flex items-center justify-between">
        
        <Link href="/dashboard" className="flex items-center gap-3 shrink-0 group">
          <img src="/images/rise-radio-logo.png" alt="Logo" className="h-10 w-10 rounded-full border border-orange-500 shadow-[0_0_10px_rgba(234,88,12,0.3)] group-hover:scale-110 transition-transform" />
          <span className="font-cinzel text-lg font-bold text-orange-500 uppercase tracking-tighter hidden sm:inline-block">
            Embers of Light
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-10">
          <div className="relative group">
            <button className="font-cinzel text-gray-300 hover:text-orange-400 uppercase tracking-widest text-sm flex items-center gap-1">
              Shows ▾
            </button>
            <div className="absolute top-full left-0 w-64 bg-black border border-orange-900/50 p-2 hidden group-hover:flex flex-col gap-1 shadow-2xl rounded-b-lg">
              {shows.map((show) => (
                <Link key={show.href} href={show.href} className="text-gray-400 hover:text-orange-400 p-2 text-xs uppercase tracking-widest transition-all hover:bg-orange-900/20">
                  {show.name}
                </Link>
              ))}
            </div>
          </div>
          
          <Link href="/dashboard/defining-your-character" className="font-cinzel text-red-500 hover:text-red-400 text-sm uppercase tracking-widest">DYC (Coming Soon)</Link>
          
          {/* DESKTOP AUTH BUTTON LOGIC */}
          {isMounted && isLoggedIn && (
            <button onClick={handleSignOut} className="border border-orange-600 text-orange-500 px-8 py-2 rounded-md text-xs font-cinzel font-bold hover:bg-orange-600 hover:text-white transition-all shadow-[0_0_15px_rgba(234,88,12,0.1)]">
              SIGN OUT
            </button>
          )}
          {isMounted && !isLoggedIn && (
            <Link href="/login" className="bg-gradient-to-r from-orange-700 to-orange-500 text-white px-8 py-2 rounded-md text-xs font-cinzel font-bold hover:from-orange-600 hover:to-orange-400 transition-all shadow-[0_0_15px_rgba(234,88,12,0.4)]">
              LOG IN
            </Link>
          )}
        </nav>

        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-orange-500 p-2">
          {isOpen ? <span className="text-2xl">✕</span> : <span className="text-2xl">☰</span>}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="lg:hidden bg-black border-t border-orange-900/50 p-8 flex flex-col gap-6">
          {shows.map((show) => (
            <Link key={show.href} href={show.href} onClick={() => setIsOpen(false)} className="text-gray-300 uppercase text-sm tracking-widest">{show.name}</Link>
          ))}
          
          {/* MOBILE AUTH BUTTON LOGIC */}
          {isMounted && isLoggedIn && (
            <button onClick={handleSignOut} className="text-left text-orange-500 uppercase text-sm font-bold pt-4 border-t border-orange-900/20">Sign Out</button>
          )}
          {isMounted && !isLoggedIn && (
            <Link href="/login" onClick={() => setIsOpen(false)} className="text-left text-orange-500 uppercase text-sm font-bold pt-4 border-t border-orange-900/20">Log In</Link>
          )}
        </div>
      )}
    </header>
  );
}