'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("The sparks don't match—passwords must be identical.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Your new password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      alert('Password updated successfully! Igniting the signal...');
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center py-24 px-4 font-cormorant text-gray-200">
      <video autoPlay loop muted playsInline className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none">
         <source src="/images/phoenix-revived.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-black/80 z-10 pointer-events-none"></div>

      <div className="relative z-20 flex flex-col items-center bg-black/60 p-8 rounded-xl border border-orange-900/50 shadow-[0_0_30px_rgba(0,0,0,0.8)] w-full max-w-md">
        <h1 className="font-cinzel-decorative text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-8 tracking-widest text-center uppercase">
          Forge a New Password
        </h1>

        {error && <p className="text-red-500 mb-4 font-cinzel text-sm text-center uppercase">{error}</p>}

        <form onSubmit={handleUpdatePassword} className="w-full flex flex-col gap-5">
          <div className="flex flex-col text-left">
            <label className="block text-sm font-medium text-gray-400 mb-1 font-cinzel uppercase tracking-wider">
              New Password
            </label>
            <input
              className="p-3 rounded bg-gray-900/80 text-white border border-orange-900/50 focus:border-orange-500 outline-none w-full font-cormorant text-xl"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col text-left">
            <label className="block text-sm font-medium text-gray-400 mb-1 font-cinzel uppercase tracking-wider">
              Confirm New Password
            </label>
            <input
              className="p-3 rounded bg-gray-900/80 text-white border border-orange-900/50 focus:border-orange-500 outline-none w-full font-cormorant text-xl"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-3 rounded transition-all font-cinzel tracking-widest uppercase disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'UPDATE PASSWORD'}
          </button>
        </form>
      </div>
    </main>
  );
}