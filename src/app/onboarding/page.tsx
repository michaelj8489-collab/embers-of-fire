'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  
  // State for all our fields
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [smuleUsername, setSmuleUsername] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  // 1. Grab the user's ID and Email on load
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        setEmail(session.user.email ?? '');
      } else {
        router.push('/signup');
      }
    };
    getUser();
  }, [router, supabase]);

  // 2. Handle the Form Submission
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!userId || !email) return;

    const { error } = await supabase
      .from('profiles')
      .insert([
        { 
          id: userId, 
          email: email, 
          username: username,
          first_name: firstName,
          last_name: lastName,
          // If they leave Smule blank, send null to the database instead of an empty string
          smule_username: smuleUsername || null, 
          subscription_tier: 'seeker' 
        }
      ]);

    setLoading(false);

    if (error) {
      console.error('Error saving profile:', error);
      alert('There was an issue saving your profile. Please try again.');
    } else {
      // Send them to the checkout/membership page!
      router.push('/membership'); 
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-orange-500/30 p-8 rounded-xl shadow-[0_0_15px_rgba(234,88,12,0.1)]">
        <h1 className="text-3xl font-cinzel text-orange-500 mb-2 text-center">Complete Your Profile</h1>
        <p className="text-gray-400 text-sm mb-6 text-center">
          Before you enter the Sanctuary, let's get your credentials forged.
        </p>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          
          {/* First & Last Name side-by-side */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-300 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:border-orange-500"
                placeholder="First"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:border-orange-500"
                placeholder="Last"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Sanctuary Username *</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:border-orange-500"
              placeholder="e.g. RadioListener99"
            />
            <p className="text-xs text-gray-500 mt-1">This is how you will appear in the live chats.</p>
          </div>

          {/* Smule Username (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Smule ID <span className="text-gray-500 font-normal">(Optional)</span></label>
            <input
              type="text"
              value={smuleUsername}
              onChange={(e) => setSmuleUsername(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:border-orange-500"
              placeholder="@SmuleSinger"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3 px-4 rounded-md hover:scale-[1.02] transition-transform flex justify-center items-center mt-4"
          >
            {loading ? 'Forging Profile...' : 'Enter the Sanctuary'}
          </button>
        </form>
      </div>
    </div>
  );
}