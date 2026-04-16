'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function LoginPage() {
  return (
    <div className="min-h-screen relative bg-black text-white flex flex-col">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: "url('/images/main-images/login-bg.jpg')" }} // Update to your login bg path
      />

      <Header />

      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 pt-20">
        <div className="w-full max-w-md flex flex-col items-center">
          
          {/* THE HOVERING PHOENIX - Higher Z-Index and negative margin to overlap */}
          <div className="relative z-20 -mb-16 md:-mb-20 transition-transform hover:scale-105 duration-500">
            <img 
              src="/public/images/phoenix-revived.mp4" 
              alt="Rise Phoenix" 
              className="w-48 md:w-64 h-auto drop-shadow-[0_0_30px_rgba(234,88,12,0.6)]"
            />
          </div>

          {/* LOGIN BOX */}
          <div className="relative z-10 w-full bg-zinc-900/80 backdrop-blur-xl border border-orange-500/30 p-8 pt-20 md:pt-24 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <h2 className="font-cinzel text-2xl text-center text-orange-500 tracking-widest uppercase mb-8">
              Portal Access
            </h2>
            
            {/* Insert your existing Supabase/Auth UI Component here */}
            <div className="space-y-4">
               {/* Example Inputs */}
               <input type="email" placeholder="Email" className="w-full bg-black/50 border border-zinc-700 p-3 rounded-lg focus:border-orange-500 outline-none transition-colors" />
               <button className="w-full bg-gradient-to-r from-orange-600 to-red-700 p-3 rounded-lg font-cinzel tracking-widest uppercase hover:brightness-110 transition-all">Enter Sanctuary</button>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}