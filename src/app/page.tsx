import Link from 'next/link';
import Header from '@/components/Header';

const subscriptionTiers = [
  {
    name: "Keepers of the Embers",
    price: "5",
    intro: "Believe in independent voices. Help fuel the RISE journey.",
    description: "This tier is pure support. Your commitment is the spark that keeps the signal blazing across radio and streaming platforms.",
    perks: ["Access to community posts feed", "Digital supporter recognition", "Ember Keeper identity badge"],
    color: "from-orange-500 to-orange-700"
  },
  {
    name: "Flame Bearers",
    price: "15",
    intro: "Deepen your connection. Guide the community fire.",
    description: "For listeners who want to be closer to the heart of the conversation and play an active role in how RISE grows.",
    perks: ["Everything above", "Exclusive 'Awareness Insights'", "Priority voting on show themes", "Ad-free show archives"],
    color: "from-orange-400 to-red-600"
  },
  {
    name: "Phoenix Circle",
    price: "33",
    intro: "Exclusive access. Direct broadcast impact.",
    description: "Where awareness meets true impact. This is for our most dedicated inner community with direct Interaction.",
    perks: ["Everything above", "Monthly 'Fireside' Livestream", "Monthly on-air shout-out", "Zoom workshops access"],
    color: "from-yellow-400 to-orange-500"
  },
  {
    name: "Wings of the Phoenix",
    price: "75",
    intro: "The Infrastructure Force.",
    description: "Legacy building. Support the funding of technology, physical studios, and expansion onto new platforms.",
    perks: ["Everything above", "Quarterly Executive Council Calls", "Phoenix Vision Insight Letters", "Highest priority for submissions"],
    color: "from-red-500 to-orange-600"
  },
  {
    name: "Phoenix Ascended",
    price: "150",
    intro: "The Vanguard. Supporting the highest vision.",
    description: "The absolute highest commitment. patrons of the arts ensuring long-term stability and full potential.",
    perks: ["Everything above", "Annual 1-on-1 virtual call", "Private annual virtual gathering", "Executive-level recognition"],
    color: "from-yellow-200 via-orange-400 to-red-700"
  }
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center overflow-x-hidden text-center bg-black">
      
      {/* 🎬 FIXED Video Background - Shifted down by 6rem (96px) and anchored to the top edge */}
      <video autoPlay muted loop playsInline className="fixed top-24 left-0 w-full h-[calc(100vh-6rem)] object-cover object-top z-0">
        <source src="/images/eol-moving-background.mp4" type="video/mp4" />
      </video>

      {/* 🌑 Dark Overlay - Shifted down to match the video perfectly */}
      <div className="fixed top-24 left-0 w-full h-[calc(100vh-6rem)] bg-black/60 z-10"></div>

      {/* 🔝 Solid Navigation Header */}
      <Header />

      {/* 🛡️ Content Wrapper */}
      <div className="relative z-20 flex flex-col items-center w-full max-w-7xl px-6 pt-48 pb-20">
        
        {/* 📦 Glowing Title Box */}
        <div className="bg-black/50 backdrop-blur-sm px-20 py-10 rounded-3xl border border-orange-900/40 shadow-[0_0_80px_rgba(255,115,0,0.1)] mb-12">
          <h1 className="text-5xl md:text-8xl font-cinzel-dec font-normal text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 drop-shadow-[0_0_25px_rgba(255,100,0,0.4)] tracking-tight">
            Welcome to the Hub
          </h1>
        </div>

        <p className="text-2xl md:text-3xl font-cormorant text-gray-200 mb-12 leading-relaxed max-w-3xl">
          Your exclusive sanctuary for the <span className="text-orange-400 font-cinzel font-bold tracking-wider">Rise Radio Network</span>. 
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-32">
          <Link href="/login" className="px-12 py-4 bg-orange-600 hover:bg-orange-700 text-white text-xl font-cinzel font-bold rounded-lg shadow-lg transition transform hover:-translate-y-1">
            Donator Sign In
          </Link>
          <button className="px-12 py-4 bg-black/40 backdrop-blur-md border-2 border-orange-600 text-orange-500 hover:bg-orange-600 hover:text-white text-xl font-cinzel font-bold rounded-lg transition transform hover:-translate-y-1">
            Become a Supporter
          </button>
        </div>

        {/* 🔥 Tiers Section */}
        <div className="w-full">
          <h2 className="text-4xl md:text-6xl font-cinzel-dec font-normal mb-16 text-white tracking-widest uppercase drop-shadow-md">
            Tiers of Light
          </h2>

          <div className="flex flex-wrap justify-center gap-8">
            {subscriptionTiers.map((tier) => (
              <div key={tier.name} className="bg-black/60 backdrop-blur-md p-8 rounded-2xl border border-orange-900/30 flex flex-col w-full md:w-[350px] shadow-2xl transition hover:border-orange-500/50">
                <h3 className={`text-2xl font-cinzel font-bold tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-r ${tier.color}`}>
                  {tier.name}
                </h3>
                <p className="text-orange-200/80 font-cinzel text-xs italic mb-4 uppercase tracking-widest">{tier.intro}</p>
                <div className="flex items-baseline justify-center font-cormorant text-gray-100 mb-4">
                  <span className="text-5xl font-extrabold font-cinzel">${tier.price}</span>
                  <span className="text-xl ml-1">/ mo</span>
                </div>
                <p className="font-cormorant text-gray-400 text-sm mb-6 leading-snug italic">"{tier.description}"</p>
                <ul className="text-left font-cormorant text-gray-300 text-base space-y-3 flex-grow mb-8 border-t border-orange-900/30 pt-6">
                  {tier.perks.map((perk, index) => (
                    <li key={index} className="flex items-start gap-2 leading-tight">
                      <span className="text-orange-500">•</span>
                      {perk}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-4 text-white text-lg font-cinzel font-bold rounded-lg transition transform hover:-translate-y-1 bg-gradient-to-br ${tier.color}`}>
                  Unlock {tier.name}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}