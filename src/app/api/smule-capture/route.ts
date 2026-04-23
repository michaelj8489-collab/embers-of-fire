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

    log(">>> [SNIFFER START] Target acquired.");
    browser = await chromium.connectOverCDP(`wss://chrome.browserless.io?token=${BROWSERLESS_KEY}`);
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    let interceptedMedia = '';
    page.on('response', response => {
      const resUrl = response.url();
      // Catching .mp4, .m4a, and the elusive .m3u8 (HLS streams)
      if (resUrl.includes('.mp4') || resUrl.includes('.m4a') || resUrl.includes('.m3u8')) {
        if (!resUrl.includes('blob:')) interceptedMedia = resUrl;
      }
    });

    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // PHASE 1: JSON Surgery (DataStore check)
    log("PHASE 1: Checking DataStore...");
    const jsonResult = await page.evaluate(() => {
      const state = Array.from(document.querySelectorAll('script')).find(s => s.innerText.includes('window.DataStore.state'))?.innerText;
      if (state) {
        const match = state.match(/"video_url":"(https?:\/\/[^"]+)"/) || state.match(/"media_url":"(https?:\/\/[^"]+)"/);
        return match ? match[1].replace(/\\u002F/g, '/').replace(/\\/g, '') : null;
      }
      return null;
    });
    if (jsonResult) { await browser.close(); return NextResponse.json({ success: true, downloadUrl: jsonResult, debug: debugLogs }); }

    // PHASE 3-4: The "Blind Click" & Scroll
    log("PHASE 3/4: Forcing Interaction...");
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(2000);
    
    try {
      // Trying to click common button names first...
      await page.click('div[class*="PlayButton"], [aria-label="Play"]', { timeout: 3000 });
      log("Click on button successful.");
    } catch (e) {
      log("Button name hidden. Attempting 'Center-of-Screen' Blind Click...");
      // The "Nuclear" Click: Click the middle of where the player usually sits
      await page.mouse.click(500, 400); 
    }
    
    await page.waitForTimeout(6000); // Wait longer for the stream to start
    if (interceptedMedia) { await browser.close(); return NextResponse.json({ success: true, downloadUrl: interceptedMedia, debug: debugLogs }); }

    // PHASE 5: The Forensic Regex
    log("PHASE 5: Deep Regex Scan...");
    const regexResult = await page.evaluate(() => {
      const matches = document.documentElement.innerHTML.match(/https?:\/\/[^"'\s]+\.(?:mp4|m3u8|m4a)[^"'\s]*/gi);
      return matches?.find(l => l.includes('smule') && !l.includes('profile'))?.replace(/\\u002F/g, '/').replace(/\\/g, '') || null;
    });

    await browser.close();
    if (regexResult) return NextResponse.json({ success: true, downloadUrl: regexResult, debug: debugLogs });

    log("FATAL: All Waterfall stages failed. Smule security has upgraded.");
    return NextResponse.json({ success: false, error: 'Signal remains cloaked.', debug: debugLogs });

  } catch (error: any) {
    if (browser) await browser.close();
    return NextResponse.json({ success: false, error: error.message, debug: debugLogs });
  }
}