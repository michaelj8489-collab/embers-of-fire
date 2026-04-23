'use client';

import React, { useState } from 'react';

export default function SmuleSniffer() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCapture = async () => {
    if (!url) return;
    setLoading(true);
    setMessage('📡 Initiating Stealth Interception...');

    try {
      const response = await fetch('/api/smule-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('BOOM! Signal caught. Extracting media...');
        
        // This is the "IT Specialist" magic: 
        // We create an invisible link to trigger the browser download
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        
        // We use the suggested name from our API (e.g., Smule_Capture_12345.mp4)
        link.setAttribute('download', data.suggestedName || 'Smule_Recording.mp4');
        link.setAttribute('target', '_blank'); // Safety for cross-origin signals
        
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        setMessage('SUCCESS: Asset safely stored in your local vault.');
      } else {
        // If Smule ghosted us, we tell the user exactly what the spy heard
        setMessage(`RECON FAILURE: ${data.error || 'Signal lost in transmission.'}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('CRITICAL ERROR: Cloud frequency disconnected. Try hitting it again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-black/60 backdrop-blur-md border border-orange-900/30 p-10 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden font-cormorant">
      {/* The Iconic Rise Radio Orange Accent */}
      <div className="absolute top-0 left-0 w-1 h-full bg-orange-600"></div>

      <div className="flex flex-col gap-8">
        <div className="space-y-2">
          <h3 className="font-cinzel text-orange-500 text-xl md:text-2xl tracking-widest uppercase">
            Signal Sniffer
          </h3>
          <p className="text-gray-400 text-lg italic">
            Extract high-fidelity audio and video for the Rise Radio frequency.
          </p>
        </div>

        <div className="relative group">
          <input
            type="text"
            className="w-full p-5 bg-black/40 border border-orange-900/40 rounded-2xl text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-orange-500 transition-all text-lg italic"
            placeholder="Paste Smule link here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          onClick={handleCapture}
          disabled={loading}
          className={`w-full py-6 rounded-full font-cinzel text-xl tracking-[0.2em] transition-all uppercase font-bold shadow-[0_0_30px_rgba(234,88,12,0.2)] ${
            loading 
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50' 
              : 'bg-gradient-to-r from-orange-700 to-red-700 text-white hover:scale-[1.02] active:scale-95 cursor-pointer'
          }`}
        >
          {loading ? '🛰️ Intercepting...' : 'Capture for Show'}
        </button>

        {message && (
          <div className={`mt-4 p-4 rounded-xl text-center font-cinzel tracking-widest uppercase text-sm animate-pulse ${
            message.includes('ERROR') || message.includes('FAILURE') 
              ? 'text-red-500 bg-red-950/20 border border-red-900/30' 
              : 'text-orange-400 bg-orange-950/20 border border-orange-900/30'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}