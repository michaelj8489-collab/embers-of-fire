import { NextResponse } from 'next/server';
import { chromium } from 'playwright-core';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const BROWSERLESS_KEY = process.env.BROWSERLESS_API_KEY;

    if (!BROWSERLESS_KEY) {
      return NextResponse.json({ success: false, error: 'Cloud API Key Missing' });
    }

    // Connect to the Cloud Browser in the Browserless data center
    const browser = await chromium.connectOverCDP(
      `wss://chrome.browserless.io?token=${BROWSERLESS_KEY}`
    );

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    });
    
    const page = await context.newPage();
    
    // Navigate to Smule
    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });

    // Sniff for the media link
    const mediaData = await page.evaluate(() => {
      const video = document.querySelector('video') as HTMLVideoElement;
      const audio = document.querySelector('audio') as HTMLAudioElement;
      const titleElement = document.querySelector('title');
      
      return {
        url: video?.src || audio?.src || null,
        title: titleElement?.innerText || 'smule_capture'
      };
    });

    await browser.close();

    if (!mediaData.url) {
      return NextResponse.json({ success: false, error: 'Could not find the signal on this page.' });
    }

    const fileName = `${mediaData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`;

    return NextResponse.json({ 
      success: true, 
      downloadUrl: mediaData.url, 
      fileName 
    });

  } catch (error: any) {
    console.error('Cloud Sniffer Error:', error);
    return NextResponse.json({ success: false, error: error.message });
  }
}