import Link from 'next/link';
import Header from '@/components/Header';

export default function LoginPage() {
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden text-center bg-black">
      
      {/* 🎬 Consistent Video Background */}
      <video autoPlay muted loop playsInline className="fixed top-24 left-0 w-full h-[calc(100vh-6rem)] object-cover object-top z-0 opacity-50">
        <source src="/images/eol-moving-background.mp4" type="video/mp4" />
      </video>
      
      {/* 🌑 Dark Overlay */}
      <div className="fixed top-24 left-0 w-full h-[calc(100vh-6rem)] bg-black/70 z-10"></div>

      {/* 🔝 Solid Navigation Header */}
      <Header />

      {/* 🔐 Login Box Wrapper */}
      <div className="relative z-20 w-full max-w-md px-8 py-12 bg-black/80 backdrop-blur-md rounded-2xl border border-orange-900/50 shadow-[0_0_50px_rgba(255,100,0,0.15)] mt-12">
        
        {/* Title */}
        <h1 className="text-4xl font-cinzel-dec font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-4 tracking-wider drop-shadow-md">
          Sign In
        </h1>
        <p className="text-xl font-cormorant text-gray-300 mb-8 italic">
          Welcome back to the sanctuary.
        </p>

        {/* Form Fields */}
        <form className="flex flex-col gap-6">
          <div className="text-left">
            <label className="block text-orange-400 font-cinzel font-bold tracking-widest text-sm mb-2">Email</label>
            <input 
              type="email" 
              className="w-full bg-black/50 border border-orange-900/50 rounded-lg px-4 py-3 text-gray-100 font-cormorant text-lg focus:outline-none focus:border-orange-500 transition shadow-inner"
              placeholder="Enter your email"
            />
          </div>
          <div className="text-left">
            <label className="block text-orange-400 font-cinzel font-bold tracking-widest text-sm mb-2">Password</label>
            <input 
              type="password" 
              className="w-full bg-black/50 border border-orange-900/50 rounded-lg px-4 py-3 text-gray-100 font-cormorant text-lg focus:outline-none focus:border-orange-500 transition shadow-inner"
              placeholder="Enter your password"
            />
          </div>

          <button type="button" className="w-full mt-4 py-4 bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-500 hover:to-red-600 text-white text-xl font-cinzel font-bold rounded-lg shadow-[0_0_20px_rgba(255,100,0,0.3)] transition transform hover:-translate-y-1">
            Enter the Hub
          </button>
        </form>

        <p className="mt-8 text-gray-400 font-cormorant text-lg">
          Need access? 
          <Link href="/" className="text-orange-500 hover:text-orange-400 font-cinzel font-bold ml-2 transition tracking-wider">
            View Tiers
          </Link>
        </p>
      </div>
    </main>
  );
}