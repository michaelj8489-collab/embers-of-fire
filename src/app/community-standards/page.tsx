'use client';

import React from 'react';
import Link from 'next/link';

export default function CommunityGuidelines() {
  return (
    <div className="min-h-screen bg-black text-gray-200 py-16 px-6 md:px-12 w-full relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-orange-900/20 to-black z-0 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-4 uppercase tracking-widest">
            Community Guidelines
          </h1>
          <h2 className="text-xl md:text-2xl font-cinzel text-gray-400">
            Protecting the Sanctuary
          </h2>
        </div>

        {/* Content Section */}
        <div className="font-cormorant text-lg md:text-xl text-gray-300 leading-relaxed bg-black/60 p-8 md:p-12 border border-orange-500/20 rounded-xl shadow-[0_0_30px_rgba(234,88,12,0.1)] backdrop-blur-md">
          
          {/* --- NEW MISSION SECTION --- */}
          <div className="mb-12 border-b border-orange-500/30 pb-10">
            <h3 className="text-3xl font-cinzel text-orange-400 mb-6 uppercase tracking-widest text-center">
              The Spark & The Mission
            </h3>
            <div className="space-y-6">
              <p>
                Before we define the boundaries of our space, we must remember the fire that built it. <strong className="text-orange-400 font-cinzel tracking-wider">Embers of Light</strong> is the digital home and beating heart of the Rise Radio Network. More than just a broadcasting platform, it is a Sanctuary carefully constructed for healing, authentic expression, and high-frequency connection.
              </p>
              <p>
                We provide a stage for those who are ready to step into their truth. Through our live radio broadcasts, real-time community chatrooms, and the exclusive depths of our tiered memberships, we create a secure environment where deep, transformative conversations—and powerful music—can thrive. 
              </p>
              <p>
                Our ultimate mission is simple but profound: to inspire creators, listeners, and seekers across the globe. We are here to help you kindle your own unique spark, rise together above the noise of the outside world, and find a community that will help keep your fire burning through the night.
              </p>
            </div>
          </div>
          {/* --------------------------- */}

          {/* Intro to Guidelines */}
          <div className="space-y-6">
            <p className="text-xl text-gray-200">
              To maintain the high frequency of this space and protect the mission of the Embers, we require all members, listeners, and hosts to honor a strict code of conduct. By entering the Sanctuary and participating in our chat rooms, shows, and groups, you agree to abide by the following decrees:
            </p>

            {/* Rule 1 */}
            <div className="mt-10">
              <h3 className="text-2xl font-cinzel text-orange-400 mb-3 uppercase tracking-wide border-b border-gray-800 pb-2">
                1. Zero Tolerance for Drama & Bullying
              </h3>
              <p>
                We do not do drama. Disagreements and differing perspectives are a natural part of growth, but cruelty, name-calling, intentional instigation, and bullying will not be tolerated under any circumstances. If your goal is to tear another member down, this is not the network for you.
              </p>
            </div>

            {/* Rule 2 */}
            <div className="mt-8">
              <h3 className="text-2xl font-cinzel text-orange-400 mb-3 uppercase tracking-wide border-b border-gray-800 pb-2">
                2. No Background Harassment
              </h3>
              <p>
                The peace of our community extends beyond the public chat rooms. "Background harassment"—including sending malicious private messages, coordinating attacks behind the scenes, or bringing outside conflicts into the Sanctuary—is strictly forbidden. We protect our members' peace both on the stage and behind the curtain.
              </p>
            </div>

            {/* Rule 3 */}
            <div className="mt-8">
              <h3 className="text-2xl font-cinzel text-orange-400 mb-3 uppercase tracking-wide border-b border-gray-800 pb-2">
                3. Cyberstalking & Unwanted Pursuit
              </h3>
              <p>
                Respect boundaries. Cyberstalking, obsessive monitoring of other members, or continuing to contact someone who has asked to be left alone is a severe violation of our space. Any predatory behavior will result in an immediate and permanent ban from the network and all associated platforms.
              </p>
            </div>

            {/* Rule 4 */}
            <div className="mt-8">
              <h3 className="text-2xl font-cinzel text-orange-400 mb-3 uppercase tracking-wide border-b border-gray-800 pb-2">
                4. Keep the Frequency High
              </h3>
              <p>
                We are here to rise together. Support the hosts, support each other, and contribute to the fire. If you see behavior that violates these guidelines, please report it to an Admin. We will handle it quietly and swiftly.
              </p>
            </div>
          </div>

        </div>

        {/* Return Button */}
        <div className="mt-12 text-center">
          <Link href="/">
            <button className="px-8 py-3 font-cinzel text-lg border border-orange-500 text-orange-500 transition-all rounded-full uppercase tracking-widest hover:bg-orange-500/10 hover:shadow-[0_0_15px_rgba(234,88,12,0.4)] active:scale-95">
              Return to the Sanctuary
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}
