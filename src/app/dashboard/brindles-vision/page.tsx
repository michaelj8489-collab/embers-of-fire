import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
export const dynamic = 'force-dynamic';

export default function BrindlesVisionPage() {
  return (
    <div 
      className="min-h-screen text-gray-200 flex flex-col relative bg-cover bg-center bg-fixed font-cormorant" 
      style={{ backgroundImage: "url('/images/main-images/Cover Art/Brindle’s Vision.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/90 z-0 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Header />

        <main className="flex-grow flex flex-col items-center pt-24 pb-12 px-4 w-full">
          <div className="w-full max-w-5xl">
            
            {/* Back Button */}
            <div className="mb-8">
              <Link href="/dashboard" className="text-orange-500 hover:text-orange-400 font-cinzel tracking-widest transition-colors flex items-center gap-2 w-fit">
                <span>←</span> BACK TO SANCTUARY
              </Link>
            </div>

            {/* Show Title */}
            <div className="text-center mb-16 border-b border-orange-900/50 pb-8">
              <h1 className="font-cinzel-decorative font-bold text-center text-5xl md:text-7xl mb-4 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
                Brindle's Vision
              </h1>
              <p className="font-cinzel text-xl text-orange-200/80 italic">
                Tune into the frequency.
              </p>
            </div>

            {/* Twitch Live Player with Placeholder Background */}
            <div className="mb-16 relative">
              <h2 className="font-cinzel-decorative text-3xl font-bold text-center text-orange-500 mb-8 uppercase tracking-wider relative z-10">
                Live Broadcast
              </h2>
              
              <div 
                className="w-full aspect-video bg-black border border-orange-900/50 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(234,88,12,0.15)] bg-cover bg-center flex items-center justify-center relative z-20"
                style={{ backgroundImage: "url('/images/jmc-edits-palettes/show-offline-placeholder.png')" }}
              >
                <iframe
                 src="https://player.twitch.tv/?channel=brindlyzer&parent=localhost&parent=embers-of-fire.vercel.app&muted=true&autoplay=false"
                  className="absolute top-0 left-0 w-full h-full z-30"
                  frameBorder="0"
                  allowFullScreen={true}
                  scrolling="no"
                  style={{ background: 'transparent' }}
                ></iframe>
              </div>
            </div>

        {/* --- MEET THE HOST SECTION --- */}
      <section className="w-full max-w-6xl mx-auto px-6 mt-20 mb-24 text-center relative z-10">
        
        {/* Header & Line */}
        <h2 className="font-cinzel-decorative text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 uppercase tracking-widest mb-6">
          Meet The Host
        </h2>
        <div className="w-32 h-px bg-gradient-to-r from-transparent via-orange-900/60 to-transparent mx-auto mb-16"></div>

        {/* Main Layout Container */}
        <div className="grid grid-cols-1 md:grid-cols-[300px_1px_1fr] items-center gap-10 md:gap-16 bg-black/60 backdrop-blur-sm p-8 md:p-12 rounded-2xl border border-orange-900/30 shadow-2xl">
          
          {/* Host Photo & Name */}
          <div className="flex flex-col items-center">
            <div className="relative w-[280px] h-[350px] rounded-lg border border-orange-900/40 overflow-hidden shadow-[0_0_20px_rgba(234,88,12,0.1)]">
              <img
                src="/images/brindle-bio.JPG" 
                alt="Michka Grant - Brindle's Vision Host"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-in-out"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent"></div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-cinzel text-2xl text-orange-500 tracking-widest uppercase font-bold">
                Michka Grant
              </h3>
              <p className="font-cormorant text-gray-400 italic text-lg">
                RISE Co-Founder & Host
              </p>
            </div>
          </div>

          {/* Lines for Desktop/Mobile */}
          <div className="hidden md:block w-px h-full min-h-[300px] bg-gradient-to-b from-transparent via-orange-900/40 to-transparent"></div>
          <div className="block md:hidden w-full h-px bg-gradient-to-r from-transparent via-orange-900/40 to-transparent my-4"></div>

          {/* Biography Text */}
          <div className="text-left flex flex-col justify-center">
            <div className="relative">
              <span className="absolute -top-10 -left-6 text-8xl font-serif text-orange-900/20 pointer-events-none">“</span>
              
              <p className="font-cormorant text-xl md:text-2xl text-gray-200 leading-relaxed italic relative z-10">
                Michka Grant is the heartbeat of Rise Radio. As a co-founder and the visionary behind Brindle’s Vision, Michka utilizes his deep understanding of frequency and performance to curate an inclusive sanctuary for emerging and established talent. 
                <br /><br />
                His mission is to fuel the connection between singer and listener, building an awareness-driven community one broadcast at a time.
              </p>
              
              <span className="absolute -bottom-16 -right-4 text-8xl font-serif text-orange-900/20 pointer-events-none">”</span>
            </div>
          </div>
        </div>
      </section>

          </div>
        </main> 
        <Footer />
      </div>
    </div>
  );
}