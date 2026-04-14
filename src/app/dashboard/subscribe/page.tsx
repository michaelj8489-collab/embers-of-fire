'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

const tiers = [
  {
    name: "Seeker",
    price: "$5/mo",
    description: "Entry into the Sanctuary and access to the community board.",
    color: "border-gray-500",
    link: "https://buy.stripe.com/your_seeker_link"
  },
  {
    name: "Keeper",
    price: "$15/mo",
    description: "Includes everything in Seeker, plus exclusive archives and live Q&As.",
    color: "border-orange-500",
    link: "https://buy.stripe.com/your_keeper_link",
    popular: true
  },
  {
    name: "Flame Bearer",
    price: "$50/mo",
    description: "The ultimate tier. Direct support for the network, VIP badges, and more.",
    color: "border-red-600",
    link: "https://buy.stripe.com/your_flame_link"
  }
];

export default function SubscribePage() {
  return (
    <div className="min-h-screen bg-black text-gray-200 font-cormorant relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-900/20 via-black to-black"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow pt-32 pb-20 px-6 container mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-cinzel text-white mb-6 tracking-widest uppercase">Choose Your Path</h1>
          <p className="text-2xl text-orange-400 italic mb-16 max-w-2xl mx-auto font-cormorant">
            "The fire only grows when we tend to it together."
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {tiers.map((tier) => (
              <div key={tier.name} className={`relative p-10 bg-neutral-900/50 backdrop-blur-md border ${tier.color} rounded-3xl flex flex-col justify-between transition-all hover:scale-105 shadow-2xl`}>
                {tier.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-4 py-1 rounded-full text-xs font-bold font-cinzel tracking-widest">MOST POPULAR</span>
                )}
                <div>
                  <h2 className="text-3xl font-cinzel text-white mb-4 uppercase tracking-widest">{tier.name}</h2>
                  <p className="text-4xl font-bold text-orange-500 mb-6 font-cinzel">{tier.price}</p>
                  <p className="text-xl text-gray-300 mb-10 leading-relaxed">{tier.description}</p>
                </div>
                
                <a href={tier.link} className="block w-full py-4 bg-white/5 border border-white/20 text-white font-cinzel tracking-widest rounded-xl hover:bg-orange-600 hover:border-orange-600 transition-all uppercase font-bold">
                  Select Path
                </a>
              </div>
            ))}
          </div>

          <Link href="/dashboard" className="inline-block mt-16 text-gray-500 hover:text-orange-500 font-cinzel tracking-widest transition-colors uppercase text-sm">
            ← Return to Dashboard
          </Link>
        </main>

        <Footer />
      </div>
    </div>
  );
}