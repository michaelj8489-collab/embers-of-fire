const PRODUCTION_TWITCH_PARENT = 'embersoflight.net';

function getTwitchParents(parentDomain: string): string[] {
  const parents = new Set<string>();
  const normalizedParent = parentDomain.trim().toLowerCase();

  if (normalizedParent) {
    parents.add(normalizedParent);
  }

  parents.add(PRODUCTION_TWITCH_PARENT);

  return Array.from(parents);
}

type TwitchPlayerOptions = {
  autoplay?: boolean;
  muted?: boolean;
};

export function buildTwitchPlayerSrc(
  channel: string,
  parentDomain: string,
  options: TwitchPlayerOptions = {}
): string {
  const url = new URL('https://player.twitch.tv/');

  url.searchParams.set('channel', channel);

  for (const parent of getTwitchParents(parentDomain)) {
    url.searchParams.append('parent', parent);
  }

  if (typeof options.autoplay === 'boolean') {
    url.searchParams.set('autoplay', String(options.autoplay));
  }

  if (typeof options.muted === 'boolean') {
    url.searchParams.set('muted', String(options.muted));
  }

  return url.toString();
}

export function buildTwitchChatSrc(channel: string, parentDomain: string): string {
  const url = new URL(`https://www.twitch.tv/embed/${encodeURIComponent(channel)}/chat`);

  for (const parent of getTwitchParents(parentDomain)) {
    url.searchParams.append('parent', parent);
  }

  url.searchParams.set('darkpopout', 'true');

  return url.toString();
}
