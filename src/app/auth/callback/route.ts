import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // 🚀 NEW: Grab the "next" parameter from the URL (e.g., /reset-password)
  // If it's not there, default to /dashboard
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 🚀 REDIRECT: Send them to the "next" page instead of a hardcoded one
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If something goes wrong, send them to an error page or back to login
  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`)
}