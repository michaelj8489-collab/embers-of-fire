import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-20 w-full bg-black/95 border-t border-orange-900/60 py-6 mt-auto shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      
      {/* 🚀 FIXED: Changed max-w-7xl to max-w-full and added larger side padding (px-12) */}
      <div className="w-full max-w-full px-12 flex flex-col md:flex-row justify-between items-center md:items-end gap-6 text-sm">
        
        {/* Network Info - FAR LEFT */}
        <div className="text-gray-400 font-cormorant text-center md:text-left">
          &copy; {currentYear} <span className="text-orange-500 font-cinzel font-bold tracking-wider">Rise Radio Network</span>.<br className="md:hidden" /> All rights reserved.
        </div>

        {/* Designer Signature - FAR RIGHT */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-3">
          <span className="text-gray-400 font-cormorant italic pb-1">Proudly designed by</span>
          <div className="flex items-center gap-3 group cursor-default">
            {/* Logo Image */}
            <img 
              src="/images/crimson-leo.png" 
              alt="Crimson Leo Designs Logo" 
              className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(255,0,0,0.6)]"
            />
            {/* Designer Text */}
            <span className="font-cinzel font-bold text-lg tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-indigo-500 drop-shadow-sm group-hover:from-red-500 group-hover:to-indigo-400 transition-colors">
              Crimson Leo Designs
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}