import { NextResponse } from 'next/server';
import { chromium } from 'playwright-core';

export async function POST(req: Request) {
  let browser;
  try {
    const { url } = await req.json();
    const BROWSERLESS_KEY = process.env.BROWSERLESS_API_KEY;

    if (!BROWSERLESS_KEY) return NextResponse.json({ success: false, error: 'Cloud API Key Missing' });

    console.log(">>> [WATERFALL START] Target:", url);

    browser = await chromium.connectOverCDP(`wss://chrome.browserless.io?token=${BROWSERLESS_KEY}`);
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    // SETUP WIRETAP (Method 2)
    let wiretapUrl = '';
    page.on('response', response => {
      const resUrl = response.url();
      if (resUrl.includes('.mp4') || resUrl.includes('.m4a') || resUrl.includes('video-recording')) {
        if (!resUrl.includes('blob:')) wiretapUrl = resUrl;
      }
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // --- PHASE 1: THE SURGEON (JSON Extraction) ---
    console.log(">>> [PHASE 1] Checking window.DataStore...");
    const jsonResult = await page.evaluate(() => {
      const stateScript = Array.from(document.querySelectorAll('script')).find(s => s.innerText.includes('window.DataStore.state'));
      if (stateScript) {
        const content = stateScript.innerText;
        const videoMatch = content.match(/"video_url":"(https?:\/\/[^"]+)"/);
        const audioMatch = content.match(/"media_url":"(https?:\/\/[^"]+)"/);
        return videoMatch ? videoMatch[1].replace(/\\u002F/g, '/') : audioMatch ? audioMatch[1].replace(/\\u002F/g, '/') : null;
      }
      return null;
    });
    if (jsonResult) { await browser.close(); return NextResponse.json({ success: true, downloadUrl: jsonResult, method: 1 }); }

    // --- PHASE 2: THE META RECON (Social Metadata) ---
    console.log(">>> [PHASE 2] Checking Social Meta Tags...");
    const metaResult = await page.evaluate(() => {
      const ogVideo = document.querySelector('meta[property="og:video:url"]')?.getAttribute('content');
      const twitterStream = document.querySelector('meta[name="twitter:player:stream"]')?.getAttribute('content');
      return ogVideo || twitterStream || null;
    });
    if (metaResult) { await browser.close(); return NextResponse.json({ success: true, downloadUrl: metaResult, method: 2 }); }

    // --- PHASE 3: THE WIRETAP (Network Traffic) ---
    console.log(">>> [PHASE 3] Checking Wiretap results...");
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(3000); 
    if (wiretapUrl) { await browser.close(); return NextResponse.json({ success: true, downloadUrl: wiretapUrl, method: 3 }); }

    // --- PHASE 4: THE INTERACTION TRIGGER (Bot-Click) ---
    console.log(">>> [PHASE 4] Attempting to click Play...");
    try {
      // Find the play button or the video container and click it
      await page.click('div[class*="PlayButton"], .playable, video', { timeout: 5000 });
      await page.waitForTimeout(4000); // Wait for click to trigger load
      if (wiretapUrl) { await browser.close(); return NextResponse.json({ success: true, downloadUrl: wiretapUrl, method: 4 }); }
    } catch (e) { console.log(">>> Play button not clickable or missing."); }

    // --- PHASE 5: THE DEEP SCAN (Global Regex) ---
    console.log(">>> [PHASE 5] Final Brute-Force Regex Scan...");
    const regexResult = await page.evaluate(() => {
      const html = document.documentElement.innerHTML;
      const matches = html.match(/https?:\/\/[^"'\s]+\.(?:mp4|m4v|m4a|mp3)[^"'\s]*/gi);
      const filtered = matches ? matches.filter(l => l.includes('smule') && !l.includes('profile')) : [];
      return filtered.length > 0 ? filtered[0].replace(/\\u002F/g, '/') : null;
    });

    await browser.close();
    if (regexResult) return NextResponse.json({ success: true, downloadUrl: regexResult, method: 5 });

    return NextResponse.json({ success: false, error: 'All 5 Waterfall stages failed. Signal remains cloaked.' });

  } catch (error: any) {
    if (browser) await browser.close();
    return NextResponse.json({ success: false, error: `Waterfall Crash: ${error.message}` });
  }
}