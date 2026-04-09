'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSanctuaryOpen, setIsSanctuaryOpen] = useState(false);
  const [isRiseOpen, setIsRiseOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="w-full border-b border-orange-900/50 bg-black/80 backdrop-blur-md p-4 flex items-center justify-between sticky top-0 z-50">
      
      {/* Left Side: Logo & Title */}
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-4 group">
          <img 
            src="/images/rise-radio-logo.png" 
            alt="Rise Radio Logo" 
            className="h-12 w-12 rounded-full object-cover border border-orange-900/50 group-hover:border-orange-500 transition-colors"
          />
          <span className="font-cinzel text-xl md:text-2xl font-bold text-orange-500 tracking-wider group-hover:text-orange-400 transition-colors uppercase">
            Embers of Light
          </span>
        </Link>
      </div>

      {/* Center Navigation: Dropdowns */}
      <nav className="hidden md:flex items-center gap-8">
        
        {/* Sanctuary Dropdown */}
        <div 
          className="relative py-2" 
          onMouseEnter={() => setIsSanctuaryOpen(true)} 
          onMouseLeave={() => setIsSanctuaryOpen(false)}
        >
          <button className="font-cinzel text-orange-400 hover:text-orange-300 transition-colors uppercase tracking-widest flex items-center gap-1">
            The Sanctuary ▾
          </button>
          
          {isSanctuaryOpen && (
            <div className="absolute top-full left-0 w-56 bg-black/95 border border-orange-900/50 backdrop-blur-2xl p-2 rounded-b-lg flex flex-col gap-1 shadow-2xl">
              <Link href="/dashboard/sanctuary" className="text-gray-400 hover:text-white hover:bg-orange-900/30 p-2 rounded transition-all text-sm uppercase tracking-tighter">Sanctuary Hub</Link>
              <div className="h-px bg-orange-900/30 my-1"></div>
              <Link href="/dashboard/sanctuary/the-bloom" className="text-gray-300 hover:text-orange-400 p-2 rounded text-sm uppercase">The Bloom</Link>
              <Link href="/dashboard/sanctuary/the-messengers" className="text-gray-300 hover:text-orange-400 p-2 rounded text-sm uppercase">The Messengers</Link>
              <Link href="/dashboard/sanctuary/brindles-vision" className="text-gray-300 hover:text-orange-400 p-2 rounded text-sm uppercase">Brindle's Vision</Link>
              <Link href="/dashboard/sanctuary/phoenix-talks" className="text-gray-300 hover:text-orange-400 p-2 rounded text-sm uppercase">Phoenix Talks</Link>
              <Link href="/dashboard/sanctuary/the-core" className="text-gray-300 hover:text-orange-400 p-2 rounded text-sm uppercase">The CORE</Link>
              <Link href="/dashboard/sanctuary/illuminate" className="text-gray-300 hover:text-orange-400 p-2 rounded text-sm uppercase">Illuminate</Link>
            </div>
          )}
        </div>

        {/* RISE Dropdown */}
        <div 
          className="relative py-2" 
          onMouseEnter={() => setIsRiseOpen(true)} 
          onMouseLeave={() => setIsRiseOpen(false)}
        >
          <button className="font-cinzel text-red-500 hover:text-red-400 transition-colors uppercase tracking-widest flex items-center gap-1">
            Rise Radio ▾
          </button>
          
          {isRiseOpen && (
            <div className="absolute top-full left-0 w-56 bg-black/95 border border-red-900/50 backdrop-blur-2xl p-2 rounded-b-lg flex flex-col gap-1 shadow-2xl">
              <Link href="/dashboard/rise-hub" className="text-gray-400 hover:text-white hover:bg-red-900/30 p-2 rounded transition-all text-sm uppercase tracking-tighter">Rise Hub</Link>
              <div className="h-px bg-red-900/30 my-1"></div>
              <Link href="/dashboard/rise-hub/honky-tonk-heaven" className="text-gray-300 hover:text-red-500 p-2 rounded text-sm uppercase">Honky Tonk Heaven</Link>
              <Link href="/dashboard/rise-hub/voices-on-the-rise" className="text-gray-300 hover:text-red-500 p-2 rounded text-sm uppercase">Voices on the Rise</Link>
              <div className="h-px bg-red-900/30 my-1"></div>
              <Link href="/dashboard/rise-hub/submissions" className="bg-red-900/40 text-red-400 border border-red-500/50 hover:bg-red-600 hover:text-white p-2 rounded text-center text-xs font-bold transition-all uppercase tracking-widest">
                Submit Song
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Right Side: Dynamic Auth Button */}
      <div>
        {isLoggedIn ? (
          <button 
            onClick={handleSignOut}
            className="border border-orange-600 text-orange-500 hover:bg-orange-600 hover:text-white px-4 md:px-6 py-2 rounded transition-all font-cinzel font-bold tracking-widest text-sm"
          >
            SIGN OUT
          </button>
        ) : (
          <Link 
            href="/login"
            className="border border-orange-600 text-orange-500 hover:bg-orange-600 hover:text-white px-4 md:px-6 py-2 rounded transition-all font-cinzel font-bold tracking-widest text-sm inline-block"
          >
            SIGN IN
          </Link>
        )}
      </div>
    </header>
  );
}