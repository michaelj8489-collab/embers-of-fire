'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// Use your standard icons - I'm using common ones, but keep yours if they are different!
import { Home, Radio, MessageSquare, ShieldCheck } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Live', href: '/live', icon: Radio },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Sanctuary', href: '/sanctuary', icon: ShieldCheck }, // FIXED: Points to /sanctuary
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-black/90 border-t border-orange-900/50 backdrop-blur-lg pb-safe z-[100]">
      <div className="flex justify-around items-center h-20 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-all ${
                isActive ? 'text-orange-500 scale-110' : 'text-gray-500 hover:text-orange-300'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="font-cinzel text-[10px] uppercase tracking-widest font-bold">
                {item.name}
              </span>
              {isActive && (
                <div className="absolute -top-1 w-1 h-1 bg-orange-500 rounded-full shadow-[0_0_8px_#ea580c]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}