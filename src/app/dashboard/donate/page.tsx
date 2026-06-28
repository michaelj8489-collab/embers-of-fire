'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getStripe } from '@/utils/stripe/client'; // <-- Added to handle the checkout

// Copying your established tiers
const subscriptionTiers = [
  { 
    name: "Keepers of the Embers", 
    price: "5", 
    intro: "Believe in independent voices. Help fuel the RISE journey.", 
    description: "This tier is pure support. Your commitment is the spark that keeps the signal blazing across radio and streaming platforms.", 
    perks: ["Access to community posts feed", "Digital supporter recognition", "Ember Keeper identity badge"], 
    color: "from-orange-500 to-orange-700",
    image: "/images/jmc-edits-palettes/keepers-of-the-embers.png"
  },
  { 
    name: "Flame Bearers", 
    price: "15", 
    intro: "Deepen your connection. Guide the community fire.", 
    description: "For listeners who want to be closer to the heart of the conversation and play an active role in how RISE grows.", 
    perks: ["Exclusive 'Awareness Insights'", "Priority voting on show themes", "Ad-free show archives"], 
    color: "from-orange-400 to-red-600",
    image: "/images/jmc-edits-palettes/flame-bearers.png"
  },
  { 
    name: "Phoenix Circle", 
    price: "33", 
    intro: "Exclusive access. Direct broadcast impact.", 
    description: "Where awareness meets true impact. This is for our most dedicated inner community with direct interaction.", 
    perks: ["Monthly 'Fireside' livestream", "Monthly on-air shout-out", "Zoom workshops access"], 
    color: "from-yellow-400 to-orange-500",
    image: "/images/jmc-edits-palettes/phoenix-circle.png"
  },
  { 
    name: "Wings of the Phoenix", 
    price: "75", 
    intro: "The Infrastructure Force.", 
    description: "Legacy building. Support the funding of technology, physical studios, and expansion onto new platforms.", 
    perks: ["Quarterly Executive Council Calls", "Phoenix Vision Insight Letters", "Highest priority for submissions"], 
    color: "from-red-500 to-orange-600",
    image: "/images/jmc-edits-palettes/wings-of-the-phoenix.png"
  },
  { 
    name: "Phoenix Ascending", 
    price: "150", 
    intro: "The Vanguard. Supporting the highest vision.", 
    description: "The absolute highest commitment. Patrons of the arts ensuring long-term stability and full potential.", 
    perks: ["Annual 1-on-1 virtual call", "Private annual virtual gathering", "Executive-level recognition"], 
    color: "from-yellow-200 via-orange-400 to-red-700",
    image: "/images/jmc-edits-palettes/phoenix-ascending.png"
  }
];

export default function DonateTierPage() {
  
  const handleCheckout = async (tierName: string) => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierName }),
      });
      
      // We now actively use the 'response' to redirect the user
      const resData = await response.json();
      const stripe = await getStripe();
      
     if (stripe && resData.sessionId) {
         
        const { error } = await (stripe as any).redirectToCheckout({ sessionId: resData.sessionId });
        if (error) console.error("Stripe redirect error:", error);
    }
    } catch (err) {
      console.error("Stripe Error:", err);
    }
  };

  return (
    <div className="min-h-screen text-gray-200 flex flex-col relative bg-cover bg-center bg-fixed font-cormorant" 
         style={{ backgroundImage: "url('/images/phoenix-revised.png')" }}>
      <Header />
      <main className="flex-grow flex flex-col items-center pt-32 pb-20 px-4 relative z-10">
        <h1 className="text-5xl md:text-7xl font-cinzel font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-yellow-500 drop-shadow-[0_5px_15px_rgba(255,69,0,0.4)]">
          Tiers of Light
        </h1>
        <div className="w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent mb-16 shadow-[0_0_10px_rgba(255,165,0,0.8)]" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl px-4">
          {subscriptionTiers.map((tier) => (
            <div key={tier.name} className="relative group overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md transition-all duration-500 hover:scale-[1.02] hover:border-orange-500/50 flex flex-col shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              {/* Background Image Layer with 55% Opacity as requested previously */}
              <div 
                className="absolute inset-0 z-0 opacity-55 transition-opacity duration-500 group-hover:opacity-75 bg-cover bg-center"
                style={{ backgroundImage: `url('${tier.image}')` }}
              />
              {/* Darkening Gradient Overlay */}
              <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/40 via-black/80 to-black" />

              <div className="relative z-10 p-8 flex flex-col h-full items-center text-center">
                <h3 className="text-2xl font-cinzel font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-orange-400 font-bold text-lg italic mb-4">{tier.intro}</p>
                <div className="text-4xl font-bold mb-4">${tier.price}<span className="text-sm font-normal text-gray-400">/mo</span></div>
                <p className="text-gray-200 text-lg font-medium italic mb-6 leading-relaxed">{tier.description}</p>
                <ul className="text-left space-y-3 mb-8 flex-grow">
                  {tier.perks.map((perk, i) => (
                    <li key={i} className="flex items-start text-gray-100 text-lg font-medium">
                      <span className="text-orange-500 mr-2 mt-1">◆</span>
                      {perk}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => handleCheckout(tier.name)}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg bg-gradient-to-r ${tier.color} text-white hover:brightness-110 active:scale-[0.98] uppercase tracking-wider`}
                >
                  Unlock {tier.name}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* PayPal One-Time Donation Section */}
        <div className="mt-20 flex flex-col items-center w-full max-w-4xl px-4">
          <h2 className="text-3xl md:text-4xl font-cinzel font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 drop-shadow-[0_2px_10px_rgba(0,112,186,0.3)] text-center">
            One-Time Contribution
          </h2>
          <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent mb-8 shadow-[0_0_10px_rgba(0,112,186,0.5)]" />
          <p className="text-gray-200 text-xl font-medium italic mb-8 text-center max-w-2xl leading-relaxed">
            Prefer to make a single contribution? Support the network directly via PayPal.
          </p>
          <a 
            href="https://www.paypal.me/brindlewolf" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-gradient-to-r from-[#0070ba] to-[#005ea6] hover:brightness-110 text-white font-bold py-4 px-12 rounded-xl transition-all duration-300 shadow-[0_10px_20px_rgba(0,112,186,0.4)] hover:scale-105 active:scale-95 uppercase tracking-wider flex items-center justify-center text-lg"
          >
            Donate via PayPal
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}