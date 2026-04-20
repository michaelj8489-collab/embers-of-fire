'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function SanctuaryRedirect() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleRedirect = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 1. Get the user's tier from their metadata (default to 'seeker')
      // If you have a 'tier' column in your profiles table, you'd fetch it here.
      const tier = user?.user_metadata?.tier || 'seeker';

      // 2. Teleport them to the correct dynamic folder immediately
      // This ensures they hit the [tier]/page.tsx where your admin logic lives!
      router.replace(`/sanctuary/${tier}`);
    };

    handleRedirect();
  }, [router, supabase]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-pulse font-cinzel text-orange-500 tracking-widest">
        CONSULTING THE ARCHIVES...
      </div>
    </div>
  );
}