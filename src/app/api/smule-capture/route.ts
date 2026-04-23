import { NextResponse } from 'next/server';
import { chromium } from 'playwright-core';

export async function POST(req: Request) {
  const interceptedUrls: string[] = [];
  const debugLogs: string[] = [];
  const log = (msg: string) => debugLogs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);

  let browser;
  try {
    const { url } = await req.json();
    const BROWSERLESS_KEY = process.env.BROWSERLESS_API_KEY;
    const SMULE_COOKIE = process.env.SMULE_COOKIE;

    log(">>> [DEEP RECON START]");

    browser = await chromium.connectOverCDP(`wss://chrome.browserless.io/chromium/stealth?token=${BROWSERLESS_KEY}`);
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    });

    if (SMULE_COOKIE) {
      const cookieArray = SMULE_COOKIE.split(';').map(pair => {
        const [name, ...value] = pair.split('=');
        return {
          name: name.trim(),
          value: value.join('=').trim(),
          domain: '.smule.com',
          path: '/'
        };
      });
      await context.addCookies(cookieArray);
      log("Cookies injected.");
    }

    const page = await context.newPage();

    // The "Wide Net" Wiretap
    page.on('request', request => {
      const rUrl = request.url();
      if (rUrl.includes('smule')) {
        interceptedUrls.push(rUrl);
      }
    });

    log("Navigating...");
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    
    const pageTitle = await page.title();
    log(`Page Title: ${pageTitle}`);

    // HUMAN WOBBLE CLICK: Move to center over 1.5s, then click
    log("Moving mouse with human behavior...");
    await page.mouse.move(100, 100);
    await page.mouse.move(640, 360, { steps: 20 }); 
    await page.mouse.click(640, 360);
    
    log("Waiting for signal...");
    await page.waitForTimeout(9000); 

    await browser.close();

    // Priority hunt in our wide net
    const bestLink = interceptedUrls.find(l => l.includes('.m4a')) || 
                     interceptedUrls.find(l => l.includes('.mp4')) || 
                     interceptedUrls.find(l => l.includes('.m3u8'));

    if (bestLink) {
      return NextResponse.json({ success: true, downloadUrl: bestLink, debug: debugLogs });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Signal cloaked.', 
      titleFound: pageTitle,
      snooped: interceptedUrls,
      debug: debugLogs 
    });

  } catch (error: any) {
    if (browser) await browser.close();
    return NextResponse.json({ success: false, error: error.message, debug: debugLogs });
  }
}