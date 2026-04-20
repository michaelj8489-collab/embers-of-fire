'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Radio, MessageSquare, ShieldCheck } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-black/95 border-t border-orange-900/50 backdrop-blur-md z-[100] pb-safe">
      <div className="flex justify-around items-center h-20 px-2">
        
        <Link href="/" className={`flex flex-col items-center gap-1 ${pathname === '/' ? 'text-orange-500' : 'text-gray-500'}`}>
          <Home size={24} />
          <span className="font-cinzel text-[10px] uppercase tracking-widest font-bold">Home</span>
        </Link>

        <Link href="/live" className={`flex flex-col items-center gap-1 ${pathname === '/live' ? 'text-orange-500' : 'text-gray-500'}`}>
          <Radio size={24} />
          <span className="font-cinzel text-[10px] uppercase tracking-widest font-bold">Live</span>
        </Link>

        <Link href="/chat" className={`flex flex-col items-center gap-1 ${pathname === '/chat' ? 'text-orange-500' : 'text-gray-500'}`}>
          <MessageSquare size={24} />
          <span className="font-cinzel text-[10px] uppercase tracking-widest font-bold">Chat</span>
        </Link>

        {/* THE SANCTUARY LINK - HARDCODED FOR NO FAILURES */}
        <Link href="/sanctuary" className={`flex flex-col items-center gap-1 ${pathname === '/sanctuary' ? 'text-orange-500' : 'text-gray-500'}`}>
          <ShieldCheck size={24} />
          <span className="font-cinzel text-[10px] uppercase tracking-widest font-bold">Sanctuary</span>
        </Link>

      </div>
    </nav>
  );
}