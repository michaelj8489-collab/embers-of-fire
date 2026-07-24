import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { MEMBERSHIP_TIERS } from '../src/utils/membership.ts';
import {
  getConfiguredStripePrices,
  getPlanChangeOutcome,
  buildSubscriptionChangeIdempotencyKey,
  resolveSubscriptionMembership,
  updateSubscriptionIfNoPending,
  validateTargetStripePrice,
} from '../src/utils/membership.server.ts';

const envNames = MEMBERSHIP_TIERS.map((tier) => tier.priceEnvName);

function withPrices(run: () => void) {
  const saved = Object.fromEntries(envNames.map((name) => [name, process.env[name]]));
  try {
    for (const tier of MEMBERSHIP_TIERS) process.env[tier.priceEnvName] = `price_configured_${tier.order}`;
    run();
  } finally {
    for (const name of envNames) {
      if (saved[name] === undefined) delete process.env[name];
      else process.env[name] = saved[name];
    }
  }
}

function subscription(overrides: Partial<{
  priceId: string; amount: number; currency: string; interval: string; intervalCount: number; metadata: Record<string, string>; extraRecurring: boolean; extraRecurringInterval: string;
}> = {}) {
  const item = {
    id: 'si_membership',
    price: {
      id: overrides.priceId ?? 'price_legacy',
      unit_amount: overrides.amount ?? 3300,
      currency: overrides.currency ?? 'usd',
      recurring: { interval: overrides.interval ?? 'month', interval_count: overrides.intervalCount ?? 1 },
    },
  };
  return {
    items: { data: [item, ...(overrides.extraRecurring ? [{ ...item, id: 'si_extra', price: { ...item.price, recurring: { interval: overrides.extraRecurringInterval ?? 'year', interval_count: 1 } } }] : [])] },
    metadata: overrides.metadata ?? { requested_tier: 'Phoenix Circle', tier_name: 'Phoenix Circle' },
  };
}

test('all five configured Price IDs map uniquely to their canonical tiers', () => withPrices(() => {
  const configured = getConfiguredStripePrices();
  assert.equal(configured.ok, true);
  if (configured.ok) {
    assert.equal(Object.keys(configured.value).length, 5);
    assert.equal(new Set(Object.values(configured.value)).size, 5);
  }
}));

test('missing or duplicate configuration produces configuration_error, never unknown_price', () => withPrices(() => {
  delete process.env.STRIPE_PRICE_PHOENIX_CIRCLE;
  assert.equal(resolveSubscriptionMembership(subscription(), 'Phoenix Circle').kind, 'configuration_error');
  process.env.STRIPE_PRICE_PHOENIX_CIRCLE = process.env.STRIPE_PRICE_FLAME_BEARERS;
  assert.equal(resolveSubscriptionMembership(subscription(), 'Phoenix Circle').kind, 'configuration_error');
}));

test('a configured current Price resolves to its tier', () => withPrices(() => {
  const result = resolveSubscriptionMembership(subscription({ priceId: 'price_configured_4', amount: 7500 }), 'Seeker');
  assert.equal(result.kind, 'configured_price');
  if (result.kind === 'configured_price') assert.equal(result.tier, 'Wings of the Phoenix');
}));

test('a valid legacy monthly USD item requires agreeing metadata, local tier, and amount', () => withPrices(() => {
  const result = resolveSubscriptionMembership(subscription(), 'Phoenix Circle');
  assert.equal(result.kind, 'recognized_legacy_price');
  if (result.kind === 'recognized_legacy_price') {
    assert.equal(result.tier, 'Phoenix Circle');
    assert.equal(result.item.id, 'si_membership');
  }
}));

