'use client';

import React, { useState } from 'react';

export default function SmuleSniffer() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

 const handleCapture = async () => {
  if (!url) return;
  setLoading(true);
  setMessage('Initializing Cloud Interception...');

  try {
    // NO MORE TUNNEL URL - We call our own API route directly
    const response = await fetch('/api/smule-capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    const data = await response.json();
    // ... rest of the code stays exactly the same

      if (data.success) {
        setMessage('BOOM! Signal caught. Starting download...');
        
        // Use the local proxy to rename the file correctly
        const proxyUrl = `/api/download?url=${encodeURIComponent(data.downloadUrl)}&filename=${encodeURIComponent(data.fileName)}`;
        
        const link = document.createElement('a');
        link.href = proxyUrl;
        link.setAttribute('download', data.fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('The sniffer hit a snag. Is your local terminal running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-black/60 backdrop-blur-md border border-orange-900/30 p-10 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden font-cormorant">
      {/* The Orange Accent Line from your dashboard */}
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
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-orange-700 to-red-700 text-white hover:scale-[1.02] active:scale-95'
          }`}
        >
          {loading ? '🛰️ Intercepting Signal...' : 'Capture for Show'}
        </button>

        {message && (
          <div className={`mt-4 p-4 rounded-xl text-center font-cinzel tracking-widest uppercase text-sm ${
            message.includes('Error') || message.includes('snag') ? 'text-red-500 bg-red-950/20' : 'text-orange-400 bg-orange-950/20'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}