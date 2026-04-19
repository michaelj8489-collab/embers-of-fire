import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-20 w-full bg-black/95 border-t border-orange-900/60 py-4 md:py-8 mt-auto shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      
      {/* 🚀 FORCED HORIZONTAL: Removed flex-col, locked into flex-row with tight padding */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 md:px-12 flex flex-row justify-between items-center gap-2">
        
        {/* Network Info - Forced Left & Tiny */}
        <div className="text-gray-400 font-cormorant text-left flex items-center shrink min-w-0">
          <p className="text-[9px] sm:text-xs md:text-sm leading-tight truncate">
            &copy; {currentYear} <span className="text-orange-500 font-cinzel font-bold tracking-tighter sm:tracking-wider">EMBERS OF LIGHT</span>. <span className="hidden sm:inline">All rights reserved.</span>
          </p>
        </div>

        {/* Designer Signature - Forced Right & Tiny */}
        <div className="flex flex-row items-center gap-1 sm:gap-4 shrink-0">
          <span className="text-gray-400 font-cormorant italic text-[9px] sm:text-xs md:text-sm hidden xxs:inline">
            Designed by
          </span>
          
          <div className="flex flex-row items-center gap-1 sm:gap-3 group cursor-default">
            {/* Logo Image - Shrunk to 16px (w-4) on mobile */}
            <img 
              src="/images/crimson-leo.png" 
              alt="Crimson Leo Designs Logo" 
              className="w-4 h-4 sm:w-8 sm:h-8 md:w-10 md:h-10 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(255,0,0,0.6)]"
            />
            {/* Designer Text - Forced to never wrap */}
            <span className="font-cinzel font-bold text-[9px] sm:text-sm md:text-lg tracking-tighter sm:tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-indigo-500 drop-shadow-sm group-hover:from-red-500 group-hover:to-indigo-400 transition-colors whitespace-nowrap">
              Crimson Leo Designs
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}