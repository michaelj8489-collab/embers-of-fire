import { NextResponse } from 'next/server';
import { chromium } from 'playwright-core';

export async function POST(req: Request) {
  const startTime = Date.now();
  const interceptedUrls: string[] = [];
  let browser;
  
  try {
    const { url } = await req.json();
    const BROWSERLESS_KEY = process.env.BROWSERLESS_API_KEY;
    const SMULE_COOKIE = process.env.SMULE_COOKIE;

    browser = await chromium.connectOverCDP(`wss://chrome.browserless.io/chromium/stealth?token=${BROWSERLESS_KEY}`);
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    });

    if (SMULE_COOKIE) {
      const cookieArray = SMULE_COOKIE.split(';').map(pair => {
        const [name, ...value] = pair.split('=');
        return { name: name.trim(), value: value.join('=').trim(), domain: '.smule.com', path: '/' };
      });
      await context.addCookies(cookieArray);
    }

    const page = await context.newPage();

    const signalFound = new Promise<string>((resolve) => {
      page.on('request', request => {
        const rUrl = request.url();
        if (rUrl.match(/\.(mp4|m3u8|m4a)/i) && !rUrl.includes('profile')) {
          resolve(rUrl);
        }
      });
    });

    // MOVE: Wait for 'commit' instead of 'domcontentloaded' (Saves ~1-2 seconds)
    await page.goto(url, { waitUntil: 'commit', timeout: 15000 });
    
    // Immediate Blind Click (We don't wait for the button to appear, we just fire)
    await page.mouse.click(640, 360); 

    // CALCULATE REMAINING TIME: 
    // Vercel kills us at 10s. We want to stop at 9.2s to be safe.
    const elapsedSoFar = Date.now() - startTime;
    const remainingTime = 9200 - elapsedSoFar; 

    const bestLink = await Promise.race([
      signalFound,
      new Promise<null>(res => setTimeout(() => res(null), Math.max(remainingTime, 2000)))
    ]);

    await browser.close();

    if (bestLink) {
      return NextResponse.json({ 
        success: true, 
        downloadUrl: (bestLink as string).replace(/\\/g, ''),
        suggestedName: `Rise_Radio_Capture_${Date.now()}.mp4` 
      });
    }

    return NextResponse.json({ success: false, error: 'Signal cloaked. The server was too slow—Try again immediately.' });

  } catch (error: any) {
    if (browser) await browser.close();
    return NextResponse.json({ success: false, error: error.message });
  }
}