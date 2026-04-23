import { NextResponse } from 'next/server';
import { chromium } from 'playwright-core';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const BROWSERLESS_KEY = process.env.BROWSERLESS_API_KEY;

    const browser = await chromium.connectOverCDP(
      `wss://chrome.browserless.io?token=${BROWSERLESS_KEY}`
    );

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    });
    
    const page = await context.newPage();
    
    // 1. Navigate and wait for the page to actually load
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // 2. GIVE IT A SECOND: Smule players sometimes take a beat to inject the source
    await page.waitForTimeout(3000); 

    // 3. THE ULTRA SNIFF
    const mediaData = await page.evaluate(() => {
      const video = document.querySelector('video');
      const audio = document.querySelector('audio');
      // Look specifically for the internal source tag
      const source = document.querySelector('video source, audio source');
      
      // Metadata fallbacks (The "Social Share" links)
      const ogVideo = document.querySelector('meta[property="og:video:url"]')?.getAttribute('content');
      const twitterStream = document.querySelector('meta[name="twitter:player:stream"]')?.getAttribute('content');
      const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');

      return {
        url: video?.src || audio?.src || source?.getAttribute('src') || ogVideo || twitterStream || null,
        title: ogTitle || document.querySelector('title')?.innerText || 'smule_capture'
      };
    });

    await browser.close();

    // If the URL is just a blob or empty, we fail gracefully
    if (!mediaData.url || mediaData.url.startsWith('blob:')) {
      return NextResponse.json({ success: false, error: 'Signal is encrypted or hidden. Try a different performance link!' });
    }

    const fileName = `${mediaData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`;

    return NextResponse.json({ success: true, downloadUrl: mediaData.url, fileName });

  } catch (error: any) {
    console.error('Cloud Sniffer Error:', error);
    return NextResponse.json({ success: false, error: error.message });
  }
}