import { MEMBERSHIP_TIERS, validateTierName, type TierName } from './membership.ts';
import type Stripe from 'stripe';
import { createHash } from 'node:crypto';

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export type MembershipSubscriptionItem = {
  id: string;
  price: {
    id: string;
    currency: string | null;
    unit_amount: number | null;
    recurring: { interval: string; interval_count?: number | null } | null;
  };
};

export type MembershipSubscription = {
  items: { data: MembershipSubscriptionItem[] };
  metadata: Record<string, string> | null | undefined;
};

export type MembershipResolution =
  | { kind: 'configured_price'; tier: TierName; item: MembershipSubscriptionItem }
  | { kind: 'recognized_legacy_price'; tier: TierName; item: MembershipSubscriptionItem }
  | { kind: 'unknown_price' }
  | { kind: 'configuration_error'; error: string };

type StripePriceClient = Pick<Stripe, 'prices'>;

export function getPlanChangeOutcome(input: {
  hasPendingUpdate: boolean;
  invoiceStatus: string | null;
  paymentIntentStatus: string | null;
  subscriptionStatus: string;
}) {
  const pending = input.hasPendingUpdate ||
    input.invoiceStatus === 'open' || input.invoiceStatus === 'uncollectible' ||
    Boolean(input.paymentIntentStatus && input.paymentIntentStatus !== 'succeeded') ||
    input.subscriptionStatus === 'incomplete' || input.subscriptionStatus === 'past_due';
  return pending ? 'pending_payment' as const : 'completed' as const;
}

/** A compact, server-derived key for one verified subscription-item price replacement. */
export function buildSubscriptionChangeIdempotencyKey(input: {
  subscriptionId: string;
  subscriptionItemId: string;
  currentPriceId: string;
  targetPriceId: string;
  subscriptionUpdated: number | string;
}) {
  const operation = [
    input.subscriptionId,
    input.subscriptionItemId,
    input.currentPriceId,
    input.targetPriceId,
    input.subscriptionUpdated,
  ].join(':');
  return `embers-subscription-change-${createHash('sha256').update(operation).digest('hex')}`;
}

/** Keeps a pending Stripe update from being replaced by a duplicate update request. */
export async function updateSubscriptionIfNoPending<T>(
  pendingUpdate: unknown,
  update: () => Promise<T>
): Promise<{ kind: 'pending' } | { kind: 'updated'; value: T }> {
  if (pendingUpdate) return { kind: 'pending' };
  return { kind: 'updated', value: await update() };
}

/** Resolves the canonical tier configuration to secret Stripe Price IDs on the server only. */
export function getConfiguredStripePrices(): Result<Record<TierName, string>> {
  const resolved = {} as Record<TierName, string>;
  const missing: string[] = [];
  for (const tier of MEMBERSHIP_TIERS) {
    const priceId = process.env[tier.priceEnvName]?.trim();
    if (!priceId) missing.push(tier.priceEnvName);
    else resolved[tier.name] = priceId;
  }
  if (missing.length) return { ok: false, error: `Missing Stripe Price configuration: ${missing.join(', ')}.` };
  const ids = Object.values(resolved);
  if (new Set(ids).size !== ids.length) return { ok: false, error: 'Stripe Price IDs must be unique for every membership tier.' };
  return { ok: true, value: resolved };
}

export function resolveStripePriceId(tierName: TierName): Result<string> {
  const configured = getConfiguredStripePrices();
  return configured.ok ? { ok: true, value: configured.value[tierName] } : configured;
}

/** Retrieves and validates a target Price before Checkout or a subscription update can use it. */
export async function retrieveValidatedStripePrice(
  stripe: StripePriceClient,
  tierName: TierName
): Promise<Result<string>> {
  const priceId = resolveStripePriceId(tierName);
  if (!priceId.ok) return priceId;

  try {
    const price = await stripe.prices.retrieve(priceId.value);
    const validated = validateTargetStripePrice(tierName, priceId.value, price);
    return validated.ok ? { ok: true, value: priceId.value } : validated;
  } catch (error: unknown) {
    console.error('membership: configured Stripe Price lookup failed.', {
      errorName: error instanceof Error ? error.name : 'UnknownError',
    });
    return { ok: false, error: 'Configured Stripe Price could not be verified.' };
  }
}

