import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black text-gray-200 flex flex-col font-sans">
      <Header />

      <main className="flex-grow flex flex-col items-center p-4 sm:p-6 mt-16 md:mt-24 w-full">
        <div className="w-full max-w-5xl">

          {/* Welcome Banner */}
          <div className="text-center mb-16 border-b border-orange-900/50 pb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 uppercase tracking-widest mb-4">
              Welcome to the Embers
            </h1>
            <p className="text-xl text-gray-400 italic">
              You have stepped into the Sanctuary. The signal is strong here.
            </p>
          </div>

          {/* The Legacy Section */}
          <div className="bg-gray-900/50 border border-orange-900/30 rounded-2xl p-8 md:p-12 mb-16 shadow-[0_0_30px_rgba(234,88,12,0.05)]">
            <h2 className="text-3xl font-bold text-orange-500 mb-6 uppercase tracking-wider">The Spark That Started It All</h2>
            <div className="space-y-6 text-gray-300 leading-relaxed text-lg">
              <p>
                <strong className="text-orange-400 font-semibold">Rise Radio Networks</strong> began with a simple intention: two voices, one microphone, and a burning desire to inspire listeners with deeper conversations than what traditional radio was offering.
              </p>
              <p>
                Karrie “Lunaria” Lynne and Brindlewolf first came together as co-hosts of <em className="text-gray-100">The Messengers</em>, a show originally created to give listeners a real experience of the kind of insight and perspective they could expect during a personal reading. What started as meaningful conversation quickly grew into a blazing fire—a space where music, awareness, and honest dialogue could coexist.
              </p>
              <p>
                Feeling called to build something of their own, they stepped away to create <strong className="text-orange-400 font-semibold">RISE Radio</strong>, a community built on independence, authenticity, and the belief that radio could still inspire growth, connection, and thought-provoking discussion.
              </p>
              
              {/* Added Flourish / Call to Action */}
              <div className="mt-8 p-6 border-l-4 border-red-600 bg-black/40 rounded-r-lg">
                <p className="text-orange-200 font-semibold italic">
                  By standing here within the Embers, you are doing more than just tuning in—you are fueling the fire. Your presence and support help sustain this independent platform, allowing this legacy of healing, awareness, and connection to reach those who need it most.
                </p>
              </div>
            </div>
          </div>

          {/* Frequencies / Still Rising */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-orange-500 mb-10 uppercase tracking-wider">Still Rising: Our Frequencies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Station 1 */}
              <div className="bg-gray-900 border border-orange-900/50 rounded-xl p-8 hover:border-orange-500/50 transition-colors">
                <h3 className="text-2xl font-bold text-gray-100 mb-3 border-b border-orange-900/50 pb-2">RISE Radio</h3>
                <p className="text-orange-500/80 text-sm mb-4 uppercase tracking-widest font-bold">The Original Signal</p>
                <p className="text-gray-300">
                  Dedicated purely to music recorded and submitted by members from the RISE Radio community. A 24-hour loop of handpicked independent art.
                </p>
              </div>
              
              {/* Station 2 */}
              <div className="bg-gray-900 border border-orange-900/50 rounded-xl p-8 hover:border-red-500/50 transition-colors">
                <h3 className="text-2xl font-bold text-gray-100 mb-3 border-b border-red-900/50 pb-2">RISE Awakenings</h3>
                <p className="text-red-500/80 text-sm mb-4 uppercase tracking-widest font-bold">The Conscious Core</p>
                <p className="text-gray-300">
                  Born to blend music with deep conversations around mental wellbeing, personal awareness, and transformational perspectives.
                </p>
              </div>
              
            </div>
          </div>

          {/* Transmission Schedule */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-orange-500 mb-10 uppercase tracking-wider">Live Transmission Schedule</h2>
            
            <div className="max-w-3xl mx-auto bg-gray-900/80 border border-orange-900/50 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(234,88,12,0.1)]">
              
              {/* Monday */}
              <div className="flex flex-col sm:flex-row border-b border-orange-900/30 hover:bg-black/30 transition-colors">
                <div className="bg-black/50 p-6 sm:w-1/3 flex items-center border-b sm:border-b-0 sm:border-r border-orange-900/30">
                  <h3 className="text-xl font-bold text-orange-400 uppercase tracking-widest">Mondays</h3>
                </div>
                <div className="p-6 sm:w-2/3 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-200">The Bloom</span>
                    <span className="text-gray-400 font-mono bg-black/50 px-2 py-1 rounded">11:00 AM EST</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-200">The Messengers</span>
                    <span className="text-gray-400 font-mono bg-black/50 px-2 py-1 rounded">6:00 PM EST</span>
                  </div>
                </div>
              </div>

              {/* Tuesday */}
              <div className="flex flex-col sm:flex-row border-b border-orange-900/30 hover:bg-black/30 transition-colors">
                <div className="bg-black/50 p-6 sm:w-1/3 flex items-center border-b sm:border-b-0 sm:border-r border-orange-900/30">
                  <h3 className="text-xl font-bold text-orange-400 uppercase tracking-widest">Tuesdays</h3>
                </div>
                <div className="p-6 sm:w-2/3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-200">Brindle's Vision</span>
                    <span className="text-gray-400 font-mono bg-black/50 px-2 py-1 rounded">12:00 PM EST</span>
                  </div>
                </div>
              </div>

              {/* Wednesday */}
              <div className="flex flex-col sm:flex-row border-b border-orange-900/30 hover:bg-black/30 transition-colors">
                <div className="bg-black/50 p-6 sm:w-1/3 flex items-center border-b sm:border-b-0 sm:border-r border-orange-900/30">
                  <h3 className="text-xl font-bold text-orange-400 uppercase tracking-widest">Wednesdays</h3>
                </div>
                <div className="p-6 sm:w-2/3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-200">Phoenix Talks</span>
                    <span className="text-gray-400 font-mono bg-black/50 px-2 py-1 rounded">6:00 PM EST</span>
                  </div>
                </div>
              </div>

              {/* Thursday */}
              <div className="flex flex-col sm:flex-row border-b border-orange-900/30 hover:bg-black/30 transition-colors">
                <div className="bg-black/50 p-6 sm:w-1/3 flex items-center border-b sm:border-b-0 sm:border-r border-orange-900/30">
                  <h3 className="text-xl font-bold text-orange-400 uppercase tracking-widest">Thursdays</h3>
                </div>
                <div className="p-6 sm:w-2/3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-200">The CORE</span>
                    <span className="text-gray-400 font-mono bg-black/50 px-2 py-1 rounded">11:00 AM EST</span>
                  </div>
                </div>
              </div>

              {/* Friday */}
              <div className="flex flex-col sm:flex-row hover:bg-black/30 transition-colors">
                <div className="bg-black/50 p-6 sm:w-1/3 flex items-center border-b sm:border-b-0 sm:border-r border-orange-900/30">
                  <h3 className="text-xl font-bold text-orange-400 uppercase tracking-widest">Fridays</h3>
                </div>
                <div className="p-6 sm:w-2/3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-200">Illuminate w/ Lunaria</span>
                    <span className="text-gray-400 font-mono bg-black/50 px-2 py-1 rounded">11:00 AM EST</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}