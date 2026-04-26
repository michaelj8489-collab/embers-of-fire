import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const scraperUrl = process.env.NEXT_PUBLIC_SCRAPER_API_URL;

    // 1. Tell the Oracle to start the Capture
    const response = await fetch(`${scraperUrl}/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    // 2. If the Oracle found the video, we route the download through the Bouncer
    if (data.url) {
      const bouncerLink = `${scraperUrl}/stream?url=${encodeURIComponent(data.url)}`;
      
      return NextResponse.json({
        ...data,
        downloadUrl: bouncerLink, // Forces the download through the Oracle
        success: true
      });
    }

    return NextResponse.json({ ...data, success: false });
  } catch (error: any) {
    console.error("Oracle Connection Error:", error);
    return NextResponse.json({ success: false, error: 'The Oracle is unreachable' }, { status: 500 });
  }
}