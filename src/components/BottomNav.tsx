'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Radio, MessageSquare, ShieldCheck } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  // ALL FOUR NAV POINTS ARE HERE
  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Live', href: '/live', icon: Radio },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Sanctuary', href: '/sanctuary', icon: ShieldCheck }, 
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-black/95 border-t border-orange-900/50 backdrop-blur-md z-[100] pb-safe">
      <div className="flex justify-around items-center h-20 px-2">
        {navItems.map((item) => {
          // This highlights the button if you are on that page
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${
                isActive ? 'text-orange-500 scale-110' : 'text-gray-500'
              }`}
            >
              <div className="relative">
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-600 rounded-full blur-[2px] animate-pulse" />
                )}
              </div>
              <span className="font-cinzel text-[10px] uppercase tracking-widest mt-1 font-bold">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}