test('legacy recognition rejects a wrong amount, non-monthly item, non-USD item, and ambiguous tier claims', () => withPrices(() => {
  assert.equal(resolveSubscriptionMembership(subscription({ amount: 500 }), 'Phoenix Circle').kind, 'unknown_price');
  assert.equal(resolveSubscriptionMembership(subscription({ interval: 'year' }), 'Phoenix Circle').kind, 'unknown_price');
  assert.equal(resolveSubscriptionMembership(subscription({ currency: 'cad' }), 'Phoenix Circle').kind, 'unknown_price');
  assert.equal(resolveSubscriptionMembership(subscription({ metadata: { requested_tier: 'Flame Bearers' } }), 'Phoenix Circle').kind, 'unknown_price');
  assert.equal(resolveSubscriptionMembership(subscription({ intervalCount: 2 }), 'Phoenix Circle').kind, 'unknown_price');
}));

test('legacy recognition requires a stored tier and at least one agreeing metadata tier', () => withPrices(() => {
  assert.equal(resolveSubscriptionMembership(subscription({ metadata: {} }), 'Phoenix Circle').kind, 'unknown_price');
  assert.equal(resolveSubscriptionMembership(subscription(), null).kind, 'unknown_price');
  assert.equal(resolveSubscriptionMembership(subscription({ metadata: { requested_tier: 'Phoenix Circle', tier_name: 'Phoenix Circle' } }), null).kind, 'unknown_price');
  assert.equal(resolveSubscriptionMembership(subscription({ metadata: { requested_tier: 'Phoenix Circle', tier_name: 'not-a-tier' } }), 'Phoenix Circle').kind, 'unknown_price');
}));

test('unknown, yearly, or multiple recurring subscription items fail closed', () => withPrices(() => {
  assert.equal(resolveSubscriptionMembership(subscription({ extraRecurring: true }), 'Phoenix Circle').kind, 'unknown_price');
  assert.equal(resolveSubscriptionMembership(subscription({ interval: 'year' }), 'Phoenix Circle').kind, 'unknown_price');
}));

test('configured current Price property mismatches are configuration errors', () => withPrices(() => {
  assert.equal(resolveSubscriptionMembership(subscription({ priceId: 'price_configured_3', amount: 500 }), 'Phoenix Circle').kind, 'configuration_error');
  assert.equal(resolveSubscriptionMembership(subscription({ priceId: 'price_configured_3', currency: 'cad' }), 'Phoenix Circle').kind, 'configuration_error');
  assert.equal(resolveSubscriptionMembership(subscription({ priceId: 'price_configured_3', interval: 'year' }), 'Phoenix Circle').kind, 'configuration_error');
  assert.equal(resolveSubscriptionMembership(subscription({ priceId: 'price_configured_3', intervalCount: 2 }), 'Phoenix Circle').kind, 'configuration_error');
}));

test('target Stripe Price validation rejects inactive, wrong amount, currency, or annual prices', () => {
  const target = (overrides: Record<string, unknown> = {}) => ({
    id: 'price_configured_3', active: true, type: 'recurring', billing_scheme: 'per_unit', currency: 'usd', unit_amount: 3300,
    recurring: { interval: 'month', interval_count: 1, usage_type: 'licensed' }, ...overrides,
  }) as Parameters<typeof validateTargetStripePrice>[2];
  assert.equal(validateTargetStripePrice('Phoenix Circle', 'price_configured_3', target()).ok, true);
  assert.equal(validateTargetStripePrice('Phoenix Circle', 'price_configured_3', target({ active: false })).ok, false);
  assert.equal(validateTargetStripePrice('Phoenix Circle', 'price_configured_3', target({ unit_amount: 500 })).ok, false);
  assert.equal(validateTargetStripePrice('Phoenix Circle', 'price_configured_3', target({ currency: 'cad' })).ok, false);
  assert.equal(validateTargetStripePrice('Phoenix Circle', 'price_configured_3', target({ recurring: { interval: 'year', interval_count: 1, usage_type: 'licensed' } })).ok, false);
});

