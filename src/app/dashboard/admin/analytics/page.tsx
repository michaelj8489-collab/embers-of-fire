import { redirect } from 'next/navigation';
import { createClient as createSupabaseServerClient } from '@/utils/supabase/server';
import AnalyticsDashboardClient from './AnalyticsDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?returnTo=/dashboard/admin/analytics');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') redirect('/dashboard');

  return <AnalyticsDashboardClient />;
}
