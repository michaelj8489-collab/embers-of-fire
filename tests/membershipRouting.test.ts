import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import React from 'react';
import ts from 'typescript';
import * as membership from '../src/utils/membership.ts';

const require = createRequire(import.meta.url);
const paidSlugs = [
  'keepers-of-the-embers', 'flame-bearers', 'phoenix-circle',
  'wings-of-the-phoenix', 'phoenix-ascending',
];
const unsafeTiers = [
  null, undefined, '', 'seeker', 'unknown', '__proto__', 'constructor', 'toString',
  'KEEPERS-OF-THE-EMBERS', ' phoenix-circle ', 'Phoenix Circle',
  'javascript:alert(1)', '//example.com', 'phoenix-circle&returnTo=//example.com',
];

// Run the actual page/route modules with isolated external services. No live
// accounts, verification emails, or Stripe objects are created by these tests.
function loadModule<T>(path: string, mocks: Record<string, unknown>, globals = {}): T {
  const output = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const exports = {};
  runInNewContext(output, {
    exports, require: (name: string) => Object.hasOwn(mocks, name) ? mocks[name] : require(name),
    URL, URLSearchParams, Request, Response, console, ...globals,
  }, { filename: path });
  return exports as T;
}

type Element = React.ReactElement<Record<string, unknown>>;
type Handler = (event: { preventDefault(): void }) => Promise<void>;
const submitEvent = { preventDefault() {} };

function pageHarness(path: string, query = '', authenticated = false, sessionFailure = false) {
  const states: unknown[] = [];
  const effects: Array<() => unknown> = [];
  const pushes: string[] = [];
  const replacements: string[] = [];
  const signups: Array<{ options: { emailRedirectTo: string } }> = [];
  const checkoutRequests: Array<{ url: string; body: string }> = [];
  const redirects: string[] = [];
  let cursor = 0;
  let mounted = false;
  let loggedIn = authenticated;
  const session = () => loggedIn ? { user: { id: 'member', email: 'member@example.test' } } : null;
  const supabase = {
    auth: {
      getSession: async () => ({ data: { session: session() }, error: sessionFailure ? new Error('offline') : null }),
      signInWithPassword: async () => { loggedIn = true; return { error: null }; },
      signUp: async (args: { options: { emailRedirectTo: string } }) => { signups.push(args); return { error: null }; },
    },
    from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { subscription_tier: 'Seeker', subscription_status: 'inactive' } }) }) }) }),
  };
  const router = { push: (url: string) => pushes.push(url), replace: (url: string) => replacements.push(url) };
  const page = loadModule<{ default: () => React.ReactNode }>(path, {
    react: {
      ...React,
      useState: (initial: unknown) => {
        const index = cursor++;
        if (!(index in states)) states[index] = initial;
        return [states[index], (value: unknown) => { states[index] = value; }];
      },
      useRef: (initial: unknown) => {
        const index = cursor++;
        if (!(index in states)) states[index] = { current: initial };
        return states[index];
      },
      useEffect: (effect: () => unknown) => { effects.push(effect); },
    },
    'next/navigation': { useRouter: () => router, useSearchParams: () => new URLSearchParams(query) },
    'next/link': 'a', 'next/image': 'img',
    '@/utils/supabase/client': { createClient: () => supabase },
    '@/utils/membership': membership,
    '@/utils/showRegistry': { SHOWS: [] },
    ...Object.fromEntries(['Header', 'Footer', 'PushNotificationButton', 'GlobalZenoPlayer'].map(name => [`@/components/${name}`, () => null])),
  }, {
    window: { location: { search: query, origin: 'https://www.embersoflight.net', assign: (url: string) => redirects.push(url) } },
    fetch: async (url: string, options: { body: string }) => {
      checkoutRequests.push({ url, body: options.body });
      return Response.json({ sessionId: 'cs_test_routing', url: 'https://checkout.stripe.com/c/pay/cs_test_routing' });
    },
  });

  function render() {
    cursor = 0;
    effects.length = 0;
    const elements: Element[] = [];
    function visit(node: React.ReactNode) {
      if (Array.isArray(node)) { node.forEach(visit); return; }
      if (!React.isValidElement<Record<string, unknown>>(node)) return;
      if (typeof node.type === 'function') {
        visit((node.type as (props: Record<string, unknown>) => React.ReactNode)(node.props));
      } else {
        elements.push(node);
        visit(node.props.children as React.ReactNode);
      }
    }
    visit(page.default());
    mounted = true;
    return elements;
  }
  async function flushEffects() {
    assert.equal(mounted, true);
    for (const effect of effects.splice(0)) effect();
    await new Promise(resolve => setImmediate(resolve));
  }
  return { render, flushEffects, pushes, replacements, signups, checkoutRequests, redirects };
}

function find(elements: Element[], type: string, prop?: string, value?: unknown) {
  const element = elements.find(node => node.type === type && (!prop || node.props[prop] === value));
  assert.ok(element, `Missing ${type} ${prop ?? ''}=${String(value ?? '')}`);
  return element;
}

