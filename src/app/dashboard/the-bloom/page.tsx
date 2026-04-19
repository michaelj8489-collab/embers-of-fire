'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import MerchGallery from '@/components/MerchGallery';

const bloomProducts = [
  { id: 1, name: "Low Profile Baseball Cap", price: "$17.36", image: "https://images-api.printify.com/mockup/69cec66addebb5f8370786f2/104280/53890/the-bloom-low-profile-baseball-cap.jpg?camera_label=front&revision=1775159095182&s=2048", link: "https://embers-of-light.printify.me/product/27752482" },
  { id: 2, name: "Unisex Heavy Cotton Tee", price: "$31.35", image: "https://images-api.printify.com/mockup/69c3ee43f4a6bbf9820c5657/12100/92570/the-bloom-unisex-heavy-cotton-tee.jpg?camera_label=front&revision=1775077503615&s=2048", link: "https://embers-of-light.printify.me/product/27560397" },
  { id: 3, name: "Ceramic Mug (11oz, 15oz)", price: "$9.44", image: "https://images-api.printify.com/mockup/69c3ed039003cbb4a4052fdc/104692/101750/the-bloom-ceramic-mug-11oz-15oz.jpg?camera_label=front&revision=1775077354876&s=2048", link: "https://embers-of-light.printify.me/product/27560337" },
  { id: 4, name: "Cotton Canvas Tote Bag", price: "$18.68", image: "https://images-api.printify.com/mockup/69c3f631451dae57710f9abb/101409/93895/the-bloom-cotton-canvas-tote-bag.jpg?camera_label=front&revision=1775077686552&s=400", link: "https://embers-of-light.printify.me/product/27560885" },
  { id: 5, name: "Heavy Blend™ Hooded Sweatshirt", price: "$30.92", image: "https://images-api.printify.com/mockup/69c425bf7a696940f8027bf3/32912/98425/the-bloom-unisex-heavy-blend-hooded-sweatshirt.jpg?camera_label=back&revision=1775077355722&s=2048", link: "https://embers-of-light.printify.me/product/27564745" },
  { id: 6, name: "Artistic Rose Playing Cards", price: "$16.69", image: "https://images-api.printify.com/mockup/69c702d28ac9a0544a0eaf42/72763/16404/the-bloom-poker-playing-cards-artistic-rose-design-casino-deck.jpg?camera_label=front&revision=1775077509146&s=2048", link: "https://embers-of-light.printify.me/product/27610177" }
];

