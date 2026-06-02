'use client';

import React, { useState } from 'react';

export default function StarMakerScraper() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', msg?: string, fileUrl?: string, filename?: string }>({ type: 'idle' });

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

  return (
    <section className="bg-zinc-900/50 p-8 rounded-2xl border border-orange-900/30 backdrop-blur-md shadow-2xl my-12">
      <h2 className="text-sm text-orange-400 mb-4 tracking-[0.2em] uppercase font-bold">
        StarMaker Extractor
      </h2>
      <p className="text-gray-300 font-cormorant text-lg mb-6 italic">
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
            className="w-full bg-black border border-orange-500/30 p-4 rounded-lg text-white font-cormorant text-lg placeholder-gray-600 outline-none focus:border-orange-500 transition-colors"
          />
          <button
            type="submit"
            disabled={status.type === 'loading'}
            className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-800 rounded-lg font-bold hover:scale-[1.01] transition-transform shadow-[0_0_20px_rgba(255,100,0,0.2)] active:scale-95 text-white disabled:opacity-70 flex justify-center items-center gap-3 uppercase tracking-wider"
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
        <div className="mt-4 p-4 rounded-lg bg-red-900/20 border border-red-500/40 text-red-400 font-cormorant text-lg">
          <span className="text-red-500 font-bold mr-2 text-sm">◆</span>
          {status.msg}
        </div>
      )}

      {status.type === 'success' && (
        <div className="mt-6 pt-6 border-t border-orange-900/30 text-center">
          <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/30 text-orange-500 rounded-full flex justify-center items-center text-2xl mx-auto mb-4">
            ✓
          </div>
          <h3 className="text-xl font-cinzel font-bold text-orange-500 mb-2 tracking-wider uppercase">File Recovered</h3>
          <p className="text-gray-300 font-cormorant text-base mb-6 break-all italic">{status.filename}</p>
          
          <a
            href={status.fileUrl}
            download={status.filename}
            className="block w-full py-3 text-center text-white text-lg font-cinzel font-bold rounded-lg transition-all bg-gradient-to-br from-green-600 to-emerald-800 hover:scale-[1.01] active:scale-95 mb-4 uppercase tracking-wider"
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
    </section>
  );
}
