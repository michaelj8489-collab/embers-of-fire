import { NextResponse } from 'next/server';
import { chromium } from 'playwright-core';

export async function POST(req: Request) {
  let browser;
  try {
    const { url } = await req.json();
    const BROWSERLESS_KEY = process.env.BROWSERLESS_API_KEY;

    browser = await chromium.connectOverCDP(
      `wss://chrome.browserless.io?token=${BROWSERLESS_KEY}`
    );

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    });
    
    const page = await context.newPage();
    
    // THE WIRETAP: Listen for the actual file stream in the background
    let interceptedUrl = '';
    page.on('response', response => {
      const contentType = response.headers()['content-type'];
      const resUrl = response.url();
      
      // If we see a video/audio file or an mp4/m4a extension, grab that URL!
      if (contentType?.includes('video/') || contentType?.includes('audio/') || resUrl.includes('.mp4') || resUrl.includes('.m4a')) {
        if (!resUrl.includes('blob:')) {
          interceptedUrl = resUrl;
        }
      }
    });

    // 1. Head to Smule
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // 2. TRIGGER THE SIGNAL: Scroll to force the player to actually start
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(5000); 

    const title = await page.title();
    await browser.close();

    if (!interceptedUrl) {
      return NextResponse.json({ success: false, error: 'Signal is encrypted or hidden. Try a different link!' });
    }

    const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`;

    return NextResponse.json({ success: true, downloadUrl: interceptedUrl, fileName });

  } catch (error: any) {
    if (browser) await browser.close();
    return NextResponse.json({ success: false, error: `Interception Error: ${error.message}` });
  }
}