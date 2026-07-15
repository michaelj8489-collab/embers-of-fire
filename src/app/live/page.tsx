'use client';

import React, { useState, useEffect } from 'react';
import GlobalZenoPlayer from '@/components/GlobalZenoPlayer';
import { buildTwitchChatSrc, buildTwitchPlayerSrc } from '@/utils/twitchEmbed';

export default function LivePage() {
  const [liveSession, setLiveSession] = useState<LiveSessionSummary | null>(null);
  const [statusUnavailable, setStatusUnavailable] = useState(false);
  const [parentDomain] = useState(() =>
    typeof window === 'undefined' ? '' : window.location.hostname
  );

  useEffect(() => {
    let cancelled = false;

    const loadLiveStatus = async () => {
      try {
        const response = await fetch('/api/show-live', { cache: 'no-store' });
        const data = (await response.json()) as LiveStatusResponse;

        if (cancelled) return;

        if (!response.ok || !data.success) {
          setLiveSession(null);
          setStatusUnavailable(true);
          return;
        }

        setStatusUnavailable(data.unavailable);
        setLiveSession(data.activeSessions[0] ?? null);
      } catch {
        if (!cancelled) {
          setLiveSession(null);
          setStatusUnavailable(true);
        }
      }
    };

    void loadLiveStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  const twitchChannel = liveSession?.twitchChannel;

  return (
    <main className="min-h-screen bg-black pt-24 pb-32 px-4 flex flex-col items-center overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto space-y-12">
        
        {/* 1. ZENO PLAYER (Pinned at the top for quick audio access) */}
        <div className="w-full">
          <GlobalZenoPlayer />
        </div>

        {/* 2. TWITCH BROADCAST */}
        <div className="w-full border border-orange-900/50 rounded-xl overflow-hidden shadow-2xl bg-black relative md:h-[600px]">
          {twitchChannel ? (
            <div className="flex flex-col md:flex-row w-full h-full">
              {/* VIDEO */}
              <iframe 
                src={buildTwitchPlayerSrc(twitchChannel, parentDomain, { autoplay: true })}
                title={`${liveSession.showName} Twitch player`}
                className="w-full aspect-video md:aspect-auto md:flex-grow md:h-full" 
                frameBorder="0"
                allow="autoplay; fullscreen"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
              
              {/* CHAT */}
              <iframe 
                src={buildTwitchChatSrc(twitchChannel, parentDomain)}
                title={`${liveSession.showName} Twitch chat`}
                className="w-full h-[400px] md:w-[350px] md:h-full border-t md:border-l border-orange-900/30" 
                frameBorder="0"
                referrerPolicy="strict-origin-when-cross-origin"
              ></iframe>
            </div>
          ) : (
            <div className="w-full h-full aspect-video md:aspect-auto flex items-center justify-center bg-gradient-to-br from-orange-950/20 via-black to-black relative">
               <div className="absolute w-64 h-64 bg-orange-600/5 rounded-full blur-[100px]"></div>
               <div className="relative z-10 font-cinzel text-orange-500/80 text-sm md:text-xl tracking-[0.5em] uppercase animate-pulse text-center px-6">
                  {liveSession
                    ? `${liveSession.showName} is live outside Twitch`
                    : statusUnavailable
                      ? 'Live Status Unavailable'
                      : 'Broadcast Resting'}
               </div>
            </div>
          )}
        </div>
        
      </div>
    </main>
  );
}

type LiveSessionSummary = {
  id: string;
  showName: string;
  twitchChannel: string | null;
};

type LiveStatusResponse =
  | {
      success: true;
      unavailable: boolean;
      activeSessions: LiveSessionSummary[];
    }
  | {
      success: false;
      error: string;
    };
