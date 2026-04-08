'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // 1. Check if they are already logged in when the page loads
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    checkUser();

    // 2. Listen for any login/logout events in real-time
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsLoggedIn(!!session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login'); // Boot them back to the login page
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
          <span className="font-cinzel text-xl md:text-2xl font-bold text-orange-500 tracking-wider group-hover:text-orange-400 transition-colors">
            EMBERS OF LIGHT
          </span>
        </Link>
      </div>

      {/* Right Side: Dynamic Auth Button */}
      <div>
        {isLoggedIn ? (
          <button 
            onClick={handleSignOut}
            className="border border-orange-600 text-orange-500 hover:bg-orange-600 hover:text-white px-6 py-2 rounded transition-all font-cinzel font-bold tracking-widest"
          >
            SIGN OUT
          </button>
        ) : (
          <Link 
            href="/login"
            className="border border-orange-600 text-orange-500 hover:bg-orange-600 hover:text-white px-6 py-2 rounded transition-all font-cinzel font-bold tracking-widest inline-block"
          >
            SIGN IN
          </Link>
        )}
      </div>
      
    </header>
  );
}