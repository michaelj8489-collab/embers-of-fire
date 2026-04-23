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

    log(">>> [VIDEO RECON START] Target: Smule Video Performance");

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
      log("Master Key Injected.");
    }

    const page = await context.newPage();

    // THE VIDEO WIRETAP
    page.on('request', request => {
      const rUrl = request.url();
      // Specifically hunting for Video formats and Playlists
      if (rUrl.match(/\.(mp4|m3u8|mov|m4v)/i) || rUrl.includes('video-recording')) {
        if (!rUrl.includes('profile') && !rUrl.includes('google-analytics')) {
          interceptedUrls.push(rUrl);
        }
      }
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    log("Executing Human Wobble Click on Video Player...");
    await page.mouse.move(100, 100);
    await page.mouse.move(640, 360, { steps: 25 }); 
    await page.mouse.click(640, 360);
    
    // Give video longer to buffer and reveal its URL
    log("Snooping for high-bandwidth signals...");
    await page.waitForTimeout(12000); 

    await browser.close();

    // VIDEO PRIORITY: Flat MP4 > Master Playlist (m3u8) > Everything else
    const bestLink = interceptedUrls.find(l => l.includes('.mp4')) || 
                     interceptedUrls.find(l => l.includes('.m3u8')) || 
                     interceptedUrls[0];

    if (bestLink) {
      log(`>>> [VICTORY] Video Signal Intercepted: ${bestLink.split('?')[0]}`);
      return NextResponse.json({ success: true, downloadUrl: bestLink.replace(/\\/g, ''), debug: debugLogs });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Video signal is ghosting us.', 
      snooped: interceptedUrls,
      debug: debugLogs 
    });

  } catch (error: any) {
    if (browser) await browser.close();
    return NextResponse.json({ success: false, error: error.message, debug: debugLogs });
  }
}