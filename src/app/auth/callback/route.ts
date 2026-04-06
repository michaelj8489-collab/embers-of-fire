import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  // Grab the secret link from the email
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // If there is a code, use our new Server Bridge to verify it with Supabase
  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Once verified, instantly redirect the user to your main homepage
  return NextResponse.redirect(`${origin}/`)
}
