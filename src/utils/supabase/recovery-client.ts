import 'client-only'

import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'

let recoveryClient: SupabaseClient | null = null

export function createRecoveryClient(): SupabaseClient {
  recoveryClient ??= createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'implicit',
        detectSessionInUrl: true,
        persistSession: true,
        storageKey: 'embers-password-recovery',
      },
    }
  )

  return recoveryClient
}
