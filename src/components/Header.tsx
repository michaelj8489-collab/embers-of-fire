'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [userTier, setUserTier] = useState('seeker'); // Defaults to seeker

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setIsMounted(true);
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
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
    { name: "Defining Your Character", href: "/dashboard/defining-your-character" }
  ];

  return (
    <header className="fixed top-0 left-0 w-full border-b border-orange-900/50 bg-black/95 backdrop-blur-md z-[100]">
      <div className="w-full px-6 py-4 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center shrink-0">
          <span className="font-cinzel-decorative text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 drop-shadow-[0_0_8px_rgba(255,0,0,0.6)]">
            <span className="hidden sm:inline-block">Embers of Light</span>
            <span className="sm:hidden">EOL</span>
          </span>
        </Link>

        {/* DESKTOP NAVIGATION (Only visible if logged in) */}
        {isMounted && isLoggedIn && (
          <nav className="hidden lg:flex items-center gap-8">
            <div className="relative group">
              <button className="text-orange-500 font-cinzel font-bold uppercase tracking-widest hover:text-orange-400 transition-colors">
                Shows
              </button>
              <div className="absolute top-full left-0 mt-2 w-64 bg-black/90 border border-orange-900/50 backdrop-blur-md hidden group-hover:flex flex-col py-2 z-50">
                <Link href={`/sanctuary/${userTier}`} className="px-4 py-3 text-orange-400 font-cinzel text-sm uppercase tracking-widest hover:bg-orange-900/30 border-b border-orange-900/30">
                  My Sanctuary
                </Link>
                {shows.map((show) => (
                  <Link key={show.href} href={show.href} className="px-4 py-2 text-gray-300 hover:text-orange-400 hover:bg-orange-900/20 font-cinzel text-sm uppercase tracking-widest">
                    {show.name}
                  </Link>
                ))}
              </div>
            </div>
            <button onClick={handleSignOut} className="text-gray-300 font-cinzel text-sm uppercase tracking-widest hover:text-orange-400 hover:bg-orange-600/20 px-4 py-2 rounded transition-colors">
              Sign Out
            </button>
          </nav>
        )}

        {/* MOBILE HAMBURGER BUTTON */}
        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-orange-500 p-2">
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {isOpen && (
        <div className="lg:hidden bg-black/95 border-b border-orange-900/50 px-6 py-4 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
          {isMounted && isLoggedIn && (
            <>
              <Link href={`/sanctuary/${userTier}`} onClick={() => setIsOpen(false)} className="text-orange-400 font-bold uppercase text-sm tracking-widest border-b border-orange-900/30 pb-4 font-cinzel">
                My Sanctuary
              </Link>
              {shows.map((show) => (
                <Link key={show.href} href={show.href} onClick={() => setIsOpen(false)} className="text-gray-300 uppercase text-sm tracking-widest block font-cinzel py-2">
                  {show.name}
                </Link>
              ))}
              <button onClick={() => { setIsOpen(false); handleSignOut(); }} className="text-left text-gray-300 uppercase text-sm font-cinzel tracking-widest pt-4 border-t border-orange-900/20">
                Sign Out
              </button>
            </>
          )}

          {/* MOBILE LOG IN BUTTON - FIXED FONT */}
          {isMounted && !isLoggedIn && (
            <Link href="/login" onClick={() => setIsOpen(false)} className="text-left text-orange-500 uppercase text-sm font-bold font-cinzel pt-4 border-t border-orange-900/20">
              Log In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}