export function validateTargetStripePrice(
  tierName: TierName,
  expectedPriceId: string,
  price: Pick<Stripe.Price, 'id' | 'active' | 'type' | 'billing_scheme' | 'currency' | 'unit_amount' | 'recurring'>
): Result<void> {
  const tier = MEMBERSHIP_TIERS.find((candidate) => candidate.name === tierName)!;
  const recurring = price.recurring;
  if (
    price.id !== expectedPriceId || !price.active || price.type !== 'recurring' ||
    price.billing_scheme !== 'per_unit' || price.currency.toLowerCase() !== 'usd' ||
    price.unit_amount !== tier.monthlyAmount || recurring?.interval !== 'month' ||
    recurring.interval_count !== 1 || recurring.usage_type !== 'licensed'
  ) {
    return { ok: false, error: 'Configured Stripe Price does not match the canonical membership definition.' };
  }
  return { ok: true, value: undefined };
}

export function resolveTierFromStripePriceId(priceId: string | null | undefined): TierName | null {
  if (!priceId) return null;
  const configured = getConfiguredStripePrices();
  if (!configured.ok) return null;
  return (Object.entries(configured.value).find(([, configuredPriceId]) => configuredPriceId === priceId)?.[0] as TierName | undefined) ?? null;
}

/**
 * Resolves one recurring membership item without trusting old metadata alone.
 * Legacy prices must agree with a canonical tier claim and that tier's exact monthly amount.
 */
export function resolveSubscriptionMembership(
  subscription: MembershipSubscription,
  storedTier: string | null | undefined
): MembershipResolution {
  const configured = getConfiguredStripePrices();
  if (!configured.ok) return { kind: 'configuration_error', error: configured.error };

  const recurringItems = subscription.items.data.filter((item) => item.price.recurring !== null);
  if (recurringItems.length !== 1) return { kind: 'unknown_price' };

  const item = recurringItems[0];
  const configuredTier = (Object.entries(configured.value).find(([, priceId]) => priceId === item.price.id)?.[0] as TierName | undefined);
  if (configuredTier) {
    const tier = MEMBERSHIP_TIERS.find((candidate) => candidate.name === configuredTier)!;
    if (
      item.price.currency?.toLowerCase() !== 'usd' || item.price.unit_amount !== tier.monthlyAmount ||
      item.price.recurring?.interval !== 'month' || item.price.recurring.interval_count !== 1
    ) {
      return { kind: 'configuration_error', error: 'Configured subscription Price does not match the canonical membership definition.' };
    }
    return { kind: 'configured_price', tier: configuredTier, item };
  }

  if (item.price.recurring?.interval !== 'month' || item.price.recurring.interval_count !== undefined && item.price.recurring.interval_count !== 1) {
    return { kind: 'unknown_price' };
  }

  const legacyTier = resolveLegacyTier(subscription.metadata, storedTier);
  if (!legacyTier || item.price.currency?.toLowerCase() !== 'usd') return { kind: 'unknown_price' };
  if (item.price.unit_amount !== MEMBERSHIP_TIERS.find((tier) => tier.name === legacyTier)?.monthlyAmount) {
    return { kind: 'unknown_price' };
  }
  return { kind: 'recognized_legacy_price', tier: legacyTier, item };
}

function resolveLegacyTier(metadata: Record<string, string> | null | undefined, storedTier: string | null | undefined): TierName | null {
  const stored = validateTierName(storedTier);
  if (!stored.ok) return null;
  const metadataClaims = [metadata?.requested_tier, metadata?.tier_name]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
  if (!metadataClaims.length) return null;
  const normalizedMetadata = metadataClaims.map((claim) => validateTierName(claim));
  if (normalizedMetadata.some((claim) => !claim.ok)) return null;
  return normalizedMetadata.every((claim) => claim.ok && claim.value === stored.value) ? stored.value : null;
}
