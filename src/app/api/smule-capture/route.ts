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
    
    // 1. Navigate and wait for the page to settle
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // 2. WAIT for the video/audio to actually show up (Max 10 seconds)
    try {
      await page.waitForSelector('video, audio, meta[property="og:video:url"]', { timeout: 10000 });
    } catch (e) {
      console.log("Waiting timed out, trying to sniff anyway...");
    }

    // 3. THE DEEP SNIFF
    const mediaData = await page.evaluate(() => {
      // Try finding the actual player tags first
      const video = document.querySelector('video') as HTMLVideoElement;
      const audio = document.querySelector('audio') as HTMLAudioElement;
      
      // FALLBACK: Look for the secret Open Graph tags in the <head>
      const ogVideo = document.querySelector('meta[property="og:video:url"]')?.getAttribute('content');
      const ogAudio = document.querySelector('meta[property="og:audio:url"]')?.getAttribute('content');
      const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');

      return {
        url: video?.src || audio?.src || ogVideo || ogAudio || null,
        title: ogTitle || document.querySelector('title')?.innerText || 'smule_capture'
      };
    });

    await browser.close();

    if (!mediaData.url) {
      return NextResponse.json({ success: false, error: 'Signal not found. Smule might be hiding it today!' });
    }

    const fileName = `${mediaData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`;

    return NextResponse.json({ success: true, downloadUrl: mediaData.url, fileName });

  } catch (error: any) {
    console.error('Cloud Sniffer Error:', error);
    return NextResponse.json({ success: false, error: error.message });
  }
}