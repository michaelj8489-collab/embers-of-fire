import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    // FIX 1: cookies() is now async - adding 'await' kills the line 13 squiggle
    const cookieStore = await cookies()
    
    // FIX 2: Using new URL() kills the redirect squiggle
    const response = NextResponse.redirect(new URL('/dashboard', request.url))

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // @ts-ignore - Keeps the librarian quiet while we set cookies
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            // @ts-ignore - Keeps the librarian quiet
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return response
    }
  }

  // Final redirect back if something fails
  return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
}