export default function TheBloomPage() {
  const [activeView, setActiveView] = useState<'archive' | 'live'>('archive');
  const [parentDomain, setParentDomain] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') { setParentDomain(window.location.hostname); }
  }, []);

  // Standard gradient divider
  const SectionDivider = () => (
    <div className="w-full h-px bg-gradient-to-r from-transparent via-orange-900/40 to-transparent my-12"></div>
  );

  return (
    <div 
      className="min-h-screen text-gray-200 flex flex-col relative bg-cover bg-center bg-fixed font-cormorant"
      style={{ backgroundImage: "url('/images/main-images/Cover Art/bloom-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/90 z-0 pointer-events-none fixed"></div>

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Header />

        <main className="flex-grow flex flex-col items-center pt-24 pb-12 px-4 w-full">
          <div className="w-full max-w-7xl mx-auto">
            
            {/* Nav Link */}
            <div className="mb-12">
              <Link href="/dashboard" className="text-orange-500 hover:text-orange-400 font-cinzel tracking-widest transition-colors flex items-center gap-2 w-fit uppercase text-sm font-bold">
                <span>←</span> BACK TO DASHBOARD
              </Link>
            </div>

            {/* Show Title */}
            <div className="text-center mb-8">
              <h1 className="font-cinzel-decorative font-bold text-center text-5xl md:text-7xl mb-4 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-200 to-orange-400">
                The Bloom
              </h1>
              <p className="font-cinzel text-xl text-orange-200/80 italic uppercase tracking-[0.3em]">
                Hosted by Rev. Diane R. DeBiasi
              </p>
            </div>

            <SectionDivider />

            {/* Player Section */}
            <div className="mb-12 relative">
              <div className="flex justify-center gap-4 mb-8">
                <button onClick={() => setActiveView('live')} className={`px-6 py-2 font-cinzel text-sm border transition-all rounded-full uppercase tracking-widest active:scale-95 ${activeView === 'live' ? 'border-orange-500 text-orange-500 bg-orange-500/10 shadow-[0_0_15px_rgba(234,88,12,0.3)]' : 'border-gray-600 text-gray-500'}`}>🔴 Live Stream</button>
                <button onClick={() => setActiveView('archive')} className={`px-6 py-2 font-cinzel text-sm border transition-all rounded-full uppercase tracking-widest active:scale-95 ${activeView === 'archive' ? 'border-orange-500 text-orange-500 bg-orange-500/10 shadow-[0_0_15px_rgba(234,88,12,0.3)]' : 'border-gray-600 text-gray-500'}`}>🎬 The Archives</button>
              </div>

              <div className="w-full border border-orange-900/50 rounded-xl overflow-hidden shadow-2xl bg-black relative md:h-[600px]">
                {activeView === 'live' ? (
                  <div className="flex flex-col md:flex-row w-full h-full">
                    <iframe src={`https://player.twitch.tv/?channel=riseradionetworks&parent=${parentDomain || 'embersoflight.net'}`} className="flex-grow h-full" frameBorder="0" allowFullScreen></iframe>
                    <iframe src={`https://www.twitch.tv/embed/riseradionetworks/chat?parent=${parentDomain || 'embersoflight.net'}&darkpopout`} className="w-full md:w-[350px] h-[400px] md:h-full border-t md:border-l border-orange-900/30" frameBorder="0"></iframe>
                  </div>
                ) : (
                  <div className="w-full h-full aspect-video">
                    <iframe src="https://www.youtube.com/embed/videoseries?list=PL5HonD7o0fAr54cEg5wGM5gCBmx5agBEW" className="w-full h-full" frameBorder="0" allowFullScreen></iframe>
                  </div>
                )}
              </div>
            </div>

            <SectionDivider />

            {/* Merch Gallery */}
            <MerchGallery showName="The Bloom" products={bloomProducts} />

            <SectionDivider />

            {/* Meet The Host & Bio Sections */}
            <section className="w-full mb-24">
              <h2 className="font-cinzel-decorative text-center text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 uppercase tracking-widest mb-12">
                Meet The Host
              </h2>

              {/* Part 1: (Diane Solo returned to top) */}
              <div className="flex flex-col md:flex-row items-center gap-12 mb-12">
                <div className="w-full md:w-1/2 relative aspect-video md:aspect-[4/3] rounded-2xl border border-orange-900/30 overflow-hidden shadow-[0_0_30px_rgba(234,88,12,0.15)]">
                  <img 
                    src="/images/jmc-edits-palettes/bloom-bio-pic.png" 
                    alt="Rev. Diane R. DeBiasi" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="w-full md:w-1/2 flex flex-col justify-center">
                  <h3 className="font-cinzel text-2xl text-orange-500 tracking-widest uppercase font-bold mb-6">Rev. Diane R. DeBiasi</h3>
                  <div className="font-cormorant text-xl text-gray-300 space-y-5 leading-relaxed">
                    <p>
                      Reverend Diane R. DeBiasi is a co-founder of Rise Awakenings Radio, a Self-Mastery Transformational Coach, Sekhem Seichim Reiki Master Teacher, and a fully ordained minister with The Alliance of Divine Love.
                    </p>
                    <p>
                      She is devoted to guiding individuals along their personal and spiritual growth journeys, sharing wisdom rooted in self-love, compassion, and the pursuit of the Greatest Degree of Love. 
                    </p>
                    <p>
                      Through her work, Rev. Diane teaches conscious self-awareness and emotional regulation, integrating modalities from psychology, metaphysics, and spirituality to support deep, lasting transformation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Part 2: (the-bloom.png at bottom with object-contain to prevent cutting off text) */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                <div className="w-full md:w-1/2 relative aspect-video md:aspect-[4/3] rounded-2xl border border-orange-900/30 overflow-hidden shadow-[0_0_30px_rgba(234,88,12,0.15)] bg-black/40">
                  <img 
                    src="/images/jmc-edits-palettes/the-bloom.png" 
                    alt="The Bloom Inspiration" 
                    className="w-full h-full object-contain" 
                  />
                </div>
                <div className="w-full md:w-1/2 flex flex-col justify-center">
                  <h3 className="font-cinzel text-2xl text-orange-500 tracking-widest uppercase font-bold mb-6">The Inspiration</h3>
                  <div className="font-cormorant text-xl text-gray-300 space-y-5 leading-relaxed">
                    <p>
                      <em className="text-orange-400 font-semibold italic">The Bloom</em> was inspired by the Healing Rose Sunday Circle—where timeless wisdom meets the realities of everyday life. 
                    </p>
                    <p>
                      Healing Rose, Affiliate Chapel 2349 of The Alliance of Divine Love, is a registered 501(c)(3) nonprofit organization dedicated to holistic healing and empowerment. 
                    </p>
                    <p className="italic text-orange-200/80">
                      Learn more about her mission and community work at <a href="https://healingrose.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-orange-400 transition-colors">healingrose.org</a>.
                    </p>
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