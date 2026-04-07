'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation'; // <-- The digital usher!
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter(); // <-- Activating the usher
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // SUCCESS! Send them to the Sanctuary!
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-public\images\jmc-edits-palettes\phoenix-ascended.png text-gray-200 flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-900 border border-orange-900/50 rounded-xl p-8 shadow-[0_0_30px_rgba(234,88,12,0.1)]">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-6 text-center uppercase tracking-widest">
            Enter the Hub
          </h1>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-gray-700 text-white rounded px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-gray-700 text-white rounded px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-500 hover:to-red-600 text-white font-bold py-3 px-4 rounded transition-all transform hover:scale-[1.02] shadow-lg shadow-orange-900/50 uppercase tracking-widest disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Enter the Hub'}
            </button>
          </form>

          <div className="mt-6 text-center text-gray-400 text-sm">
            Not a Seeker yet? <Link href="/signup" className="text-orange-500 hover:text-orange-400 font-semibold ml-1">Join the Frequency</Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}