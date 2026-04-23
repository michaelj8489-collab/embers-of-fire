import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import SmuleSniffer from '@/components/SmuleSniffer';

export default async function AdminSnifferPage() {
  /* --- LOCAL BYPASS START ---*/
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }
  /*--- LOCAL BYPASS END --- */

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="mb-8 text-center border-b border-zinc-800 pb-8">
        <h1 className="text-4xl font-bold text-white">Admin Command Center</h1>
        <p className="text-red-500 font-bold mt-2 uppercase tracking-widest">
          ⚠️ Local Bypass Active
        </p>
      </div>
      
      <div className="mt-8">
        <SmuleSniffer />
      </div>
    </div>
  );
}
  