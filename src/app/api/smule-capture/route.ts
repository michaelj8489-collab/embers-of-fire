import { NextResponse } from 'next/server';
import { chromium } from 'playwright-core';

export async function POST(req: Request) {
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

    // THE SPEED TRAP: As soon as we see an mp4/m3u8, we stop everything!
    const signalFound = new Promise<string>((resolve) => {
      page.on('request', request => {
        const rUrl = request.url();
        if (rUrl.match(/\.(mp4|m3u8|m4a)/i) && !rUrl.includes('profile')) {
          resolve(rUrl);
        }
      });
    });

    // Fast load - don't wait for images or CSS
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    // Immediate Click
    await page.mouse.click(640, 360); 

    // RACE: Wait for the signal OR a max of 7 seconds (to beat Vercel's 10s timer)
    const bestLink = await Promise.race([
      signalFound,
      new Promise<null>(res => setTimeout(() => res(null), 7000))
    ]);

    await browser.close();

    if (bestLink) {
      // FIXING THE "UNDEFINED" FILENAME: 
      // We send back a suggested filename in the JSON
      return NextResponse.json({ 
        success: true, 
        downloadUrl: (bestLink as string).replace(/\\/g, ''),
        suggestedName: `Smule_Capture_${Date.now()}.mp4` 
      });
    }

    return NextResponse.json({ success: false, error: 'Signal cloaked. Try one more time.' });

  } catch (error: any) {
    if (browser) await browser.close();
    return NextResponse.json({ success: false, error: error.message });
  }
}