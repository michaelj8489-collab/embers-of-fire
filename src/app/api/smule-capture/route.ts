import { NextResponse } from 'next/server';
import { chromium } from 'playwright-core';
import { createClient } from '@supabase/supabase-js'; // <--- ADD THIS

export async function POST(req: Request) {
  const startTime = Date.now();
  const interceptedUrls: string[] = [];
  let browser;
  
  try {
    const { url, label } = await req.json();
    const SMULE_COOKIE = process.env.SMULE_COOKIE;

    browser = await chromium.launch({
  executablePath: '/home/opc/.cache/ms-playwright/chromium_headless_shell-1217/chrome-linux64/chrome-headless-shell',
  args: [
    '--no-sandbox', 
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage', // Added this to help with the 24GB RAM management
    '--single-process'         // This helps on Oracle Linux specifically
  ]
});

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

      // NITRO BOOST: Block unnecessary assets to save time/bandwidth
        await page.route('**/*', (route) => {
            const type = route.request().resourceType();
               if (['image', 'font', 'stylesheet', 'media'].includes(type) && !route.request().url().includes('.mp4'))
                 {
    
                return route.abort();
          }
                    route.continue();
});

const signalFound = new Promise<string>((resolve) => {
  page.on('request', request => {
    const rUrl = request.url();
    // Aggressive filtering for the specific media types we want
    if (rUrl.match(/\.(mp4|m4a|m3u8)/i) && !rUrl.includes('profile')) {
      resolve(rUrl);
    }
  });
});

// Use 'commit' for maximum speed - we don't need the page to render, just start
await page.goto(url, { waitUntil: 'commit', timeout: 10000 });

// Blind click to trigger the stream immediately
await page.mouse.click(640, 360); 

// ... rest of your logic ...

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
     // This cleans up your label so it doesn't have spaces that break files
    const cleanLabel = label ? label.trim().replace(/\s+/g, '_') : 'Rise_Capture';
    const fileName = `${cleanLabel}_${Date.now()}.mp4`;
      
      // --- START OF NEW LOGGER CODE ---
      // This saves the data to your Supabase "vault" before sending it to your screen
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
      
      await supabase.from('sniffer_logs').insert({
        filename: fileName,
        download_url: (bestLink as string).replace(/\\/g, ''),
        original_smule_url: url,
        captured_by_name: 'Michael J Cox' // Or Diane!
      });
      // --- END OF NEW LOGGER CODE ---
      return NextResponse.json({ 
        success: true, 
        downloadUrl: (bestLink as string).replace(/\\/g, ''),
        suggestedName: fileName 
      });
    }

    return NextResponse.json({ success: false, error: 'Signal cloaked. The server was too slow—Try again immediately.' });

  } catch (error: any) {
    if (browser) await browser.close();
    return NextResponse.json({ success: false, error: error.message });
  }
}
