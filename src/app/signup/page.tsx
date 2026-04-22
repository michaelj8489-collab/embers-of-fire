'use client';
import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          username: username,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('SUCCESS! Check your email to verify your account.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-cinzel">
      <Header />
      <main className="max-w-md mx-auto pt-32 pb-20 px-6">
        <div className="bg-orange-900/10 border border-orange-500/30 p-8 rounded-lg backdrop-blur-sm">
          <h1 className="text-3xl text-orange-500 mb-6 text-center tracking-widest uppercase">Become a Seeker</h1>
          <form onSubmit={handleSignup} className="space-y-4 font-cormorant text-lg">
            <input type="text" placeholder="First Name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-black border border-orange-900/50 p-2 text-white outline-none focus:border-orange-500" />
            <input type="text" placeholder="Last Name" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-black border border-orange-900/50 p-2 text-white outline-none focus:border-orange-500" />
            <input type="text" placeholder="Sanctuary Username" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-black border border-orange-900/50 p-2 text-white outline-none focus:border-orange-500" />
            <hr className="border-orange-900/30 my-4" />
            <input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black border border-orange-900/50 p-2 text-white outline-none focus:border-orange-500" />
            <input type="password" placeholder="Create Password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black border border-orange-900/50 p-2 text-white outline-none focus:border-orange-500" />
            <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-500 hover:to-red-600 text-white font-bold py-3 transition-all transform hover:-translate-y-1 mt-4 uppercase tracking-widest">
              {isLoading ? 'Processing...' : 'Ignite the Spark'}
            </button>
          </form>
          {message && <p className="mt-6 text-center text-orange-400 font-bold border border-orange-400/20 p-4">{message}</p>}
        </div>
      </main>
      <Footer />
    </div>
  );
}