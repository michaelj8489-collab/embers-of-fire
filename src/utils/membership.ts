export const MEMBERSHIP_TIERS = [
  {
    name: 'Keepers of the Embers',
    monthlyAmount: 500,
    order: 1,
    priceEnvName: 'STRIPE_PRICE_KEEPERS_OF_THE_EMBERS',
    intro: 'Believe in independent voices. Help fuel the RISE journey.',
    description: 'This tier is pure support. Your commitment is the spark that keeps the signal blazing.',
    benefits: ['Access to community posts feed', 'Digital supporter recognition', 'Ember Keeper identity badge'],
    image: '/images/jmc-edits-palettes/keepers-of-the-embers.png',
    color: 'from-orange-500 to-orange-700',
  },
  {
    name: 'Flame Bearers',
    monthlyAmount: 1500,
    order: 2,
    priceEnvName: 'STRIPE_PRICE_FLAME_BEARERS',
    intro: 'Deepen your connection. Guide the community fire.',
    description: 'For listeners who want to be closer to the heart of the conversation.',
    benefits: ['Exclusive Awareness Insights', 'Priority voting on show themes', 'Ad-free show archives'],
    image: '/images/jmc-edits-palettes/flame-bearers.png',
    color: 'from-orange-400 to-red-600',
  },
  {
    name: 'Phoenix Circle',
    monthlyAmount: 3300,
    order: 3,
    priceEnvName: 'STRIPE_PRICE_PHOENIX_CIRCLE',
    intro: 'Exclusive access. Direct broadcast impact.',
    description: 'Where awareness meets true impact for our dedicated inner community.',
    benefits: ['Monthly Fireside livestream', 'Monthly on-air shout-out', 'Zoom workshops access'],
    image: '/images/jmc-edits-palettes/phoenix-circle.png',
    color: 'from-yellow-400 to-orange-500',
  },
  {
    name: 'Wings of the Phoenix',
    monthlyAmount: 7500,
    order: 4,
    priceEnvName: 'STRIPE_PRICE_WINGS_OF_THE_PHOENIX',
    intro: 'The Infrastructure Force.',
    description: 'Legacy building that supports technology, studios, and expansion.',
    benefits: ['Quarterly Executive Council Calls', 'Phoenix Vision Insight Letters', 'Highest priority for submissions'],
    image: '/images/jmc-edits-palettes/wings-of-the-phoenix.png',
    color: 'from-red-500 to-orange-600',
  },
  {
    name: 'Phoenix Ascending',
    monthlyAmount: 15000,
    order: 5,
    priceEnvName: 'STRIPE_PRICE_PHOENIX_ASCENDING',
    intro: 'The Vanguard. Supporting the highest vision.',
    description: 'The highest commitment, sustaining long-term stability and potential.',
    benefits: ['Annual 1-on-1 virtual call', 'Private annual virtual gathering', 'Executive-level recognition'],
    image: '/images/jmc-edits-palettes/phoenix-ascending.png',
    color: 'from-yellow-200 via-orange-400 to-red-700',
  },
] as const;

export type TierName = (typeof MEMBERSHIP_TIERS)[number]['name'];
type Tier = (typeof MEMBERSHIP_TIERS)[number];
type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const TIER_SLUGS: Record<string, TierName> = Object.fromEntries(
  MEMBERSHIP_TIERS.map((tier) => [tier.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), tier.name])
) as Record<string, TierName>;

export function validateTierName(value: unknown): Result<TierName> {
  if (typeof value !== 'string') return { ok: false, error: 'targetTier must be a string.' };
  const trimmed = value.trim();
  const tier = MEMBERSHIP_TIERS.find((candidate) => candidate.name === trimmed)?.name ?? TIER_SLUGS[trimmed.toLowerCase()];
  return tier ? { ok: true, value: tier } : { ok: false, error: 'Invalid membership tier.' };
}

export function getMembershipTier(tierName: TierName): Tier {
  return MEMBERSHIP_TIERS.find((tier) => tier.name === tierName)!;
}

export function compareTierOrder(first: TierName, second: TierName) {
  return getMembershipTier(first).order - getMembershipTier(second).order;
}

export function getPublicMembershipTiers() {
  return MEMBERSHIP_TIERS.map(({ name, monthlyAmount, order, intro, description, benefits, image, color }) => ({
    name, monthlyAmount, order, intro, description, benefits, image, color,
  }));
}
