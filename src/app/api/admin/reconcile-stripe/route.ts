import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  STRIPE_API_VERSION,
  createSupabaseServiceRoleClient,
  getRequiredEnv,
} from '@/utils/api/security';
import { getBillingAuditAccessState } from '@/utils/billingAuditAuth';
import { resolveSubscriptionMembership } from '@/utils/membership.server';

type ProfileRow = {
  id: string;
  email: string | null;
  role: string | null;
  subscription_tier: string | null;
  subscription_status: string | null;
};

type ExistingSubscriptionRow = {
  user_id: string;
  tier: string | null;
  status: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
};

type Candidate = {
  userId: string;
  email: string | null;
  tier: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripeStatus: string;
  periodEndIso: string | null;
  source: 'subscription_metadata' | 'local_subscription' | 'customer_metadata' | 'customer_email';
};

type StripeAuditSummary = {
  customerEmail: string | null;
  customerName: string | null;
  createdAt: string;
  currentPeriodEnd: string | null;
  items: Array<{
    priceId: string;
    priceNickname: string | null;
    productId: string | null;
    productName: string | null;
    unitAmount: number | null;
    currency: string;
    interval: string | null;
  }>;
};

export async function POST(req: Request) {
  const access = await getBillingAuditAccessState();
  if (access.status === 'unauthenticated') {
    return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });
  }
  if (access.status === 'forbidden') {
    return NextResponse.json({ success: false, error: 'Not found.' }, { status: 404 });
  }
  if (access.status === 'error') {
    return NextResponse.json({ success: false, error: access.message }, { status: 500 });
  }
  if (access.currentLevel !== 'aal2') {
    return NextResponse.json(
      { success: false, error: 'Authenticator verification is required for billing audit access.' },
      { status: 428 }
    );
  }

  let mode: 'dry-run' | 'apply' = 'dry-run';
  try {
    const body = (await req.json()) as { mode?: unknown };
    if (body.mode === 'apply') mode = 'apply';
  } catch {
    // Empty/invalid body intentionally defaults to a non-mutating dry run.
  }

  const stripeSecret = getRequiredEnv('STRIPE_SECRET_KEY');
  if (!stripeSecret.ok) {
    return NextResponse.json({ success: false, error: 'Stripe is not configured.' }, { status: 500 });
  }

  const adminClient = createSupabaseServiceRoleClient();
  if (!adminClient.ok) return adminClient.response;

  const stripe = new Stripe(stripeSecret.value, { apiVersion: STRIPE_API_VERSION });
  const supabase = adminClient.client;

  try {
    const subscriptions = await listAllStripeSubscriptions(stripe);
    const candidates: Candidate[] = [];
    const issues: Array<Record<string, unknown>> = [];
    const stripeLinkedProfileIds = new Set<string>();

    for (const subscription of subscriptions) {
      if (subscription.status !== 'active' && subscription.status !== 'trialing') continue;

      const linked = await resolveProfileForSubscription(stripe, supabase, subscription);
      if (!linked.profile) {
        issues.push({
          kind: 'unlinked_active_subscription',
          stripeSubscriptionId: subscription.id,
          stripeStatus: subscription.status,
          ...(await describeStripeSubscription(stripe, subscription)),
        });
        continue;
      }

      stripeLinkedProfileIds.add(linked.profile.id);

      const membership = resolveSubscriptionMembership(subscription, linked.profile.subscription_tier);
      if (membership.kind === 'configuration_error') {
        issues.push({
          kind: 'stripe_price_configuration_error',
          stripeSubscriptionId: subscription.id,
          userId: linked.profile.id,
          email: linked.profile.email,
          message: membership.error,
          ...(await describeStripeSubscription(stripe, subscription)),
        });
        continue;
      }
      if (membership.kind === 'unknown_price') {
        issues.push({
          kind: 'unsupported_or_unknown_membership_price',
          stripeSubscriptionId: subscription.id,
          userId: linked.profile.id,
          email: linked.profile.email,
          ...(await describeStripeSubscription(stripe, subscription)),
        });
        continue;
      }

      const customerId = stripeObjectId(subscription.customer);
      if (!customerId) {
        issues.push({
          kind: 'missing_stripe_customer',
          stripeSubscriptionId: subscription.id,
          userId: linked.profile.id,
          email: linked.profile.email,
          ...(await describeStripeSubscription(stripe, subscription)),
        });
        continue;
      }

      candidates.push({
        userId: linked.profile.id,
        email: linked.profile.email,
        tier: membership.tier,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripeStatus: subscription.status,
        periodEndIso: getSubscriptionPeriodEnd(subscription),
        source: linked.source,
      });
    }

    const candidatesByUser = new Map<string, Candidate[]>();
    for (const candidate of candidates) {
      const existing = candidatesByUser.get(candidate.userId) ?? [];
      existing.push(candidate);
      candidatesByUser.set(candidate.userId, existing);
    }

    const applied: Candidate[] = [];
    const proposed: Array<Candidate & { localState: ExistingSubscriptionRow | null }> = [];

    for (const [userId, userCandidates] of candidatesByUser) {
      if (userCandidates.length !== 1) {
        issues.push({
          kind: 'multiple_active_subscriptions_for_user',
          userId,
          stripeSubscriptionIds: userCandidates.map((candidate) => candidate.stripeSubscriptionId),
        });
        continue;
      }

      const candidate = userCandidates[0];
      const { data: localRow, error: localError } = await supabase
        .from('subscriptions')
        .select('user_id, tier, status, stripe_customer_id, stripe_subscription_id, current_period_end')
        .eq('user_id', userId)
        .maybeSingle();

      if (localError) throw new Error(`Unable to read local subscription for ${userId}: ${localError.message}`);

      proposed.push({ ...candidate, localState: localRow as ExistingSubscriptionRow | null });

      if (mode === 'apply') {
        const now = new Date().toISOString();
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            subscription_tier: candidate.tier,
            subscription_status: 'active',
            updated_at: now,
          })
          .eq('id', candidate.userId);
        if (profileError) throw new Error(`Profile backfill failed for ${candidate.userId}: ${profileError.message}`);

        const record: Record<string, string> = {
          user_id: candidate.userId,
          tier: candidate.tier,
          status: candidate.stripeStatus,
          stripe_customer_id: candidate.stripeCustomerId,
          stripe_subscription_id: candidate.stripeSubscriptionId,
          updated_at: now,
        };
        if (candidate.periodEndIso) record.current_period_end = candidate.periodEndIso;

        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .upsert(record, { onConflict: 'user_id' });
        if (subscriptionError) {
          throw new Error(`Subscription backfill failed for ${candidate.userId}: ${subscriptionError.message}`);
        }

        applied.push(candidate);
      }
    }

    const { data: activeProfiles, error: activeProfileError } = await supabase
      .from('profiles')
      .select('id, email, role, subscription_tier, subscription_status')
      .eq('subscription_status', 'active');
    if (activeProfileError) throw new Error(`Unable to audit active profiles: ${activeProfileError.message}`);

    const activeProfilesWithoutStripeMatch = ((activeProfiles ?? []) as ProfileRow[])
      .filter((profile) => profile.subscription_tier && profile.subscription_tier.toLowerCase() !== 'seeker')
      .filter((profile) => !stripeLinkedProfileIds.has(profile.id))
      .map((profile) => ({
        userId: profile.id,
        email: profile.email,
        role: profile.role,
        tier: profile.subscription_tier,
        status: profile.subscription_status,
        accessKind: profile.role === 'admin' ? 'manual_admin_or_staff' : 'unmatched_paid_profile',
      }));

    return NextResponse.json({
      success: true,
      mode,
      stripeSubscriptionsScanned: subscriptions.length,
      activeMembershipCandidates: candidates.length,
      proposed,
      applied,
      activeProfilesWithoutStripeMatch,
      issues,
      note:
        mode === 'dry-run'
          ? 'No Stripe or Supabase billing data changed. Review proposed matches and issues before applying.'
          : 'Matched active Stripe memberships were backfilled in Supabase only. Stripe billing schedules and charges were not modified.',
    });
  } catch (error: unknown) {
    console.error('stripe-reconcile: failed.', {
      errorName: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message : 'Unknown reconciliation failure',
    });
    return NextResponse.json(
      { success: false, error: 'Stripe membership reconciliation failed. No unmatched records were modified.' },
      { status: 500 }
    );
  }
}

