'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const TARGET_DATE = new Date('2026-07-02T11:00:00-04:00').getTime(); // July 2, 2026, 11:00 AM EDT (Eastern)

export default function FoundersDayBlock() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = TARGET_DATE - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft(); // Initial calculation
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-7xl relative rounded-[2.5rem] overflow-hidden shadow-2xl mb-12 border border-orange-500/30">
      
      {/* VIDEO BACKGROUND */}
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-80 z-0">
        <source src="/images/jmc-edits-palettes/raise-the-phoenix.mp4" type="video/mp4" />
      </video>
      
      {/* OVERLAY TO MAKE TEXT READABLE */}
      <div className="absolute inset-0 bg-black/75 z-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-0" />

      <div className="relative z-10 p-8 md:p-16 flex flex-col items-center text-center">
        
        {/* COUNTDOWN TIMER */}
        <h2 className="text-2xl md:text-3xl font-cinzel text-orange-500 mb-6 tracking-[0.2em] uppercase drop-shadow-[0_0_15px_rgba(234,88,12,0.8)]">
          Founder's Day Starts In
        </h2>
        
        <div className="flex gap-4 md:gap-8 mb-12">
          {/* Prevent hydration mismatch by only showing timer when mounted */}
          {isMounted ? (
            <>
              <TimeBox value={timeLeft.days} label="Days" />
              <TimeBox value={timeLeft.hours} label="Hours" />
              <TimeBox value={timeLeft.minutes} label="Mins" />
              <TimeBox value={timeLeft.seconds} label="Secs" />
            </>
          ) : (
            <>
              <TimeBox value={0} label="Days" />
              <TimeBox value={0} label="Hours" />
              <TimeBox value={0} label="Mins" />
              <TimeBox value={0} label="Secs" />
            </>
          )}
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent mb-12"></div>

        {/* FEED THE FIRE SECTION REWORKED */}
        <h3 className="text-3xl md:text-5xl font-cinzel text-orange-400 mb-6 tracking-widest uppercase drop-shadow-[0_0_15px_rgba(234,88,12,0.5)]">
          Feed the Fire
        </h3>
        
        <p className="text-lg md:text-2xl font-cormorant text-gray-200 max-w-4xl mb-10 leading-relaxed italic drop-shadow-md">
          Founder's Day is more than just a celebration—it's the fuel that keeps our sanctuary glowing. Our yearly Zeno broadcasting subscription is due, and we rely entirely on the generosity of our community to keep the station on the air without interruption. No matter how great or small, every contribution helps us keep the embers burning through the night and gives independent voices a stage to stand on.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 w-full justify-center mt-4">
          {/* Cash App Option */}
          <div className="flex flex-col items-center p-6 border border-emerald-500/50 rounded-xl bg-black/60 w-full max-w-xs shadow-[0_0_15px_rgba(16,185,129,0.15)] backdrop-blur-sm">
            <h3 className="text-xl font-cinzel text-emerald-400 mb-3">Cash App</h3>
            <div className="bg-black px-4 py-3 rounded-lg font-mono text-emerald-300 border border-emerald-500/30 w-full text-center tracking-wider text-lg">
              $Brindlewolf
            </div>
            <p className="text-xs text-gray-400 mt-3 uppercase tracking-wide font-cinzel">Listed as Michka Grant</p>
          </div>

          {/* Venmo Option */}
          <div className="flex flex-col items-center p-6 border border-sky-500/50 rounded-xl bg-black/60 w-full max-w-xs shadow-[0_0_15px_rgba(14,165,233,0.15)] backdrop-blur-sm">
            <h3 className="text-xl font-cinzel text-sky-400 mb-3">Venmo</h3>
            <div className="bg-black px-4 py-3 rounded-lg font-mono text-sky-300 border border-sky-500/30 w-full text-center tracking-wider text-lg">
              @Brindlewolf
            </div>
            <p className="text-xs text-gray-400 mt-3 uppercase tracking-wide font-cinzel">Listed as Shawn Grant</p>
          </div>
        </div>

      </div>
    </div>
  );
}

// Subcomponent for the countdown boxes
function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-black/60 border border-orange-500/40 rounded-xl w-16 h-16 md:w-24 md:h-24 flex items-center justify-center backdrop-blur-md shadow-[0_0_20px_rgba(234,88,12,0.2)]">
        <span className="text-3xl md:text-5xl font-bold font-cinzel text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-orange-400 font-cinzel text-[10px] md:text-sm mt-3 uppercase tracking-widest font-bold">
        {label}
      </span>
    </div>
  );
}
