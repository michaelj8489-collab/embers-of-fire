import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-20 w-full bg-black/95 border-t border-orange-900/60 py-6 mt-auto shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      {/* 🚀 LAYOUT FIX: swaped to justify-between, items-end to push elements to opposite corners and align with text bottom */}
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-end gap-6 text-sm">
        
        {/* Network Info - CORNER LEFT */}
        <div className="text-gray-400 font-cormorant text-center md:text-left">
          &copy; {currentYear} <span className="text-orange-500 font-cinzel font-bold tracking-wider">Rise Radio Network</span>.<br className="md:hidden" /> All rights reserved.
        </div>

        {/* Designer Signature - CORNER RIGHT */}
        <div className="flex flex-col md:flex-row items-end gap-3">
          <span className="text-gray-400 font-cormorant italic pb-1">Proudly designed by</span>
          <div className="flex items-center gap-3 group cursor-default">
            {/* Logo Image */}
            <img 
              src="/images/crimson-leo.png" 
              alt="Crimson Leo Designs Logo" 
              className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(255,0,0,0.6)]"
            />
            {/* Designer Text using the Red/Purple colors from your logo */}
            <span className="font-cinzel font-bold text-lg tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-indigo-500 drop-shadow-sm group-hover:from-red-500 group-hover:to-indigo-400 transition-colors">
              Crimson Leo Designs
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}