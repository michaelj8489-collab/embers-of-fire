import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

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

            {/* Twitch Live Player */}
            <div className="mb-16">
              <h2 className="font-cinzel-decorative text-3xl font-bold text-center text-orange-500 mb-8 uppercase tracking-wider">
                Live Broadcast
              </h2>
              <div className="w-full aspect-video bg-black/80 border border-orange-900/50 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(234,88,12,0.15)] relative">
                <iframe
                  src="https://player.twitch.tv/?channel=brindlyzer&parent=localhost"
                  className="absolute top-0 left-0 w-full h-full"
                  frameBorder="0"
                  allowFullScreen={true}
                  scrolling="no"
                ></iframe>
              </div>
            </div>

            {/* YouTube VOD Playlist */}
            <div className="mb-16">
              <h2 className="font-cinzel-decorative text-3xl font-bold text-center text-orange-500 mb-8 uppercase tracking-wider">
                The Archives
              </h2>
              <div className="w-full aspect-video bg-black/80 border border-orange-900/50 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(234,88,12,0.15)] relative">
                <iframe 
                  src="https://www.youtube.com/embed/videoseries?list=PLKmO6Km32njSDRIYBDZcUbzqQFYQGmXIr" 
                  className="absolute top-0 left-0 w-full h-full"
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen={true}
                ></iframe>
              </div>
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}