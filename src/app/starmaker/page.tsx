'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { createClient } from '@/utils/supabase/client';

export default function StarMakerDownloader() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', msg?: string, fileUrl?: string, filename?: string }>({ type: 'idle' });
  
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email === 'michael.j.8489@gmail.com') {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    };
    checkAuth();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setStatus({ type: 'loading' });

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://celestial-parser.onrender.com';
      
      const response = await fetch(`${backendUrl}/api/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await response.json();

      if (data.success) {
        setStatus({
          type: 'success',
          fileUrl: `${backendUrl}/api/serve/${encodeURIComponent(data.filename)}`,
          filename: data.filename
        });
      } else {
        setStatus({ type: 'error', msg: data.error || 'An error occurred during download.' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Network error. Make sure the backend server is running.' });
    }
  };

  if (isAuthorized === null) {
    return (
      <main className="min-h-screen bg-black flex justify-center items-center">
        <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
      </main>
    );
  }

  if (isAuthorized === false) {
    return (
      <main className="relative min-h-screen w-full flex flex-col items-center bg-black overflow-x-hidden">
        <div className="fixed top-0 left-0 w-full h-full bg-black z-0 pointer-events-none"></div>
        <Header />
        <div className="relative z-20 w-full max-w-3xl mx-auto px-4 sm:px-6 pt-32 pb-20 text-center flex-grow flex flex-col justify-center items-center">
          <div className="w-20 h-20 bg-red-900/20 border border-red-500/30 text-red-500 rounded-full flex justify-center items-center text-4xl mb-6 shadow-[0_0_15px_rgba(255,0,0,0.2)]">
            !
          </div>
          <h1 className="text-3xl sm:text-5xl font-cinzel-dec font-bold text-red-500 mb-4 uppercase">
            Access Denied
          </h1>
          <p className="text-lg font-cormorant text-gray-300 italic mb-8">
            You do not have the required permissions to enter this sanctuary. Please log in with the correct account.
          </p>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center bg-black overflow-x-hidden">
      {/* Background Videos (matching Embers of Light) */}
      <video autoPlay muted loop playsInline className="fixed top-0 left-0 w-full h-full object-cover z-0 opacity-40 pointer-events-none hidden md:block">
        <source src="/images/jmc-edits-palettes/phoenix-at-birth.mp4" type="video/mp4" />
      </video>
      <video autoPlay muted loop playsInline className="fixed top-0 left-0 w-full h-full object-cover z-0 opacity-40 pointer-events-none block md:hidden">
        <source src="/images/jmc-edits-palettes/mobile-background.mp4" type="video/mp4" />
      </video>

      <div className="fixed top-0 left-0 w-full h-full bg-black/60 z-10 pointer-events-none"></div>

      <Header />

      <div className="relative z-20 w-full max-w-3xl mx-auto px-4 sm:px-6 pt-32 pb-20 text-center flex-grow flex flex-col justify-center">
        
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-cinzel-dec font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 mb-4 drop-shadow-[0_0_15px_rgba(255,100,0,0.4)] uppercase">
          StarMaker Downloader
        </h1>
        
        <p className="text-sm sm:text-lg md:text-xl font-cormorant text-gray-300 italic mb-12 tracking-widest uppercase">
          Extract the audio • Capture the performance
        </p>

        <div className="relative flex flex-col bg-black/80 rounded-2xl border border-orange-900/40 shadow-2xl transition-all duration-500 hover:border-orange-500/60 overflow-hidden p-8 sm:p-12 max-w-2xl mx-auto w-full">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-[#0a0a0a] z-0"></div>
          
          <div className="relative z-10">
            <p className="text-gray-300 font-cormorant text-lg sm:text-xl mb-8 leading-relaxed italic">
              Paste a StarMaker song link below to download the raw audio or video file instantly from the sanctuary of your device.
            </p>

            <form onSubmit={handleSubmit} className="mb-6">
              <div className="flex flex-col gap-4">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://starmaker.onelink.me/..."
                  required
                  className="w-full px-5 py-4 rounded-lg border border-orange-900/40 bg-black/60 text-white font-cormorant text-lg placeholder-gray-500 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all"
                />
                <button
                  type="submit"
                  disabled={status.type === 'loading'}
                  className="w-full py-4 text-center text-white text-lg font-cinzel font-bold rounded-lg transition-all transform hover:-translate-y-1 bg-gradient-to-br from-orange-600 to-red-700 shadow-lg hover:shadow-orange-500/20 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none flex justify-center items-center gap-3 uppercase tracking-wider"
                >
                  {status.type === 'loading' ? (
                    <>
                      <span>Extracting</span>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </>
                  ) : (
                    <span>Download Media</span>
                  )}
                </button>
              </div>
            </form>

            {status.type === 'error' && (
              <div className="mt-6 p-4 rounded-lg bg-red-900/20 border border-red-500/40 text-red-400 font-cormorant text-lg animate-in fade-in slide-in-from-bottom-2">
                <span className="text-red-500 font-bold mr-2 text-sm">◆</span>
                {status.msg}
              </div>
            )}

            {status.type === 'success' && (
              <div className="mt-8 pt-8 border-t border-orange-900/30 animate-in fade-in slide-in-from-bottom-4">
                <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/30 text-orange-500 rounded-full flex justify-center items-center text-3xl mx-auto mb-6 shadow-[0_0_15px_rgba(255,100,0,0.2)]">
                  ✓
                </div>
                <h3 className="text-2xl font-cinzel font-bold text-orange-500 mb-2 tracking-wider uppercase">File Recovered</h3>
                <p className="text-gray-300 font-cormorant text-base mb-8 break-all italic">{status.filename}</p>
                
                <a
                  href={status.fileUrl}
                  download={status.filename}
                  className="block w-full py-4 text-center text-white text-lg font-cinzel font-bold rounded-lg transition-all transform hover:-translate-y-1 bg-gradient-to-br from-green-600 to-emerald-800 shadow-lg hover:shadow-green-500/20 active:scale-95 mb-4 uppercase tracking-wider"
                >
                  Save to Device
                </a>
                <button
                  onClick={() => { setUrl(''); setStatus({ type: 'idle' }); }}
                  className="w-full py-3 bg-transparent border border-orange-900/40 text-gray-400 font-cormorant text-lg rounded-lg hover:bg-orange-900/20 hover:text-orange-300 transition-all italic"
                >
                  Extract Another Link
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
