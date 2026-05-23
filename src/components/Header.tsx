/* eslint-disable */
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false); // Main Mobile Menu
  const [showsOpen, setShowsOpen] = useState(false); // Shows Dropdown Toggle
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [userTier, setUserTier] = useState('seeker');
  const [isAdmin, setIsAdmin] = useState(false); // <-- NEW ADMIN STATE

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setIsMounted(true);
    
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      
      // <-- NEW: Check Database for Tier and Admin Role in one swoop
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier, role')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          if (profile.subscription_tier) setUserTier(profile.subscription_tier);
          if (profile.role === 'admin') setIsAdmin(true);
        }
      }
    };
    
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
      if (event === 'SIGNED_IN') {
        checkUser();
      }
      if (event === 'SIGNED_OUT') {
        setIsAdmin(false); // Reset admin status on logout
        setUserTier('seeker'); // Reset tier on logout
      }
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [supabase]);

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
    { name: "Defining Your Character", href: "/dashboard/defining-your-character" },
    { name: "Mystic Mist", href: "/dashboard/mystic-mist" }
  ];

  return (
    <header className="fixed top-0 left-0 w-full border-b border-orange-900/50 bg-black/95 backdrop-blur-md z-[100]">
      <div className="w-full px-8 py-4 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center shrink-0">
          <span className="font-cinzel text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 drop-shadow-[0_0_8px_rgba(255,0,0,0.6)] uppercase tracking-[0.2em]">
            <span className="hidden sm:inline-block">Embers of Light</span>
            <span className="sm:hidden">EOL</span>
          </span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden lg:flex items-center gap-10">
          {isMounted && isLoggedIn ? (
            <>
              {/* NEW DESKTOP ADMIN LINK */}
              {/* NEW DESKTOP ADMIN LINK */}
              {isAdmin && (
                 <Link href="/dashboard/admin" className="text-orange-500 font-cinzel font-bold text-sm uppercase tracking-[0.2em] hover:text-orange-400 transition-colors drop-shadow-[0_0_8px_rgba(234,88,12,0.4)]">
                   Admin Dashboard
                 </Link>
)}

              <Link href="/chat" className="text-gray-300 font-cinzel text-sm uppercase tracking-[0.2em] hover:text-orange-500 transition-colors">
                Chat
              </Link>

              <div className="relative">
                <button 
                  onClick={() => setShowsOpen(!showsOpen)}
                  className="text-orange-500 font-cinzel font-bold uppercase tracking-[0.2em] hover:text-orange-400 transition-colors flex items-center gap-2"
                >
                  Shows <span className={`transition-transform duration-300 ${showsOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>
                
                {showsOpen && (
                  <div className="absolute top-full right-0 mt-4 w-64 bg-black/95 border border-orange-900/50 backdrop-blur-xl flex flex-col py-2 z-50 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
                    <Link 
                      href="/dashboard" 
                      onClick={() => setShowsOpen(false)}
                      className="px-4 py-3 text-orange-400 font-cinzel text-sm font-bold uppercase tracking-widest hover:bg-orange-900/30 border-b border-orange-900/30"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href={`/sanctuary/${userTier}`} 
                      onClick={() => setShowsOpen(false)}
                      className="px-4 py-3 text-orange-400 font-cinzel text-sm uppercase tracking-widest hover:bg-orange-900/30 border-b border-orange-900/30"
                    >
                      My Sanctuary
                    </Link>
                    {shows.map((show) => (
                      <Link 
                        key={show.href} 
                        href={show.href} 
                        onClick={() => setShowsOpen(false)}
                        className="px-4 py-2 text-gray-300 hover:text-orange-400 hover:bg-orange-900/20 font-cinzel text-sm uppercase tracking-widest"
                      >
                        {show.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              
              <button onClick={handleSignOut} className="text-gray-300 font-cinzel text-sm uppercase tracking-[0.2em] hover:text-orange-400 hover:bg-orange-600/20 px-4 py-2 rounded transition-colors">
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/login" className="text-orange-500 font-cinzel font-bold uppercase text-sm tracking-[0.3em] hover:text-orange-400 transition-colors">
              Log In
            </Link>
          )}
        </nav>

        {/* MOBILE HAMBURGER BUTTON */}
        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-orange-500 p-2 text-2xl">
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {isOpen && (
        <div className="lg:hidden bg-black/95 border-b border-orange-900/50 px-8 py-6 flex flex-col gap-6 max-h-[85vh] overflow-y-auto shadow-2xl">
          {isMounted && isLoggedIn ? (
            <>
             {/* NEW MOBILE ADMIN LINK */}
{isAdmin && (
  <Link href="/dashboard/admin" onClick={() => setIsOpen(false)} className="text-orange-500 font-bold uppercase text-sm tracking-widest border-b border-orange-900/30 pb-4 font-cinzel drop-shadow-[0_0_8px_rgba(234,88,12,0.4)]">
    Admin Dashboard
  </Link>
)}

              <Link href="/dashboard" onClick={() => setIsOpen(false)} className="text-orange-400 font-bold uppercase text-sm tracking-widest border-b border-orange-900/30 pb-4 font-cinzel">
                Dashboard
              </Link>
              
              <Link href={`/sanctuary/${userTier}`} onClick={() => setIsOpen(false)} className="text-orange-400 font-bold uppercase text-sm tracking-widest border-b border-orange-900/30 pb-4 font-cinzel">
                My Sanctuary
              </Link>

              <Link href="/chat" onClick={() => setIsOpen(false)} className="text-gray-300 uppercase text-sm tracking-widest font-cinzel">
                Chat Sanctuary
              </Link>
              
              <button 
                onClick={() => setShowsOpen(!showsOpen)}
                className="text-orange-500 font-cinzel font-bold uppercase text-sm tracking-widest flex items-center justify-between"
              >
                <span>Shows</span>
                <span className={`transition-transform duration-300 ${showsOpen ? 'rotate-180' : ''}`}>▾</span>
              </button>
              
              {showsOpen && (
                <div className="flex flex-col gap-4 pl-4 border-l border-orange-900/30">
                  {shows.map((show) => (
                    <Link 
                      key={show.href} 
                      href={show.href} 
                      onClick={() => {setIsOpen(false); setShowsOpen(false);}} 
                      className="text-gray-300 uppercase text-sm tracking-widest block font-cinzel"
                    >
                      {show.name}
                    </Link>
                  ))}
                </div>
              )}

              <button onClick={() => { setIsOpen(false); setShowsOpen(false); handleSignOut(); }} className="text-left text-gray-400 uppercase text-sm font-cinzel tracking-widest pt-4 border-t border-orange-900/20">
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setIsOpen(false)} className="text-left text-orange-500 uppercase text-sm font-bold font-cinzel pt-4 border-t border-orange-900/20 tracking-widest">
              Log In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}