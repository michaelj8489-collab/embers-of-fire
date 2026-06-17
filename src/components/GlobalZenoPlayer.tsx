'use client';

import React, { useState } from 'react';

const STATIONS = [
  { id: 'rise-radio-woqo', name: 'Rise Radio Main' },
  { id: 'rise-awakenings', name: 'Rise Awakenings' },
  { id: 'rise-frequencies', name: 'Rise Frequencies' }
];

interface GlobalZenoPlayerProps {
  className?: string; // Allow custom styling
}

export default function GlobalZenoPlayer({ className = '' }: GlobalZenoPlayerProps) {
  const [selectedStation, setSelectedStation] = useState(STATIONS[0].id);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Main Player */}
      <div className={`flex flex-col w-full bg-black rounded-lg overflow-hidden border border-orange-900/30 shadow-xl ${className}`}>
        {/* Dropdown Header */}
        <div className="flex-none bg-zinc-900/80 border-b border-orange-900/50 p-1.5 flex justify-between items-center px-2">
          <label className="text-[10px] md:text-xs text-orange-500 font-cinzel font-bold tracking-widest uppercase hidden sm:block">
            Select Station:
          </label>
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="w-full sm:w-auto flex-1 sm:flex-none bg-black border border-orange-500/30 rounded px-2 py-1 text-gray-200 font-cinzel text-xs md:text-sm uppercase tracking-widest outline-none focus:border-orange-500 transition-colors ml-0 sm:ml-2"
          >
            {STATIONS.map((station) => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Player Frame: Ensures enough height on mobile so the play button isn't squished */}
        <div className="w-full h-[120px] md:h-[160px] bg-black relative">
          <iframe 
            src={`https://zeno.fm/player/${selectedStation}`} 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            scrolling="no" 
            className="absolute inset-0 w-full h-full"
          ></iframe>
        </div>
      </div>

      {/* Rise Awakenings Secondary Player */}
      <div className={`flex flex-col w-full bg-black rounded-lg overflow-hidden border border-orange-900/30 shadow-xl ${className}`}>
        <div className="flex-none bg-zinc-900/80 border-b border-orange-900/50 p-1.5 flex justify-between items-center px-2">
          <label className="text-[10px] md:text-xs text-orange-500 font-cinzel font-bold tracking-widest uppercase">
            Rise Awakenings
          </label>
        </div>
        <div className="w-full h-[120px] md:h-[160px] bg-black relative">
          <iframe 
            src="https://zeno.fm/player/hvh0vw6jdowtv" 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            scrolling="no" 
            className="absolute inset-0 w-full h-full"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
