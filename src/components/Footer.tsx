import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-20 w-full bg-black/95 border-t border-orange-900/60 py-8 md:py-10 mt-auto shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      
      {/* 🚀 FIXED: Mobile-first padding (px-4) prevents the "squish" effect */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-6 text-sm">
        
        {/* Network Info - Stacked & Centered on Mobile, Left on Desktop */}
        <div className="text-gray-400 font-cormorant text-center md:text-left flex items-center justify-center w-full md:w-auto">
          <p className="leading-relaxed md:leading-none">
            &copy; {currentYear} <span className="text-orange-500 font-cinzel font-bold tracking-wider block sm:inline mt-1 sm:mt-0">EMBERS OF LIGHT</span>. <span className="block sm:inline">All rights reserved.</span>
          </p>
        </div>

        {/* Designer Signature - Stacked & Centered on Mobile, Right on Desktop */}
        <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-4 w-full md:w-auto">
          <span className="text-gray-400 font-cormorant italic text-xs sm:text-sm">Proudly designed by</span>
          
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 group cursor-default mt-2 lg:mt-0">
            {/* Logo Image - Scales slightly down on mobile */}
            <img 
              src="/images/crimson-leo.png" 
              alt="Crimson Leo Designs Logo" 
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(255,0,0,0.6)]"
            />
            {/* Designer Text */}
            <span className="font-cinzel font-bold text-base sm:text-lg tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-indigo-500 drop-shadow-sm group-hover:from-red-500 group-hover:to-indigo-400 transition-colors text-center">
              Crimson Leo Designs
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}