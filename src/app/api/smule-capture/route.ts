import { NextResponse } from 'next/server';
import { chromium } from 'playwright-core';

export async function POST(req: Request) {
  const debugLogs: string[] = [];
  const interceptedUrls: string[] = [];
  const log = (msg: string) => {
    debugLogs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
    console.log(msg);
  };

  let browser;
  try {
    const { url } = await req.json();
    const BROWSERLESS_KEY = process.env.BROWSERLESS_API_KEY;

    log(">>> [ULTIMATE SNOOPER START] Target: Annie Little Bird");
    browser = await chromium.connectOverCDP(`wss://chrome.browserless.io?token=${BROWSERLESS_KEY}`);
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    // THE X-RAY: Log everything that looks like media or data
    page.on('request', request => {
      const rUrl = request.url();
      if (rUrl.includes('smule') && (rUrl.includes('.m3u8') || rUrl.includes('.mp4') || rUrl.includes('stream') || rUrl.includes('api/recording'))) {
        interceptedUrls.push(rUrl);
      }
    });

    log("Navigating to target...");
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // PHASE 1: FORCE THE PLAY (New specific selectors)
    log("PHASE 1: Hunting for the Play Button SVG...");
    const playResult = await page.evaluate(() => {
      // Smule often puts the click event on the SVG or its parent
      const playSelectors = [
        'svg[class*="PlayIcon"]', 
        'button[aria-label="Play"]', 
        'div[class*="PlayButton"]',
        'div[class*="VideoContainer"]',
        'article'
      ];
      
      for (const s of playSelectors) {
        const el = document.querySelector(s) as HTMLElement;
        if (el) {
          el.scrollIntoView();
          el.click();
          return `SUCCESS: Clicked ${s}`;
        }
      }
      return "FAILED: No play button found";
    });
    log(playResult);

    // Wait 10 seconds - give the "chatter" time to show up
    log("Waiting for network chatter...");
    await page.waitForTimeout(10000);

    await browser.close();

    // If we found URLs, return the most likely one (usually the first .m3u8 or .mp4)
    const bestLink = interceptedUrls.find(l => l.includes('.mp4')) || interceptedUrls[0];

    if (bestLink) {
      log(">>> [VICTORY] Media stream intercepted!");
      return NextResponse.json({ 
        success: true, 
        downloadUrl: bestLink, 
        foundUrls: interceptedUrls, 
        debug: debugLogs 
      });
    }

    log("FATAL: The 'Snooper' heard nothing but silence.");
    return NextResponse.json({ 
      success: false, 
      error: 'Signal is ghosting us.', 
      debug: debugLogs,
      snooped: interceptedUrls 
    });

  } catch (error: any) {
    if (browser) await browser.close();
    return NextResponse.json({ success: false, error: error.message, debug: debugLogs });
  }
}