test('checkout query validation accepts only the five canonical paid slugs', () => {
  for (const slug of paidSlugs) assert.equal(membership.getPaidTierSlug(slug), slug);
  for (const value of [...unsafeTiers, {}, [], 42]) assert.equal(membership.getPaidTierSlug(value), null);
});

for (const authenticated of [false, true]) {
  test(`homepage routes every membership tier with authenticated=${authenticated}`, async () => {
    const page = pageHarness('src/app/page.tsx', '', authenticated);
    const buttons = page.render().filter(node => node.type === 'button');
    assert.equal(buttons.length, 6);
    for (const button of buttons) await (button.props.onClick as () => Promise<void>)();
    assert.deepEqual(page.pushes, [
      authenticated ? '/dashboard' : '/signup?tier=seeker',
      ...paidSlugs.map(slug => `${authenticated ? '/dashboard' : '/login'}?trigger_checkout=${slug}`),
    ]);
  });
}

for (const slug of paidSlugs) {
  test(`paid login, signup and dashboard preserve ${slug}`, async () => {
    const login = pageHarness('src/app/login/page.tsx', `?trigger_checkout=${slug}`);
    const loginElements = login.render();
    find(loginElements, 'a', 'href', `/signup?tier=${slug}`);
    await (find(loginElements, 'form').props.onSubmit as Handler)(submitEvent);
    assert.deepEqual(login.pushes, [`/dashboard?trigger_checkout=${slug}`]);

    const signup = pageHarness('src/app/signup/page.tsx', `?tier=${slug}`);
    assert.equal(signup.render().some(node => node.type === 'form'), false);
    await signup.flushEffects();
    const signupElements = signup.render();
    find(signupElements, 'a', 'href', `/login?trigger_checkout=${slug}`);
    await (find(signupElements, 'form').props.onSubmit as Handler)(submitEvent);
    assert.equal(signup.signups[0].options.emailRedirectTo, `https://www.embersoflight.net/auth/callback?checkout=${slug}`);

    const member = pageHarness('src/app/signup/page.tsx', `?tier=${slug}`, true);
    assert.equal(member.render().some(node => node.type === 'form'), false);
    await member.flushEffects();
    assert.deepEqual(member.replacements, [`/dashboard?trigger_checkout=${slug}`]);
    assert.equal(member.render().some(node => node.type === 'form'), false);

    const dashboard = pageHarness('src/app/dashboard/page.tsx', `?trigger_checkout=${slug}`, true);
    dashboard.render();
    await dashboard.flushEffects();
    dashboard.render();
    await dashboard.flushEffects();
    assert.equal(dashboard.checkoutRequests.length, 1);
    assert.equal(dashboard.checkoutRequests[0].url, '/api/checkout');
    assert.equal(JSON.parse(dashboard.checkoutRequests[0].body).tierName, membership.MEMBERSHIP_TIERS[paidSlugs.indexOf(slug)].name);
    assert.deepEqual(dashboard.redirects, ['https://checkout.stripe.com/c/pay/cs_test_routing']);
  });
}

test('missing, free and unsafe tiers use the free flow without propagating checkout input', async () => {
  for (const tier of unsafeTiers) {
    const login = pageHarness('src/app/login/page.tsx', tier == null ? '' : `?trigger_checkout=${encodeURIComponent(tier)}`);
    const elements = login.render();
    find(elements, 'a', 'href', '/signup');
    await (find(elements, 'form').props.onSubmit as Handler)(submitEvent);
    assert.deepEqual(login.pushes, ['/dashboard']);

    const query = tier == null ? '' : `?tier=${encodeURIComponent(tier)}`;
    const signup = pageHarness('src/app/signup/page.tsx', query);
    signup.render();
    await signup.flushEffects();
    const form = signup.render();
    find(form, 'a', 'href', '/login');
    await (find(form, 'form').props.onSubmit as Handler)(submitEvent);
    assert.equal(signup.signups[0].options.emailRedirectTo, 'https://www.embersoflight.net/auth/callback?checkout=seeker');

    const member = pageHarness('src/app/signup/page.tsx', query, true);
    member.render();
    await member.flushEffects();
    assert.deepEqual(member.replacements, ['/dashboard']);
    assert.equal(member.render().some(node => node.type === 'form'), false);
  }
});

test('signup session errors keep account creation hidden and offer login with the paid tier', async () => {
  const page = pageHarness('src/app/signup/page.tsx', '?tier=phoenix-circle', false, true);
  page.render();
  await page.flushEffects();
  const elements = page.render();
  assert.equal(elements.some(node => node.type === 'form'), false);
  find(elements, 'a', 'href', '/login?trigger_checkout=phoenix-circle');
});

test('successful login preserves safe returnTo and rejects external returnTo', async () => {
  for (const [returnTo, expected] of [
    ['/dashboard/membership', '/dashboard/membership'],
    ['/dashboard?trigger_checkout=phoenix-circle', '/dashboard?trigger_checkout=phoenix-circle'],
    ['https://example.com', null], ['javascript:alert(1)', null],
  ]) {
    const query = `?trigger_checkout=phoenix-circle&returnTo=${encodeURIComponent(returnTo!)}`;
    const page = pageHarness('src/app/login/page.tsx', query);
    await (find(page.render(), 'form').props.onSubmit as Handler)(submitEvent);
    assert.equal(page.pushes[0], expected ?? `/dashboard?${new URLSearchParams(query)}`);
  }
});

