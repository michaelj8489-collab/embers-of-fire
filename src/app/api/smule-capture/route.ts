import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const scraperUrl = process.env.NEXT_PUBLIC_SCRAPER_API_URL;

    // 1. Send the link to the Oracle Spy
    const response = await fetch(`${scraperUrl}/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    // 2. If the Oracle found a video, we re-route the download through the Bouncer
    if (data.url) {
      // This creates a link that says: "Hey Oracle, go grab this specific video for me"
      const bouncerLink = `${scraperUrl}/stream?url=${encodeURIComponent(data.url)}`;
      
      return NextResponse.json({
        ...data,
        downloadUrl: bouncerLink, // The browser will now call the Oracle, not Smule
        success: true
      });
    }

    return NextResponse.json({ ...data, success: false });
  } catch (error: any) {
    console.error("Oracle Connection Error:", error);
    return NextResponse.json({ success: false, error: 'The Oracle is unreachable' }, { status: 500 });
  }
}