async function listAllStripeSubscriptions(stripe: Stripe) {
  const subscriptions: Stripe.Subscription[] = [];
  let startingAfter: string | undefined;

  do {
    const page = await stripe.subscriptions.list({
      status: 'all',
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });
    subscriptions.push(...page.data);
    startingAfter = page.has_more ? page.data.at(-1)?.id : undefined;
  } while (startingAfter);

  return subscriptions;
}

async function resolveProfileForSubscription(
  stripe: Stripe,
  supabase: SupabaseClient,
  subscription: Stripe.Subscription
): Promise<{ profile: ProfileRow | null; source: Candidate['source'] }> {
  const metadataUserId = subscription.metadata?.supabase_user_id?.trim();
  if (metadataUserId) {
    const profile = await findProfileById(supabase, metadataUserId);
    if (profile) return { profile, source: 'subscription_metadata' };
  }

  const { data: local, error: localError } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .maybeSingle();
  if (localError) throw new Error(`Unable to inspect local Stripe mapping: ${localError.message}`);
  if (local?.user_id) {
    const profile = await findProfileById(supabase, local.user_id);
    if (profile) return { profile, source: 'local_subscription' };
  }

  const customer = await resolveCustomer(stripe, subscription.customer);
  if (customer && !('deleted' in customer && customer.deleted)) {
    const customerUserId = customer.metadata?.supabase_user_id?.trim();
    if (customerUserId) {
      const profile = await findProfileById(supabase, customerUserId);
      if (profile) return { profile, source: 'customer_metadata' };
    }

    if (customer.email) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, role, subscription_tier, subscription_status')
        .eq('email', customer.email)
        .limit(1)
        .maybeSingle();
      if (profileError) throw new Error(`Unable to map Stripe customer email: ${profileError.message}`);
      if (profile) return { profile: profile as ProfileRow, source: 'customer_email' };
    }
  }

  return { profile: null, source: 'customer_email' };
}

