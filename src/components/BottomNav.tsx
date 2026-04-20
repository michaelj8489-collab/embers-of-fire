'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Radio, MessageSquare, ShieldCheck } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Live', href: '/live', icon: Radio },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Sanctuary', href: '/sanctuary', icon: ShieldCheck },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 border-t border-orange-900/30 backdrop-blur-lg md:hidden">
      <div className="flex items-center justify-around h-20 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive ? 'text-orange-500' : 'text-gray-500 hover:text-orange-400'
              }`}
            >
              <Icon size={24} className={isActive ? 'animate-pulse' : ''} />
              <span className="text-[10px] uppercase font-cinzel mt-1 tracking-tighter">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}