import { NextResponse } from 'next/server';
import { chromium } from 'playwright-core';

export async function POST(req: Request) {
  const interceptedUrls: string[] = [];
  let browser;
  
  try {
    const { url } = await req.json();
    const BROWSERLESS_KEY = process.env.BROWSERLESS_API_KEY;
    const SMULE_COOKIE = process.env.SMULE_COOKIE; // Your Master Key

    browser = await chromium.connectOverCDP(`wss://chrome.browserless.io/chromium/stealth?token=${BROWSERLESS_KEY}`);
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    });

    // INJECTING YOUR SESSION
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
    }

    const page = await context.newPage();
    
    // THE WIRETAP: Specifically hunting for that .m4a you found!
    page.on('request', request => {
      const rUrl = request.url();
      if (rUrl.includes('.m4a') || rUrl.includes('.mp4') || rUrl.includes('.m3u8')) {
        if (!rUrl.includes('profile')) interceptedUrls.push(rUrl);
      }
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    
    // The "Michael Click" - trigger play with your permissions
    await page.mouse.click(640, 360); 
    await page.waitForTimeout(8000); 

    await browser.close();

    // Priority: .m4a (High Quality) > .mp4 > .m3u8
    const bestLink = interceptedUrls.find(l => l.includes('.m4a')) || 
                     interceptedUrls.find(l => l.includes('.mp4')) || 
                     interceptedUrls[0];

    if (bestLink) {
      return NextResponse.json({ success: true, downloadUrl: bestLink.replace(/\\/g, '') });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Signal remains cloaked even with the Master Key.', 
      snooped: interceptedUrls 
    });

  } catch (error: any) {
    if (browser) await browser.close();
    return NextResponse.json({ success: false, error: error.message });
  }
}