import Link from 'next/link';

export default function Header() {
  return (
    <nav className="fixed top-0 left-0 w-full h-24 bg-black border-b border-orange-900/60 shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-50 px-8 flex items-center justify-between">
      
      {/* Founders & Network Name - TOP LEFT */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full border-2 border-orange-500 overflow-hidden shadow-[0_0_15px_rgba(255,100,0,0.3)] bg-black">
          <video autoPlay muted loop playsInline className="w-full h-full object-cover">
            <source src="/images/eol-moving-background.mp4" type="video/mp4" />
          </video>
        </div>
        <span className="font-cinzel text-3xl font-bold text-orange-400 tracking-wider drop-shadow-md">
          Rise Radio Network
        </span>
      </div>

      {/* Sign In Button - TOP RIGHT */}
      <Link href="/login" className="px-6 py-2 border-2 border-orange-600 hover:bg-orange-600 text-orange-100 hover:text-white font-cinzel text-lg font-bold rounded-lg transition shadow-[0_0_15px_rgba(255,100,0,0.1)]">
        Sign In
      </Link>

    </nav>
  );
}