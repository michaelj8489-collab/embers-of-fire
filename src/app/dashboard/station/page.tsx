'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function StationPage() {
  return (
    <main className="min-h-screen bg-black text-white font-cinzel">
      <Header />
      <div className="pt-32 px-6 max-w-5xl mx-auto text-center">
        <h1 className="text-5xl text-red-600 mb-8 uppercase tracking-widest">The Station</h1>
        <div className="bg-zinc-900/50 p-10 rounded-3xl border border-red-900/30 backdrop-blur-md">
          <h2 className="text-xl mb-8 text-gray-400">Main Broadcast Signal</h2>
          <iframe src="https://zeno.fm/player/rise-radio-woqo" width="100%" height="200" frameBorder="0" scrolling="no" className="rounded-2xl shadow-2xl"></iframe>
        </div>
      </div>
      <Footer />
    </main>
  );
}