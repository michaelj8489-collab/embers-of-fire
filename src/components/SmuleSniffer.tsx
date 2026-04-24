'use client';

import { supabase } from '@/utils/supabase';
import React, { useState } from 'react';

interface CaptureHistory {
  id: string;
  name: string;
  url: string;
  timestamp: string;
}

export default function SmuleSniffer() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [label, setLabel] = useState('');
  const [history, setHistory] = useState<CaptureHistory[]>([]);

  // This is the "Brain" — it runs once as soon as the page loads
  React.useEffect(() => {
    const loadVault = async () => {
      // We grab the last 10 interceptions from the database
      
      const { data, error } = await supabase
        .from('sniffer_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Vault access error:', error);
      } else if (data) {
        setHistory(data);
      }
    };

    loadVault();
  }, []);

  const handleCapture = async () => {
    if (!url) return;
    setLoading(true);
    setMessage('📡 Initiating Stealth Interception...');

    try {
      const response = await fetch('/api/smule-capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, label }) // <--- Make sure "label" is inside these braces
    });

      const data = await response.json();

      if (data.success) {
        setMessage('BOOM! Signal caught. Extracting media...');
        
        const fileName = data.suggestedName || `Smule_Capture_${Date.now()}.mp4`;
        
        // Trigger the download
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.setAttribute('download', fileName);
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        link.remove();

        // Update the "Trophy Room"
        const newCapture = {
          id: Math.random().toString(36).substr(2, 9),
          name: fileName,
          url: data.downloadUrl,
          timestamp: new Date().toLocaleTimeString(),
        };
        setHistory((prev) => [newCapture, ...prev]);
        
        setMessage('SUCCESS: Asset safely stored.');
      } else {
        setMessage(`RECON FAILURE: ${data.error}`);
      }
    } catch (err) {
      setMessage('CRITICAL ERROR: Cloud frequency disconnected.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto">
      {/* THE MAIN SNIFFER BOX */}
      <div className="bg-black/60 backdrop-blur-md border border-orange-900/30 p-10 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden font-cormorant">
        <div className="absolute top-0 left-0 w-0 h-full bg-orange-600"></div>

        <div className="flex flex-col gap-10">
          <div className="space-y-2">
            <h3 className="font-cinzel text-orange-500 text-xxl md:text-2xl tracking-widest uppercase">
              Signal Sniffer
            </h3>
            {/* --- UPDATED PROTOCOL INSTRUCTIONS --- */}
              <div className="bg-orange-950/20 border border-orange-900/30 p-6 rounded-2xl mb-6 animate-in fade-in slide-in-from-top-4 duration-1000">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-orange-500">🛰️</span>
                  <h4 className="font-cinzel text-orange-500 text-sm tracking-[0.2em] uppercase font-bold"> Signal Interception Protocol</h4>
              </div>
  
              <div className="font-cormorant text-gray-300 space-y-3 text-xl italic leading-tight">
                <p>1. Enter the <span className="text-orange-400">Song Name</span>, then paste the Smule link. </p>
                <p>2. If the signal is "Cloaked," hit the button again. This "primes" the server.</p>
                <p> 3. <span className="text-white font-bold underline">Maximum Attempts: 5.</span> If the file does not appear in the Archive after 5 clicks, the signal may be heavily encrypted.</p>
                <div className="pt-4 border-t border-orange-900/20">
                <p className="text-lg italic text-zinc-500 uppercase tracking-[0.1em]"> Failed after 5 attempts? Contact <span className="text-zinc-300">Michael J.</span> for Admin Support.</p>
                </div>
              </div>
            </div>
             <p className="text-gray-400 text-lg italic"> Extract high-fidelity audio and video for the Rise Radio frequency.</p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
        
              {/* NEW: LABEL INPUT */}
                <input type="text" className="w-full p-5 bg-black/40 border border-orange-900/40 rounded-2xl text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-orange-500 transition-all text-lg" placeholder="Enter Song Title/Singer Name (e.g. Empty Memory)..." value={label} onChange={(e) => setLabel(e.target.value)}/>

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
                : 'bg-gradient-to-r from-orange-700 to-red-700 text-white hover:scale-[1.02] active:scale-95'
            }`}
          >
            {loading ? '🛰️ Intercepting...' : 'Capture for Show'}
          </button>

          {message && (
            <div className={`mt-4 p-4 rounded-xl text-center font-cinzel tracking-widest uppercase text-sm ${
              message.includes('FAILURE') ? 'text-red-500 bg-red-950/20' : 'text-orange-400 bg-orange-950/20'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>

      {/* THE TROPHY ROOM (Gallery) */}
      {history.length > 0 && (
        <div className="bg-black/40 backdrop-blur-sm border border-zinc-900/50 p-8 rounded-[2rem] animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h4 className="font-cinzel text-zinc-500 text-sm tracking-[0.3em] uppercase mb-6 border-b border-zinc-800 pb-2">
            Recent Interceptions
          </h4>
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-xl border border-zinc-900 hover:border-orange-900/30 transition-colors group">
                <div className="flex flex-col">
                  <span className="text-zinc-300 font-medium truncate max-w-[200px] md:max-w-md">
                    {item.name}
                  </span>
                  <span className="text-zinc-600 text-xs uppercase tracking-tighter">
                    Logged at {item.timestamp}
                  </span>
                </div>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-orange-600 hover:text-orange-400 text-xs font-cinzel uppercase tracking-widest transition-colors"
                >
                  Re-Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}    
    
       </div>
  );
} 