function checkoutHarness(options: { authenticated?: boolean; localPaid?: boolean; stripeStatus?: string; pending?: boolean } = {}) {
  const created: Array<Record<string, unknown>> = [];
  const user = { id: 'member', email: 'member@example.test' };
  const checkoutUrl = 'https://checkout.stripe.com/c/pay/cs_test_routing';
  const supabase = {
    auth: { getUser: async () => ({ data: { user: options.authenticated === false ? null : user }, error: null }) },
    from: (table: string) => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({
      data: table === 'profiles'
        ? { subscription_tier: options.localPaid ? 'Phoenix Circle' : 'Seeker', subscription_status: options.localPaid ? 'active' : 'inactive' }
        : { tier: 'Seeker', status: 'inactive', stripe_customer_id: 'cus_test_existing' },
      error: null,
    }) }) }) }),
  };
  class MockStripe {
    static errors = { StripeError: Error };
    customers = { retrieve: async () => ({ id: 'cus_test_existing' }) };
    subscriptions = { list: async () => ({ data: options.stripeStatus ? [{ status: options.stripeStatus }] : [] }) };
    checkout = { sessions: {
      list: async () => ({ data: options.pending ? [{
        id: 'cs_test_pending', url: checkoutUrl, mode: 'subscription', status: 'open',
        client_reference_id: user.id, metadata: { supabase_user_id: user.id, requested_tier: 'Phoenix Circle' },
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      }] : [] }),
      create: async (args: Record<string, unknown>) => {
        created.push(args);
        return { id: 'cs_test_routing', url: checkoutUrl };
      },
    } };
  }
  const route = loadModule<{ POST: (request: Request) => Promise<Response> }>('src/app/api/checkout/route.ts', {
    'next/server': { NextResponse: Response },
    stripe: MockStripe,
    '@/utils/supabase/server': { createClient: async () => supabase },
    '@/utils/membership': membership,
    '@/utils/membership.server': { retrieveValidatedStripePrice: async () => ({ ok: true, value: 'price_test_configured' }) },
    '@/utils/api/security': {
      STRIPE_API_VERSION: '2026-03-25.dahlia',
      normalizeTierName: membership.validateTierName,
      jsonError: (error: string, status: number) => Response.json({ error }, { status }),
      readJsonObject: async (request: Request) => ({ ok: true, value: await request.json() }),
      getRequiredEnv: () => ({ ok: true, value: 'test-only' }),
      normalizeTrustedAppUrl: () => ({ ok: true, value: 'https://www.embersoflight.net' }),
    },
  });
  return {
    created,
    post: (tierName = 'Phoenix Circle') => route.POST(new Request('https://www.embersoflight.net/api/checkout', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tierName }),
    })),
  };
}

test('existing checkout returns a hosted session for an authenticated free member', async () => {
  const checkout = checkoutHarness();
  const response = await checkout.post();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { sessionId: 'cs_test_routing', url: 'https://checkout.stripe.com/c/pay/cs_test_routing' });
  assert.equal(checkout.created.length, 1);
  assert.equal(checkout.created[0].customer, 'cus_test_existing');
  assert.equal(checkout.created[0].client_reference_id, 'member');
  assert.equal(checkout.created[0].mode, 'subscription');
});

test('checkout rejects unauthenticated and invalid-tier requests before creating a session', async () => {
  const loggedOut = checkoutHarness({ authenticated: false });
  assert.equal((await loggedOut.post()).status, 401);
  assert.equal(loggedOut.created.length, 0);
  const invalidTier = checkoutHarness();
  assert.equal((await invalidTier.post('not-a-membership')).status, 400);
  assert.equal(invalidTier.created.length, 0);
});

test('existing paid and processing subscriptions cannot create duplicate checkout sessions', async () => {
  for (const options of [
    { localPaid: true },
    ...['active', 'trialing', 'incomplete', 'past_due', 'unpaid', 'paused'].map(stripeStatus => ({ stripeStatus })),
  ]) {
    const checkout = checkoutHarness(options);
    const response = await checkout.post();
    assert.equal(response.status, 409);
    assert.match((await response.json()).code, /^(ACTIVE_SUBSCRIPTION_EXISTS|SUBSCRIPTION_PROCESSING)$/);
    assert.equal(checkout.created.length, 0);
  }
});

test('a pending checkout is reused for the same tier and blocks another tier', async () => {
  const checkout = checkoutHarness({ pending: true });
  const reused = await checkout.post();
  assert.equal(reused.status, 200);
  assert.equal((await reused.json()).sessionId, 'cs_test_pending');
  const otherTier = await checkout.post('Flame Bearers');
  assert.equal(otherTier.status, 409);
  assert.equal((await otherTier.json()).code, 'CHECKOUT_ALREADY_PENDING');
  assert.equal(checkout.created.length, 0);
});
