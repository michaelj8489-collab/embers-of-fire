export const USERNAME_MIN_LENGTH = 1;
export const USERNAME_MAX_LENGTH = 32;

const PREFERRED_USERNAME_PATTERN = /^[A-Za-z0-9_][A-Za-z0-9_.-]{0,31}$/;
const MENTION_PATTERN =
  /(?:^|[\s([{"'.,!?;:])@([A-Za-z0-9_][A-Za-z0-9_.-]{0,31})(?=$|[\s\])}.,!?;:'"\\])/g;

export function normalizeUsernameForLookup(value: unknown) {
  if (typeof value !== 'string') return '';
  return value.trim().normalize('NFC').toLowerCase();
}

export function isPreferredUsername(value: unknown) {
  if (typeof value !== 'string') return false;

  const normalized = value.trim().normalize('NFC');
  return (
    normalized.length >= USERNAME_MIN_LENGTH &&
    normalized.length <= USERNAME_MAX_LENGTH &&
    PREFERRED_USERNAME_PATTERN.test(normalized)
  );
}

export function usernamesMatch(left: unknown, right: unknown) {
  const normalizedLeft = normalizeUsernameForLookup(left);
  const normalizedRight = normalizeUsernameForLookup(right);

  return Boolean(normalizedLeft && normalizedRight && normalizedLeft === normalizedRight);
}

export function parseMentionTokens(
  value: string | null | undefined,
  options?: {
    maxScanLength?: number;
    maxTokens?: number;
  }
) {
  if (!value) return [];

  const maxScanLength = Math.max(0, options?.maxScanLength ?? value.length);
  const maxTokens = Math.max(0, options?.maxTokens ?? Number.POSITIVE_INFINITY);
  const source = value.slice(0, maxScanLength);
  const mentions = new Set<string>();

  for (const match of source.matchAll(MENTION_PATTERN)) {
    // Signup currently accepts raw usernames, so this parser is a preferred
    // mention policy rather than a full account-validity rule. Exact lookup
    // remains case-normalized and does not invalidate existing usernames.
    const username = normalizeMentionToken(match[1]);
    if (!username) continue;

    mentions.add(username);
    if (mentions.size >= maxTokens) break;
  }

  return Array.from(mentions);
}

function normalizeMentionToken(value: unknown) {
  const normalized = normalizeUsernameForLookup(value).replace(/[.-]+$/g, '');

  if (!normalized || !PREFERRED_USERNAME_PATTERN.test(normalized)) {
    return '';
  }

  return normalized;
}
