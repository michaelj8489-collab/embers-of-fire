'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ADMIN_EMAILS = [
  'michael.j.8489@gmail.com',
  // 'collaborator@example.com'
];

const TIER_DECORATIONS: Record<string, { title: string, subtitle: string, color: string, perks: string[], image: string }> = {
  "seeker": {
    title: "THE SEEKER SANCTUARY",
    subtitle: "The starting point of the journey.",
    color: "from-gray-500 to-gray-700",
    image: "/images/misc/wolf-and-raven.jpg",
    perks: ["Public Show Archives", "Basic Community Forum", "Main Live Stream Access"]
  },
  "keepers-of-the-embers": {
    title: "THE KEEPERS SANCTUARY",
    subtitle: "Fueling the eternal flame.",
    color: "from-orange-500 to-orange-700",
    image: "/images/jmc-edits-palettes/keepers-of-the-embers.png",
    perks: ["Digital Supporter Recognition", "Ember Keeper Identity Badge", "Community Posts Feed"]
  },
  "flame-bearers": {
    title: "THE BEARERS SANCTUARY",
    subtitle: "Guiding the community fire.",
    color: "from-orange-400 to-red-600",
    image: "/images/jmc-edits-palettes/flame-bearers.png",
    perks: ["Exclusive 'Awareness Insights'", "Priority Voting on Themes", "Ad-Free Show Archives"]
  },
  "phoenix-circle": {
    title: "THE PHOENIX CIRCLE",
    subtitle: "Direct impact. Deep awareness.",
    color: "from-yellow-400 to-orange-500",
    image: "/images/jmc-edits-palettes/phoenix-circle.png",
    perks: ["Monthly 'Fireside' Livestream", "Monthly On-Air Shout-out", "Zoom Workshop Access"]
  },
  "wings-of-the-phoenix": {
    title: "THE WINGS SANCTUARY",
    subtitle: "Building the legacy infrastructure.",
    color: "from-red-500 to-orange-600",
    image: "/images/jmc-edits-palettes/wings-of-the-phoenix.png",
    perks: ["Quarterly Executive Council Calls", "Phoenix Vision Insight Letters", "Submission Priority"]
  },
  "phoenix-ascending": {
    title: "THE ASCENDING SANCTUARY",
    subtitle: "The highest vision realized.",
    color: "from-yellow-200 via-orange-400 to-red-700",
    image: "/images/jmc-edits-palettes/phoenix-ascending.png",
    perks: ["Annual 1-on-1 Virtual Call", "Private Annual Virtual Gathering", "Executive-Level Recognition"]
  }
};

export default function SanctuaryTierPage({ params }: { params: { tier: string } }) {
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const decoration = TIER_DECORATIONS[params.tier] || TIER_DECORATIONS["seeker"];

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data: messages } = await supabase
        .from('broadcasts')
        .select('*')
        .eq('target_tier', params.tier)
        .order('created_at', { ascending: false });
      
      setBroadcasts(messages || []);
      setLoading(false);
    };
    getData();
  }, [params.tier]);

  if (loading) return <div className="min-h-screen bg-black text-white p-10 font-cinzel text-center pt-40">Synchronizing Transmissions...</div>;

  return (
    <main className="relative min-h-screen w-full flex flex-col bg-black overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full h-full bg-cover bg-center opacity-40 z-0 pointer-events-none" style={{ backgroundImage: `url('${decoration.image}')` }}></div>
      <div className="fixed top-0 left-0 w-full h-full bg-black/60 z-10 pointer-events-none"></div>

      <Header />
      
      <div className="relative z-20 max-w-5xl mx-auto pt-32 px-6 pb-20">
        <h1 className={`text-5xl md:text-7xl font-cinzel-dec font-bold text-transparent bg-clip-text bg-gradient-to-r ${decoration.color} mb-2 uppercase tracking-tighter drop-shadow-lg`}>
          {decoration.title}
        </h1>
        <p className="text-xl md:text-2xl font-cormorant text-gray-300 italic mb-12 tracking-widest uppercase">{decoration.subtitle}</p>

        {/* PERKS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          {decoration.perks.map((perk, index) => (
            <div key={index} className="p-4 bg-black/50 border border-orange-500/20 rounded-lg text-center backdrop-blur-md">
              <span className="text-orange-500 font-cinzel text-[10px] block mb-1 uppercase tracking-widest">Unlocked Perk</span>
              <p className="text-gray-200 font-cormorant italic text-sm">{perk}</p>
            </div>
          ))}
        </div>

        {/* SECRET ADMIN PORTAL: Only Michael and crew see this */}
        {user && ADMIN_EMAILS.includes(user.email) && (
          <div className="mb-16 p-8 bg-zinc-900/60 border border-orange-500/30 rounded-2xl text-center backdrop-blur-xl">
            <h3 className="text-sm font-cinzel text-orange-400 mb-4 tracking-widest uppercase">Admin Presence Detected</h3>
            <a href="/dashboard/admin" className="px-10 py-4 bg-gradient-to-r from-orange-600 to-red-800 text-white rounded-lg hover:scale-105 transition-all font-cinzel font-bold inline-block">
              Return to Command Center
            </a>
          </div>
        )}

        {/* BROADCAST FEED */}
        <div className="space-y-12">
          <h2 className="text-sm font-cinzel text-orange-500/60 tracking-[0.4em] uppercase border-b border-orange-900/30 pb-4">Latest Transmissions</h2>
          {broadcasts.length > 0 ? (
            broadcasts.map((msg) => (
              <div key={msg.id} className="p-10 bg-black/70 border-l-4 border-orange-600 rounded-r-2xl shadow-2xl backdrop-blur-lg">
                <p className="text-2xl leading-relaxed text-gray-100 mb-6 whitespace-pre-wrap font-cormorant italic">"{msg.content}"</p>
                <div className="text-[10px] font-cinzel text-gray-500 uppercase tracking-widest">Received: {new Date(msg.created_at).toLocaleString()}</div>
              </div>
            ))
          ) : (
            <div className="text-center py-24 border border-dashed border-zinc-800 rounded-2xl bg-black/30 font-cormorant text-xl text-gray-600">The Embers are quiet...</div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}