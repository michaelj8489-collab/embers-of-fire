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

    log(">>> [STEALTH MISSION START] Target: Annie Little Bird");

    // MOVE 1: The Stealth Endpoint
    browser = await chromium.connectOverCDP(`wss://chrome.browserless.io/chromium/stealth?token=${BROWSERLESS_KEY}`);
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    // MOVE 2: Wiretap Everything
    page.on('request', request => {
      const rUrl = request.url();
      if (rUrl.includes('smule') && (rUrl.includes('.m3u8') || rUrl.includes('.mp4') || rUrl.includes('stream'))) {
        interceptedUrls.push(rUrl);
      }
    });

    log("Navigating in Stealth Mode...");
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

    // MOVE 3: The Nuclear Click (Middle of Player)
    log("Executing Nuclear Click at (640, 360)...");
    await page.mouse.click(640, 360); 
    
    // Give it 7 seconds to start the chatter
    log("Snooping for signals...");
    await page.waitForTimeout(7000); 

    await browser.close();

    const bestLink = interceptedUrls.find(l => l.includes('.m3u8')) || interceptedUrls[0];

    if (bestLink) {
      log(">>> [VICTORY] Signal Captured!");
      return NextResponse.json({ success: true, downloadUrl: bestLink, snooped: interceptedUrls, debug: debugLogs });
    }

    log("FATAL: Still no signal heard.");
    return NextResponse.json({ success: false, error: 'Signal is ghosting us.', debug: debugLogs, snooped: interceptedUrls });

  } catch (error: any) {
    if (browser) await browser.close();
    return NextResponse.json({ success: false, error: error.message, debug: debugLogs });
  }
}