import { chromium } from 'playwright';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    console.log(`🕵️ Mission Started: ${url}`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36"
    });
    
    const page = await context.newPage();
    let capturedUrl = "";

    // The Universal Sniffer Logic
    page.on('request', request => {
      const reqUrl = request.url();
      const isMedia = reqUrl.includes('.mp4') || reqUrl.includes('.m4a');
      const isSmule = reqUrl.includes('smu.le') || reqUrl.includes('smule.com');

      if (isMedia && isSmule && !capturedUrl) {
        const type = reqUrl.includes('.mp4') ? "VIDEO" : "AUDIO";
        console.log(`✅ FOUND ${type} LINK: ${reqUrl.slice(0, 50)}...`);
        capturedUrl = reqUrl;
      }
    });

    // 1. Go to the page
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // 2. The Patient Wait
    console.log("⏳ Waiting 10 seconds for media to trigger...");
    await page.waitForTimeout(10000); 
    
    const pageTitle = await page.title();
    await browser.close();

    if (capturedUrl) {
      const cleanTitle = pageTitle.replace(/[^a-z0-9\s-_]/gi, '').trim();
      
      // Determine extension based on what was actually caught
      const extension = capturedUrl.includes('.mp4') ? '.mp4' : '.m4a';
      
      return NextResponse.json({ 
        success: true, 
        downloadUrl: capturedUrl, 
        fileName: `${cleanTitle.slice(0, 50)}${extension}` 
      });
    } else {
      console.log("❌ Sniffer failed to find any media link.");
      return NextResponse.json({ error: 'Media link not found' }, { status: 404 });
    }

  } catch (error) {
    console.error("🚨 API Error:", error);
    return NextResponse.json({ error: 'The sniffer encountered a problem' }, { status: 500 });
  }
}