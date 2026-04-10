'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Updated array to include ALL missing shows
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
    <header className="w-full border-b border-orange-900/50 bg-black/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* Left Side: Logo (RETAINED) */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <img src="/images/rise-radio-logo.png" alt="Logo" className="h-10 w-10 rounded-full border border-orange-500" />
          <span className="font-cinzel text-lg font-bold text-orange-500 uppercase tracking-tighter">Embers of Light</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6">
          <div className="relative group">
            <button className="font-cinzel text-gray-300 hover:text-orange-400 uppercase tracking-widest text-sm flex items-center gap-1">
              Shows ▾
            </button>
            {/* The Dropdown Menu */}
            <div className="absolute top-full left-0 w-64 bg-black border border-orange-900/50 p-2 hidden group-hover:flex flex-col gap-1 shadow-2xl">
              {shows.map((show) => (
                <Link key={show.href} href={show.href} className="text-gray-400 hover:text-orange-400 p-2 text-xs uppercase tracking-widest transition-colors">
                  {show.name}
                </Link>
              ))}
            </div>
          </div>
          
          {/* DYC Standout Link */}
          <Link href="/dashboard/defining-your-character" className="font-cinzel text-red-500 text-sm uppercase tracking-widest">DYC (Coming Soon)</Link>
          
          {/* Sign Out Button (RETAINED) */}
          <button onClick={handleSignOut} className="border border-orange-600 text-orange-500 px-4 py-1 rounded text-xs font-cinzel hover:bg-orange-600 hover:text-white transition-all">
            SIGN OUT
          </button>
        </nav>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-orange-500">
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-black border-t border-orange-900/50 p-4 flex flex-col gap-4">
          {shows.map((show) => (
            <Link key={show.href} href={show.href} onClick={() => setIsOpen(false)} className="text-gray-300 uppercase text-sm tracking-widest">{show.name}</Link>
          ))}
          <button onClick={handleSignOut} className="text-left text-orange-500 uppercase text-sm font-bold">Sign Out</button>
        </div>
      )}
    </header>
  );
}