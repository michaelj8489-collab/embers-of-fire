import { NextResponse } from 'next/server';
import { chromium } from 'playwright-core';

export async function POST(req: Request) {
  const debugLogs: string[] = [];
  const log = (msg: string) => {
    debugLogs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
    console.log(msg);
  };

  let browser;
  try {
    const { url } = await req.json();
    const BROWSERLESS_KEY = process.env.BROWSERLESS_API_KEY;

    log(">>> [AGENTIC SNIFFER START] Target: Annie Little Bird...");
    browser = await chromium.connectOverCDP(`wss://chrome.browserless.io?token=${BROWSERLESS_KEY}`);
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }, // Standardizing the view
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    let mediaSignal = '';
    // This is the "Wiretap" - it catches .m3u8 (the 2026 standard) and .mp4
    page.on('response', response => {
      const resUrl = response.url();
      if (resUrl.match(/\.(mp4|m4a|m3u8|mp3)/i) || resUrl.includes('video-recording')) {
        if (!resUrl.includes('blob:') && !resUrl.includes('profile')) {
          mediaSignal = resUrl;
        }
      }
    });

    log("Navigating to target frequency...");
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // PHASE 1: DATASTORE SURGERY
    log("PHASE 1: Extracting from internal state...");
    const jsonLink = await page.evaluate(() => {
      const stateStr = Array.from(document.querySelectorAll('script')).find(s => s.innerText.includes('window.DataStore.state'))?.innerText;
      if (stateStr) {
        const match = stateStr.match(/"(video_url|media_url)":"(https?:\/\/[^"]+)"/);
        return match ? match[2].replace(/\\u002F/g, '/').replace(/\\/g, '') : null;
      }
      return null;
    });
    if (jsonLink) { await browser.close(); return NextResponse.json({ success: true, downloadUrl: jsonLink, method: 'Surgery', debug: debugLogs }); }

    // PHASE 2: ELEMENT HUNTER (The "AI" approach)
    log("PHASE 2: Hunting for the Player button...");
    const clickSuccess = await page.evaluate(() => {
      // Look for the big play icon Smule puts in the middle
      const selectors = ['div[class*="PlayButton"]', '[aria-label="Play"]', 'video', 'canvas', '.playable'];
      for (const selector of selectors) {
        const el = document.querySelector(selector) as HTMLElement;
        if (el) {
          el.scrollIntoView();
          el.click();
          return `Clicked ${selector}`;
        }
      }
      // If no specific button, click the center of the main content
      const main = document.querySelector('main') || document.body;
      main.click();
      return "General click performed";
    });
    log(`Result: ${clickSuccess}`);
    
    // Wait for the "Chatter" to start after the click
    await page.waitForTimeout(8000); 

    if (mediaSignal) {
      log(">>> [VICTORY] Signal intercepted via Wiretap!");
      await browser.close();
      return NextResponse.json({ success: true, downloadUrl: mediaSignal, method: 'Interception', debug: debugLogs });
    }

    // PHASE 3: THE BRUTE (Global Scan)
    log("PHASE 3: Running global regex scan...");
    const bruteLink = await page.evaluate(() => {
      const matches = document.documentElement.innerHTML.match(/https?:\/\/[^"'\s]+\.(?:mp4|m3u8|m4a)[^"'\s]*/gi);
      return matches?.find(l => l.includes('smule') && !l.includes('profile'))?.replace(/\\u002F/g, '/').replace(/\\/g, '') || null;
    });

    await browser.close();
    if (bruteLink) return NextResponse.json({ success: true, downloadUrl: bruteLink, method: 'Brute Force', debug: debugLogs });

    log("FATAL: Signal cloaked by advanced MSE/Blob security.");
    return NextResponse.json({ success: false, error: 'Signal remains cloaked.', debug: debugLogs });

  } catch (error: any) {
    if (browser) await browser.close();
    return NextResponse.json({ success: false, error: error.message, debug: debugLogs });
  }
}