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

    let wiretapUrl = '';
    page.on('response', response => {
      const resUrl = response.url();
      // Catching .mp4, .m4a, and the newer .m3u8 (HLS) streams
      if (resUrl.includes('.mp4') || resUrl.includes('.m4a') || resUrl.includes('.m3u8')) {
        if (!resUrl.includes('blob:')) wiretapUrl = resUrl;
      }
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // PHASE 1: JSON Surgery
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

    // PHASE 2: Meta Tags
    log("PHASE 2: Checking Meta Tags...");
    const metaResult = await page.evaluate(() => document.querySelector('meta[property="og:video:url"]')?.getAttribute('content'));
    if (metaResult) { await browser.close(); return NextResponse.json({ success: true, downloadUrl: metaResult, debug: debugLogs }); }

    // PHASE 3 & 4: Interaction
    log("PHASE 3/4: Scrolling & Clicking Play...");
    await page.evaluate(() => window.scrollBy(0, 500));
    try {
      await page.click('div[class*="PlayButton"], video', { timeout: 5000 });
      await page.waitForTimeout(4000);
      if (wiretapUrl) { await browser.close(); return NextResponse.json({ success: true, downloadUrl: wiretapUrl, debug: debugLogs }); }
    } catch (e) { log("Click failed or timed out."); }

    // PHASE 5: The forensic Regex
    log("PHASE 5: Deep Regex Scan...");
    const regexResult = await page.evaluate(() => {
      const matches = document.documentElement.innerHTML.match(/https?:\/\/[^"'\s]+\.(?:mp4|m3u8|m4a)[^"'\s]*/gi);
      return matches?.find(l => l.includes('smule') && !l.includes('profile'))?.replace(/\\u002F/g, '/').replace(/\\/g, '') || null;
    });

    await browser.close();
    if (regexResult) return NextResponse.json({ success: true, downloadUrl: regexResult, debug: debugLogs });

    log("FATAL: All 5 stages failed to find a clear signal.");
    return NextResponse.json({ success: false, error: 'Signal remains cloaked.', debug: debugLogs });

  } catch (error: any) {
    if (browser) await browser.close();
    return NextResponse.json({ success: false, error: error.message, debug: debugLogs });
  }
}