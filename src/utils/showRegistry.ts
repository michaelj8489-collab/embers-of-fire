export const GLOBAL_ZENO_STATIONS = [
  { id: 'rise-radio-woqo', name: 'Rise Radio Main' },
  { id: 'rise-awakenings', name: 'Rise Awakenings' },
  { id: 'rise-frequencies', name: 'Rise Frequencies' },
] as const;

export const SHOW_LIVE_PLATFORMS = ['manual', 'twitch', 'zeno'] as const;

export type ShowLivePlatform = (typeof SHOW_LIVE_PLATFORMS)[number];

export type ShowDefinition = {
  id: string;
  name: string;
  slug: string;
  href: string;
  hosts: readonly string[];
  schedule: {
    day: string;
    time: string;
  };
  supportedLivePlatforms: readonly ShowLivePlatform[];
  twitchChannel?: string;
  zenoStations?: typeof GLOBAL_ZENO_STATIONS;
  imagePath?: string;
  backgroundVideoPath?: string;
  notification: {
    title: string;
    body: string;
    iconPath: string;
    url: string;
  };
};

export const SHOWS = [
  {
    id: 'the-bloom',
    name: 'The Bloom',
    slug: 'the-bloom',
    href: '/dashboard/the-bloom',
    hosts: ['Rev. Diane R. DeBiasi'],
    schedule: { day: 'Mondays', time: '11:00 AM EST' },
    supportedLivePlatforms: ['manual', 'twitch'],
    twitchChannel: 'riseradionetworks',
    imagePath: '/images/main-images/Cover Art/bloom-bg.jpg',
    notification: {
      title: 'The Bloom is live',
      body: 'The Bloom has started on Rise Radio.',
      iconPath: '/images/main-images/Cover Art/bloom-bg.jpg',
      url: '/dashboard/the-bloom',
    },
  },
  {
    id: 'brindles-vision',
    name: "Brindle's Vision",
    slug: 'brindles-vision',
    href: '/dashboard/brindles-vision',
    hosts: ['Brindle Wolf', 'Michka Grant'],
    schedule: { day: 'Mondays', time: '6:00 PM EST' },
    supportedLivePlatforms: ['manual', 'twitch'],
    twitchChannel: 'riseradionetworks',
    imagePath: '/images/main-images/Cover Art/brindles-vision-bg.png',
    notification: {
      title: "Brindle's Vision is live",
      body: "Brindle's Vision has started on Rise Radio.",
      iconPath: '/images/main-images/Cover Art/brindles-vision-bg.png',
      url: '/dashboard/brindles-vision',
    },
  },
  {
    id: 'phoenix-talks',
    name: 'Phoenix Talks',
    slug: 'phoenix-talks',
    href: '/dashboard/phoenix-talks',
    hosts: ['Brindlewolf', 'Diane'],
    schedule: { day: 'Wednesdays', time: '6:00 PM EST' },
    supportedLivePlatforms: ['manual', 'twitch'],
    twitchChannel: 'riseradionetworks',
    imagePath: '/images/main-images/Cover Art/phoenix-talks-bg.jpg',
    notification: {
      title: 'Phoenix Talks is live',
      body: 'Phoenix Talks has started on Rise Radio.',
      iconPath: '/images/main-images/Cover Art/phoenix-talks-bg.jpg',
      url: '/dashboard/phoenix-talks',
    },
  },
  {
    id: 'the-core',
    name: 'The CORE',
    slug: 'the-core',
    href: '/dashboard/the-core',
    hosts: ['Michka "BrindleWolf" Grant', 'Rev. Diane R. DeBiasi', 'Michael J. Cox'],
    schedule: { day: 'Thursdays', time: '11:00 AM EST' },
    supportedLivePlatforms: ['manual', 'twitch'],
    twitchChannel: 'riseradionetworks',
    imagePath: '/images/jmc-edits-palettes/core-new-trio-bio.png',
    notification: {
      title: 'The CORE is live',
      body: 'The CORE has started on Rise Radio.',
      iconPath: '/images/jmc-edits-palettes/core-new-trio-bio.png',
      url: '/dashboard/the-core',
    },
  },
  {
    id: 'honky-tonk-heaven',
    name: 'Honky Tonk Heaven',
    slug: 'honky-tonk-heaven',
    href: '/dashboard/honky-tonk-heaven',
    hosts: ['Will Iommi'],
    schedule: { day: 'Wednesdays', time: '9:00 PM EST' },
    supportedLivePlatforms: ['manual', 'zeno'],
    zenoStations: GLOBAL_ZENO_STATIONS,
    imagePath: '/images/main-images/Cover Art/honkey-tonk-heaven-main.jpg',
    notification: {
      title: 'Honky Tonk Heaven is live',
      body: 'Honky Tonk Heaven has started on Rise Radio.',
      iconPath: '/images/main-images/Cover Art/honkey-tonk-heaven-main.jpg',
      url: '/dashboard/honky-tonk-heaven',
    },
  },
  {
    id: 'defining-your-character',
    name: 'Defining Your Character',
    slug: 'defining-your-character',
    href: '/dashboard/defining-your-character',
    hosts: ['Michael J Cox'],
    schedule: { day: 'Fridays', time: '5:00 PM EST' },
    supportedLivePlatforms: ['manual', 'twitch'],
    twitchChannel: 'michaelj8489',
    backgroundVideoPath: '/images/jmc-edits-palettes/defining-your-character-bg.mp4',
    notification: {
      title: 'Defining Your Character is live',
      body: 'Defining Your Character has started on Rise Radio.',
      iconPath: '/pwa-icon-512x512.png',
      url: '/dashboard/defining-your-character',
    },
  },
  {
    id: 'mystic-mist',
    name: 'Mystic Mist',
    slug: 'mystic-mist',
    href: '/dashboard/mystic-mist',
    hosts: ['Amanda', 'Papaduck78'],
    schedule: { day: 'Sundays', time: 'Coming May 10' },
    supportedLivePlatforms: ['manual', 'zeno'],
    zenoStations: GLOBAL_ZENO_STATIONS,
    imagePath: '/images/main-images/Cover Art/mystic-mist-bg.jpg',
    notification: {
      title: 'Mystic Mist is live',
      body: 'Mystic Mist has started on Rise Radio.',
      iconPath: '/images/main-images/Cover Art/mystic-mist-bg.jpg',
      url: '/dashboard/mystic-mist',
    },
  },
  {
    id: 'time-capsule',
    name: 'Time Capsule',
    slug: 'time-capsule',
    href: '/dashboard/time-capsule',
    hosts: ['Amanda', 'Mark'],
    schedule: { day: 'Every Other Sunday', time: '4:00 PM ET' },
    supportedLivePlatforms: ['manual', 'zeno'],
    zenoStations: GLOBAL_ZENO_STATIONS,
    imagePath: '/images/main-images/Cover Art/time-capsule-cover.jpg',
    notification: {
      title: 'Time Capsule is live',
      body: 'Time Capsule has started on Rise Radio.',
      iconPath: '/images/main-images/Cover Art/time-capsule-cover.jpg',
      url: '/dashboard/time-capsule',
    },
  },
] as const satisfies readonly ShowDefinition[];

export type ShowId = (typeof SHOWS)[number]['id'];

export function getShowById(showId: string): ShowDefinition | null {
  return SHOWS.find((show) => show.id === showId) ?? null;
}

export function isShowLivePlatform(value: string): value is ShowLivePlatform {
  return SHOW_LIVE_PLATFORMS.includes(value as ShowLivePlatform);
}

export function isPlatformSupportedForShow(
  show: ShowDefinition,
  platform: ShowLivePlatform
): boolean {
  return show.supportedLivePlatforms.includes(platform);
}