async function findProfileById(supabase: SupabaseClient, userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, role, subscription_tier, subscription_status')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw new Error(`Unable to map Supabase profile: ${error.message}`);
  return (data as ProfileRow | null) ?? null;
}

async function resolveCustomer(
  stripe: Stripe,
  customer: string | Stripe.Customer | Stripe.DeletedCustomer
) {
  if (typeof customer !== 'string') return customer;
  return stripe.customers.retrieve(customer);
}

async function describeStripeSubscription(
  stripe: Stripe,
  subscription: Stripe.Subscription
): Promise<StripeAuditSummary> {
  const customer = await resolveCustomer(stripe, subscription.customer);
  const customerEmail = customer && !('deleted' in customer && customer.deleted) ? customer.email ?? null : null;
  const customerName = customer && !('deleted' in customer && customer.deleted) ? customer.name ?? null : null;

  const items = await Promise.all(
    subscription.items.data.map(async (item) => {
      const productValue = item.price.product;
      const productId = stripeObjectId(productValue);
      let productName: string | null = null;

      if (productValue && typeof productValue === 'object' && 'name' in productValue) {
        productName = typeof productValue.name === 'string' ? productValue.name : null;
      } else if (productId) {
        try {
          const product = await stripe.products.retrieve(productId);
          productName = 'deleted' in product && product.deleted ? null : product.name;
        } catch {
          productName = null;
        }
      }

      return {
        priceId: item.price.id,
        priceNickname: item.price.nickname,
        productId,
        productName,
        unitAmount: item.price.unit_amount,
        currency: item.price.currency,
        interval: item.price.recurring?.interval ?? null,
      };
    })
  );

  return {
    customerEmail,
    customerName,
    createdAt: new Date(subscription.created * 1000).toISOString(),
    currentPeriodEnd: getSubscriptionPeriodEnd(subscription),
    items,
  };
}

function stripeObjectId(value: string | { id: string } | null | undefined) {
  if (typeof value === 'string' && value.trim()) return value;
  if (value && typeof value === 'object' && typeof value.id === 'string') return value.id;
  return null;
}

function getSubscriptionPeriodEnd(subscription: Stripe.Subscription) {
  const recurringItems = subscription.items.data.filter((item) => item.price.recurring?.interval === 'month');
  if (recurringItems.length !== 1) return null;
  const periodEnd = recurringItems[0].current_period_end;
  return typeof periodEnd === 'number' ? new Date(periodEnd * 1000).toISOString() : null;
}
