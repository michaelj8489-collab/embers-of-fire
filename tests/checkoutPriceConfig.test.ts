import test from 'node:test';
import assert from 'node:assert/strict';
import { MEMBERSHIP_TIERS } from '../src/utils/membership.ts';
import { resolveStripePriceId } from '../src/utils/membership.server.ts';

const envNames = MEMBERSHIP_TIERS.map((tier) => tier.priceEnvName);

function withSavedPriceEnv(run: () => void) {
  const saved = Object.fromEntries(envNames.map((name) => [name, process.env[name]]));
  try {
    run();
  } finally {
    for (const name of envNames) {
      if (saved[name] === undefined) delete process.env[name];
      else process.env[name] = saved[name];
    }
  }
}

test('checkout price resolution only requires the requested tier configuration', () => withSavedPriceEnv(() => {
  for (const name of envNames) delete process.env[name];
  process.env.STRIPE_PRICE_KEEPERS_OF_THE_EMBERS = 'price_keepers';

  const result = resolveStripePriceId('Keepers of the Embers');
  assert.deepEqual(result, { ok: true, value: 'price_keepers' });
}));

test('checkout price resolution still fails closed when the requested tier is missing', () => withSavedPriceEnv(() => {
  for (const name of envNames) delete process.env[name];
  process.env.STRIPE_PRICE_FLAME_BEARERS = 'price_flame';

  const result = resolveStripePriceId('Keepers of the Embers');
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /STRIPE_PRICE_KEEPERS_OF_THE_EMBERS/);
}));
