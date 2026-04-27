import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-20 w-full bg-black/95 border-t border-orange-900/60 mt-auto shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      
      {/* --- UPPER FOOTER: The Responsive Links Grid --- */}
      <div className="w-full max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-center md:text-left font-cormorant text-gray-400">
          
          {/* Column 1: Brand Info */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <h3 className="text-2xl font-cinzel text-orange-500 tracking-widest">RISE RADIO</h3>
            <p className="text-sm md:text-base italic">
              Igniting the spark. Fueling the journey.
            </p>
          </div>

          {/* Column 2: Sanctuary Links */}
          <div className="flex flex-col space-y-3">
            <h4 className="font-cinzel text-white tracking-widest uppercase border-b border-orange-900/30 pb-2 mb-2 inline-block">
              The Sanctuary
            </h4>
            <Link href="/" className="hover:text-orange-400 transition-colors duration-300">Home</Link>
            {/* 🚀 UPDATED LINK: Now points directly to your Dashboard Show Calendar */}
            <Link href="/dashboard" className="hover:text-orange-400 transition-colors duration-300">Show Calendar</Link>
            <Link href="/login" className="hover:text-orange-400 transition-colors duration-300">Patron Login</Link>
          </div>

          {/* Column 3: Social Media & Platforms */}
          <div className="flex flex-col space-y-3">
            <h4 className="font-cinzel text-white tracking-widest uppercase border-b border-orange-900/30 pb-2 mb-2 inline-block">
              Connect
            </h4>
            <a href="https://www.facebook.com/profile.php?id=61578647787283" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors duration-300">Embers of Light Facebook</a>
            <a href="https://www.facebook.com/groups/riseawakenings" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors duration-300">Rise Awakenings Facebook</a>
            <a href="https://www.youtube.com/@EmbersOfLight1111" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors duration-300">EOL YouTube</a>
            <a href="https://lnk.bio/embers_of_light?fbclid=IwY2xjawRcZ4dleHRuA2FlbQIxMABicmlkETFQVlFJUDdvbXM5WGVseGJ5c3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHryIDMNmBh5Xe3M9nTvf5aFx23XhIHK6G6pIqas6fl5C2vapWNLQynDE9-_B_aem_oakVqv4TJ7zaBn_3RM94bw" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors duration-300">lnk.bio for podcasts</a>
          </div>

          {/* Column 4: Hosts & Affiliates */}
          <div className="flex flex-col space-y-3">
            <h4 className="font-cinzel text-white tracking-widest uppercase border-b border-orange-900/30 pb-2 mb-2 inline-block">
              Host Websites
            </h4>
            <a href="https://www.lnk.bio/brindlewolf" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors duration-300">Brindle Wolf</a>
            <a href="https://lnk.bio/lunaria555" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors duration-300">Lunaria's Space</a>
            <a href="https://www.healingrose.org/" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors duration-300">Rev Diane R. Dibiasi</a>
          </div>

        </div>
      </div>

      {/* --- LOWER FOOTER: Your Exact Bottom Bar Code --- */}
      <div className="border-t border-orange-900/40 py-4 md:py-6">
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
      </div>
      
    </footer>
  );
}