'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div 
      className="min-h-screen text-gray-200 flex flex-col font-cormorant relative bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/images/jmc-edits-palettes/phoenix-bg.png')" }}
    >
      <div className="absolute inset-0 bg-black/80 z-0 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-black/60 backdrop-blur-sm border border-orange-900/50 rounded-xl p-8 shadow-[0_0_30px_rgba(234,88,12,0.15)]">
            
            <h1 className="font-cinzel-decorative text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-8 text-center uppercase tracking-widest">
              Enter The Hub
            </h1>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1 font-cinzel tracking-wider uppercase">
                  Email
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-orange-900/30 rounded px-4 py-2 text-gray-200 focus:outline-none focus:border-orange-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1 font-cinzel tracking-wider uppercase">
                  Password
                </label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-orange-900/30 rounded px-4 py-2 text-gray-200 focus:outline-none focus:border-orange-500 transition-colors"
                  required
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm font-sans text-center bg-red-900/20 border border-red-900/50 rounded p-2">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-3 px-4 rounded transition-all font-cinzel tracking-widest mt-4 disabled:opacity-50"
              >
                {loading ? 'ENTERING...' : 'ENTER THE HUB'}
              </button>

              <div className="text-center mt-6 text-gray-400 text-sm">
                Not a Seeker yet?{' '}
                <a href="/signup" className="text-orange-500 hover:text-orange-400 transition-colors">
                  Join the Frequency
                </a>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}