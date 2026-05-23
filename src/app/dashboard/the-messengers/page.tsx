/* eslint-disable */
'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import MerchGallery from '@/components/MerchGallery';

const messengerProducts = [
  { id: 1, name: "All Over Print T-Shirt", price: "$28.00", image: "https://images-api.printify.com/mockup/69c72a018b1ab6926a04e5e2/83516/53246/the-messengers-all-over-print-t-shirt.jpg?camera_label=back-on-person&revision=1775077516292&s=2048", link: "https://embers-of-light.printify.me/product/27613875/the-messengers-all-over-print-t-shirt" },
  { id: 2, name: "The Dreamkeepers Cap", price: "$24.00", image: "https://images.printify.com/mockup/69cec44f338dbae7f501adc0/104281/53890/the-messengers-cap-the-dreamkeepers-fantasy-baseball-hat.jpg?camera_label=front", link: "https://embers-of-light.printify.me/product/27752339/the-messengers-cap-the-dreamkeepers-fantasy-baseball-hat" },
  { id: 3, name: "Cotton Canvas Tote Bag", price: "$18.00", image: "https://images-api.printify.com/mockup/69c3f80803e9be5c6d0cf798/101409/93895/the-messengers-cotton-canvas-tote-bag.jpg?camera_label=front&revision=1775077355987&s=400", link: "https://embers-of-light.printify.me/product/27561004/the-messengers-cotton-canvas-tote-bag" },
  { id: 4, name: "Unisex Heavy Cotton Tee", price: "$22.00", image: "https://images-api.printify.com/mockup/69c3efb260984dddf1091ba7/12100/92570/the-messengers-unisex-heavy-cotton-tee.jpg?camera_label=front&revision=1775077356747&s=2048", link: "https://embers-of-light.printify.me/product/27560433/the-messengers-unisex-heavy-cotton-tee" },
  { id: 5, name: "Ceramic Mug", price: "$15.00", image: "https://images.printify.com/mockup/69c33ee920953e335a0838f6/65216/6312/the-messengers-ceramic-mug-11oz-15oz.jpg?camera_label=left", link: "https://embers-of-light.printify.me/product/27551482/the-messengers-ceramic-mug-11oz-15oz" },
  { id: 6, name: "Hardcover Matte Journal", price: "$20.00", image: "https://images-api.printify.com/mockup/69d991397404a2552503e760/65223/7338/the-messengers-hardcover-journal-matte.jpg?camera_label=front&revision=1775866250857&s=2048", link: "https://embers-of-light.printify.me/product/27905110/the-messengers-hardcover-journal-matte" }
];

