import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tier = searchParams.get('checkout'); 
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    // This is the moment where the "link" is used up
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // We pass the checkout tier forward as a URL parameter
      const redirectUrl = tier 
        ? `${origin}${next}?trigger_checkout=${tier}` 
        : `${origin}${next}`;

      return NextResponse.redirect(redirectUrl);
    }
  }

  // If the link was "pre-clicked" by an iPhone, it might land here.
  // We send them to the login page but keep the checkout tier in the URL
  // so once they log in manually, the dashboard can still trigger Stripe.
  const errorRedirect = tier 
    ? `${origin}/login?trigger_checkout=${tier}&error=link-handled`
    : `${origin}/login?error=link-handled`;

  return NextResponse.redirect(errorRedirect);
}