test('pending updates and non-succeeded payment intents return pending_payment', () => {
  assert.equal(getPlanChangeOutcome({ hasPendingUpdate: true, invoiceStatus: null, paymentIntentStatus: null, subscriptionStatus: 'active' }), 'pending_payment');
  assert.equal(getPlanChangeOutcome({ hasPendingUpdate: false, invoiceStatus: null, paymentIntentStatus: 'requires_action', subscriptionStatus: 'active' }), 'pending_payment');
  assert.equal(getPlanChangeOutcome({ hasPendingUpdate: false, invoiceStatus: 'paid', paymentIntentStatus: 'succeeded', subscriptionStatus: 'active' }), 'completed');
});

test('a pending update is a terminal pending outcome and idempotency keys are operation-specific', () => {
  const operation = {
    subscriptionId: 'sub_verified', subscriptionItemId: 'si_verified', currentPriceId: 'price_current', targetPriceId: 'price_target', subscriptionUpdated: 123,
  };
  const first = buildSubscriptionChangeIdempotencyKey(operation);
  assert.equal(first, buildSubscriptionChangeIdempotencyKey(operation));
  assert.notEqual(first, buildSubscriptionChangeIdempotencyKey({ ...operation, targetPriceId: 'price_other_target' }));
  assert.notEqual(first, buildSubscriptionChangeIdempotencyKey({ ...operation, subscriptionUpdated: 124 }));
  assert.ok(first.length < 255);
  assert.equal(getPlanChangeOutcome({ hasPendingUpdate: true, invoiceStatus: null, paymentIntentStatus: null, subscriptionStatus: 'active' }), 'pending_payment');
});

test('a pending update prevents the subscription update callback from being called', async () => {
  let calls = 0;
  const pending = await updateSubscriptionIfNoPending({ expires_at: 1 }, async () => {
    calls += 1;
    return 'updated';
  });
  assert.equal(pending.kind, 'pending');
  assert.equal(calls, 0);

  const updated = await updateSubscriptionIfNoPending(null, async () => {
    calls += 1;
    return { subscriptionId: 'sub_existing', itemId: 'si_existing' };
  });
  assert.deepEqual(updated, { kind: 'updated', value: { subscriptionId: 'sub_existing', itemId: 'si_existing' } });
  assert.equal(calls, 1);
});

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? sourceFiles(path) : [path];
  });
}

test('chat application surfaces are removed while generic push infrastructure remains', () => {
  assert.equal(existsSync('src/app/chat/page.tsx'), false);
  assert.equal(existsSync('src/app/chat-embed/page.tsx'), false);
  assert.equal(existsSync('src/app/api/chat-push/route.ts'), false);
  assert.equal(existsSync('src/components/BotManager.tsx'), false);

  const prohibited = /chat_messages|chat_commands|chat_uploads|chat-push|chat-embed|BotManager|GiphyFetch|emoji-picker-react/i;
  for (const file of sourceFiles('src')) {
    assert.equal(prohibited.test(readFileSync(file, 'utf8')), false, `Chat reference remains in ${file}`);
  }

  const header = readFileSync('src/components/Header.tsx', 'utf8');
  assert.equal(header.includes('/chat'), false);
  assert.match(readFileSync('src/utils/twitchEmbed.ts', 'utf8'), /export function buildTwitchChatSrc/);
  const config = readFileSync('next.config.ts', 'utf8');
  assert.match(config, /source: '\/chat'.*destination: '\/dashboard'.*permanent: true/);
  assert.match(config, /source: '\/chat-embed'.*destination: '\/dashboard'.*permanent: true/);
  const packageJson = readFileSync('package.json', 'utf8');
  assert.equal(/@giphy\/js-fetch-api|@giphy\/react-components|emoji-picker-react/.test(packageJson), false);
  assert.equal(existsSync('src/app/api/broadcast/route.ts'), true);
  assert.equal(existsSync('src/app/api/show-live/route.ts'), true);
  assert.equal(existsSync('src/app/api/push-subscriptions/route.ts'), true);
  assert.equal(existsSync('src/utils/api/security.ts'), true);
});
