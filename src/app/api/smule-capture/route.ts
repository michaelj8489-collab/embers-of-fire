import { NextResponse } from 'next/server';
import { chromium } from 'playwright-core';

export async function POST(req: Request) {
  let browser;
  try {
    const { url } = await req.json();
    const BROWSERLESS_KEY = process.env.BROWSERLESS_API_KEY;

    browser = await chromium.connectOverCDP(
      `wss://chrome.browserless.io?token=${BROWSERLESS_KEY}`
    );

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    });
    
    const page = await context.newPage();
    
    // 1. Go to the page and wait for the "State" to be injected
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // 2. THE SURGERY: Pull the direct link out of the hidden Smule State
    const mediaData = await page.evaluate(() => {
      // Smule embeds the entire recording data in a script tag
      const scripts = Array.from(document.querySelectorAll('script'));
      const stateScript = scripts.find(s => s.innerText.includes('window.DataStore.state'));
      
      if (stateScript) {
        const content = stateScript.innerText;
        // This regex hunts for the actual media URL hidden in the text
        const videoMatch = content.match(/"video_url":"(https?:\/\/[^"]+)"/);
        const audioMatch = content.match(/"media_url":"(https?:\/\/[^"]+)"/);
        const titleMatch = content.match(/"title":"([^"]+)"/);

        return {
          url: videoMatch ? videoMatch[1].replace(/\\u002F/g, '/') : 
               audioMatch ? audioMatch[1].replace(/\\u002F/g, '/') : null,
          title: titleMatch ? titleMatch[1] : 'smule_capture'
        };
      }
      return { url: null, title: 'smule_capture' };
    });

    await browser.close();

    if (!mediaData.url) {
      return NextResponse.json({ success: false, error: 'Smule is cloaking this signal. Try a different performance!' });
    }

    const fileName = `${mediaData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`;

    return NextResponse.json({ 
      success: true, 
      downloadUrl: mediaData.url, 
      fileName 
    });

  } catch (error: any) {
    if (browser) await browser.close();
    return NextResponse.json({ success: false, error: `Cloud Failure: ${error.message}` });
  }
}