export default function TheMessengersPage() {
  const [activeView, setActiveView] = useState<'archive' | 'live'>('archive');
  const [parentDomain, setParentDomain] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') { setParentDomain(window.location.hostname); }
  }, []);

  const SectionDivider = () => (
    <div className="w-full h-px bg-gradient-to-r from-transparent via-orange-900/40 to-transparent my-16"></div>
  );

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-black font-cormorant text-gray-200 overflow-x-hidden">
      {/* Background Image Wrapper */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/main-images/Cover Art/messengers-bg.jpg"
          alt="The Messengers Background"
          fill
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-[#4B0082]/20 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90 pointer-events-none"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Header />

        <main className="flex-grow flex flex-col items-center pt-24 pb-12 px-4 w-full">
          <div className="w-full max-w-7xl mx-auto">
            <div className="mb-12">
              <Link href="/dashboard" className="text-orange-500 hover:text-orange-400 font-cinzel tracking-widest transition-colors flex items-center gap-2 w-fit uppercase text-sm font-bold">
                <span>←</span> BACK TO DASHBOARD
              </Link>
            </div>

            <div className="text-center mb-12">
              <h1 className="font-cinzel-decorative font-bold text-center text-5xl md:text-7xl mb-4 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-200 to-orange-400">
                The Messengers
              </h1>
              <p className="font-cinzel text-xl text-orange-200/80 italic tracking-widest uppercase">Hosted by Brindle Wolf & Lunaria</p>
            </div>

            <SectionDivider />

            <div className="mb-12 relative">
              <div className="flex justify-center gap-4 mb-8">
                <button onClick={() => setActiveView('live')} className={`px-6 py-2 font-cinzel text-sm border transition-all rounded-full uppercase tracking-widest active:scale-95 ${activeView === 'live' ? 'border-orange-500 text-orange-500 bg-orange-500/10 shadow-[0_0_15px_rgba(234,88,12,0.3)]' : 'border-gray-600 text-gray-500'}`}>🔴 Live Stream</button>
                <button onClick={() => setActiveView('archive')} className={`px-6 py-2 font-cinzel text-sm border transition-all rounded-full uppercase tracking-widest active:scale-95 ${activeView === 'archive' ? 'border-orange-500 text-orange-500 bg-orange-500/10 shadow-[0_0_15px_rgba(234,88,12,0.3)]' : 'border-gray-600 text-gray-500'}`}>🎬 The Archives</button>
              </div>

              <div className="w-full border border-orange-900/50 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(234,88,12,0.15)] bg-black relative md:h-[600px]">
                {activeView === 'live' ? (
                  <div className="flex flex-col md:flex-row w-full h-full">
                    <iframe 
                      src={`https://player.twitch.tv/?channel=riseradionetworks&parent=${parentDomain || 'embersoflight.net'}`} 
                      className="w-full aspect-video md:aspect-auto md:flex-grow md:h-full" 
                      frameBorder="0" 
                      allowFullScreen
                    ></iframe>
                    <iframe 
                      src={`https://www.twitch.tv/embed/riseradionetworks/chat?parent=${parentDomain || 'embersoflight.net'}&darkpopout`} 
                      className="w-full h-[350px] md:w-[350px] md:h-full border-t md:border-l border-orange-900/30" 
                      frameBorder="0"
                    ></iframe>
                  </div>
                ) : (
                  <div className="w-full h-full aspect-video">
                    <iframe src="https://www.youtube.com/embed/videoseries?list=PLKmO6Km32njQ46KfUQgXQ0wnE3_PEtZwK" className="w-full h-full" frameBorder="0" allowFullScreen></iframe>
                  </div>
                )}
              </div>
            </div>

            <SectionDivider />

            <MerchGallery showName="The Messengers" products={messengerProducts} />

            <SectionDivider />

            {/* Meet The Messengers Section */}
            <section className="w-full mb-24">
              <h2 className="font-cinzel-decorative text-center text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 uppercase tracking-widest mb-16">
                Meet The Messengers
              </h2>

              <div className="flex flex-col md:flex-row items-center gap-12 mb-16">
                <div className="w-full md:w-1/2 relative aspect-[4/3] rounded-2xl border border-orange-900/30 overflow-hidden shadow-[0_0_30px_rgba(234,88,12,0.15)] group">
                  <Image 
                    src="/images/jmc-edits-palettes/messengers-steampunk.png" 
                    alt="Welcome to The Messengers" 
                    fill
                    className="object-contain" 
                  />
                </div>
                <div className="w-full md:w-1/2 flex flex-col justify-center">
                  <h3 className="font-cinzel text-3xl text-orange-500 font-bold tracking-widest uppercase mb-6">
                    A Sanctuary of Intuition
                  </h3>
                  <div className="font-cormorant text-xl text-gray-300 space-y-5 leading-relaxed">
                    <p>
                      Step into a high-vibrational sanctuary where intuition meets intentional action. Hosted by <span className="text-orange-400 font-semibold">Karrie "Lunaria" Lynne</span> and <span className="text-orange-400 font-semibold">Michka "BrindleWolf" Grant</span>, <em className="italic">The Messengers</em> is a space dedicated to clarity, soul-led purpose, and the raw power of the tarot. 
                    </p>
                    <p>
                      Together, Karrie and Michka serve as conduits for the universe, delivering the unfiltered messages you need to align with your highest self. Their combined energy creates a bridge between the spiritual realms and your practical daily journey.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row-reverse items-center gap-12 mb-16">
                <div className="w-full md:w-1/2 relative aspect-[4/3] rounded-2xl border border-orange-900/30 overflow-hidden shadow-[0_0_30px_rgba(234,88,12,0.15)] group">
                  <Image 
                    src="/images/brindle-lunaria-profile.png" 
                    alt="The Spark of 2023" 
                    fill
                    className="object-contain" 
                  />
                </div>
                <div className="w-full md:w-1/2 flex flex-col justify-center">
                  <h3 className="font-cinzel text-3xl text-orange-500 font-bold tracking-widest uppercase mb-6">
                    The Spark of 2023
                  </h3>
                  <div className="font-cormorant text-xl text-gray-300 space-y-5 leading-relaxed">
                    <p>
                      The true catalyst for <em className="italic">The Messengers</em> arrived in May of 2023 with the birth of <strong className="text-orange-200">Untriggered</strong>—Michka’s heightened awareness coaching business. 
                    </p>
                    <p>
                      A few months after launching his business, Michka approached Karrie with a vision: he wanted to create a show that integrated his coaching group and brought his message of awareness to a wider audience. During that conversation, a shared secret came to light—they were both tarot readers.
                    </p>
                    <p>
                      Fusing Michka’s visionary coaching with Karrie’s seasoned expertise in commanding the airwaves, they launched the show that would become the foundation for RISE Radio and the Embers of Light community.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-black/60 backdrop-blur-sm p-10 rounded-[2rem] border border-orange-900/30 text-center max-w-4xl mx-auto shadow-2xl mt-12">
                <p className="font-cormorant text-xl md:text-2xl text-orange-200 italic leading-relaxed">
                  "When you watch The Messengers, you are witnessing the original flame that started it all—a unified dream to help people find inner peace through music, tarot, and creative connection."
                </p>
              </div>
            </section>

          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}