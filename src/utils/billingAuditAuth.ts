import 'server-only';

import type { User } from '@supabase/supabase-js';
import { createClient as createSupabaseServerClient } from '@/utils/supabase/server';
import { createSupabaseServiceRoleClient } from '@/utils/api/security';

export type BillingAuditAccessState =
  | { status: 'unauthenticated' }
  | { status: 'forbidden' }
  | { status: 'error'; message: string }
  | {
      status: 'allowed';
      user: User;
      currentLevel: 'aal1' | 'aal2' | null;
      nextLevel: 'aal1' | 'aal2' | null;
      hasVerifiedTotp: boolean;
    };

export async function getBillingAuditAccessState(): Promise<BillingAuditAccessState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { status: 'unauthenticated' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('billing-audit: profile authorization lookup failed.', {
      code: profileError.code,
      message: profileError.message,
    });
    return { status: 'error', message: 'Unable to verify billing audit permissions.' };
  }

  if (!profile || profile.role !== 'admin') {
    return { status: 'forbidden' };
  }

  const serviceRole = createSupabaseServiceRoleClient();
  if (!serviceRole.ok) {
    return { status: 'error', message: 'Billing audit authorization is not configured.' };
  }

  const { data: allowlistRow, error: allowlistError } = await serviceRole.client
    .from('billing_audit_access')
    .select('user_id, enabled')
    .eq('user_id', user.id)
    .eq('enabled', true)
    .maybeSingle();

  if (allowlistError) {
    console.error('billing-audit: allowlist lookup failed.', {
      code: allowlistError.code,
      message: allowlistError.message,
    });
    return { status: 'error', message: 'Unable to verify billing audit permissions.' };
  }

  if (!allowlistRow) {
    return { status: 'forbidden' };
  }

  const [{ data: aal, error: aalError }, { data: factors, error: factorsError }] = await Promise.all([
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    supabase.auth.mfa.listFactors(),
  ]);

  if (aalError || factorsError) {
    console.error('billing-audit: MFA state lookup failed.', {
      aalError: aalError?.message,
      factorsError: factorsError?.message,
    });
    return { status: 'error', message: 'Unable to verify multi-factor authentication status.' };
  }

  const hasVerifiedTotp = Boolean(
    factors?.totp?.some((factor) => factor.status === 'verified')
  );

  return {
    status: 'allowed',
    user,
    currentLevel: aal?.currentLevel ?? null,
    nextLevel: aal?.nextLevel ?? null,
    hasVerifiedTotp,
  };
}
