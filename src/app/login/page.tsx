import Link from 'next/link';

export default function HomePage() {
  return (
    <main 
      className="relative min-h-screen flex flex-col items-center justify-center bg-black bg-cover bg-center text-center px-6"
      /* If you want a full-screen background image later, we will add it right here! */
    >
      {/* Dark overlay gradient to make sure your text is always perfectly readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black z-0"></div>

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center max-w-5xl mt-8">
        
        {/* Logo - Assuming your file is still named this! */}
        <img 
          src="/images/eol-full-logo.png" 
          alt="Embers of Light Logo" 
          className="w-full max-w-lg mb-10 rounded-xl shadow-[0_0_60px_rgba(255,100,0,0.2)]"
        />

        {/* Big Welcome Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 drop-shadow-lg tracking-tight">
          Welcome to the Hub
        </h1>

        {/* Website Overview / Pitch */}
        <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-3xl">
          Your exclusive sanctuary for the <span className="text-orange-400 font-semibold">Rise Radio Network</span>. 
          This is the dedicated zone for our premium supporters to catch live shows, unlock member-only content, and connect with the community.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 w-full justify-center mb-16">
          <Link 
            href="/login" 
            className="px-10 py-4 bg-orange-600 hover:bg-orange-700 text-white text-lg font-bold rounded-lg shadow-lg shadow-orange-500/30 transition transform hover:-translate-y-1"
          >
            Donator Sign In
          </Link>
          
          {/* This button will eventually link to your Stripe checkout */}
          <button 
            className="px-10 py-4 bg-black/50 backdrop-blur-sm border-2 border-orange-600 text-orange-500 hover:bg-orange-600 hover:text-white text-lg font-bold rounded-lg transition transform hover:-translate-y-1"
          >
            Become a Supporter
          </button>
        </div>

      </div>
    </main>
  );
}