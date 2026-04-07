import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const subscriptionTiers = [
  {
    name: "Seeker",
    price: "0",
    intro: "Entry into the Rise Radio ecosystem.",
    description: "The starting point for those beginning their journey. Access the core frequency and join the growing community of awareness.",
    perks: ["Access to all main live streams", "Basic community forum access", "Public show archives"],
    color: "from-gray-500 to-gray-700"
  },
  {
    name: "Keepers of the Embers",
    price: "5",
    intro: "Believe in independent voices. Help fuel the RISE journey.",
    description: "This tier is pure support. Your commitment is the spark that keeps the signal blazing across radio and streaming platforms.",
    perks: ["Everything in Seeker", "Access to community posts feed", "Digital supporter recognition", "Ember Keeper identity badge"],
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
    description: "The absolute highest commitment. Patrons of the arts ensuring long-term stability and full potential.",
    perks: ["Everything above", "Annual 1-on-1 virtual call", "Private annual virtual gathering", "Executive-level recognition"],
    color: "from-yellow-200 via-orange-400 to-red-700"
  }
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center bg-black overflow-x-hidden">
      
      {/* Background Video Layer */}
      <video 
        autoPlay 
        muted 
        loop 
        playsInline 
        className="fixed top-0 left-0 w-full h-full object-cover z-0 opacity-40 pointer-events-none"
      >
        <source src="/images/eol-moving-background.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay for Readability */}
      <div className="fixed top-0 left-0 w-full h-full bg-black/60 z-10 pointer-events-none"></div>

      <Header />

      {/* Main Content */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 pt-32 pb-20 text-center">
        <h1 className="text-5xl md:text-7xl font-cinzel-dec font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 mb-6 drop-shadow-[0_0_15px_rgba(255,100,0,0.4)]">
          EMBERS OF LIGHT
        </h1>
        <p className="text-xl md:text-2xl font-cormorant text-gray-300 italic mb-16 tracking-widest uppercase">
          Fuel the Journey • Enter the Sanctuary
        </p>

        {/* TIERS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {subscriptionTiers.map((tier) => (
            <div 
              key={tier.name}
              className="flex flex-col bg-black/80 backdrop-blur-md rounded-2xl border border-orange-900/40 p-8 shadow-2xl transition-all duration-300 hover:border-orange-500/60 group hover:shadow-[0_0_40px_rgba(255,100,0,0.15)]"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-cinzel font-bold text-orange-500 mb-1 tracking-wider uppercase">{tier.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-4xl font-bold text-white">${tier.price}</span>
                  <span className="text-gray-400 font-cormorant">/month</span>
                </div>
                <p className="text-orange-300 font-cormorant italic text-sm border-t border-orange-900/30 pt-2">{tier.intro}</p>
              </div>

              <p className="text-gray-300 font-cormorant text-lg mb-8 leading-relaxed italic">
                {tier.description}
              </p>

              <ul className="flex-grow mb-8 border-t border-orange-900/30 pt-6 space-y-3">
                {tier.perks.map((perk, index) => (
                  <li key={index} className="flex items-start gap-3 leading-tight text-gray-300 font-cormorant text-lg">
                    <span className="text-orange-500 font-bold">•</span>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              {/* FUNCTIONAL LINK BUTTON */}
              <Link 
                href="/signup" 
                className={`block w-full py-4 text-center text-white text-lg font-cinzel font-bold rounded-lg transition-all transform hover:-translate-y-1 bg-gradient-to-br ${tier.color} shadow-lg hover:shadow-orange-500/20`}
              >
                Unlock {tier.name}
              </Link>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}