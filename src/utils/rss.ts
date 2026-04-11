import Parser from 'rss-parser';

const parser = new Parser();

export async function getEpisodes(rssUrl: string) {
  try {
    const feed = await parser.parseURL(rssUrl);
    // Add ": any" here to tell TypeScript it's okay for now
    return feed.items.map((item: any) => ({
      title: item.title,
      description: item.contentSnippet,
      pubDate: item.pubDate,
      audioUrl: item.enclosure?.url,
      link: item.link,
    }));
  } catch (error) {
    console.error("RSS Parsing Error:", error);
    return [];
  }
}