import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  const filename = searchParams.get('filename');

  if (!url) return new Response('No URL provided', { status: 400 });

  try {
    // 1. Fetch the file from Smule's servers
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch file');

    // 2. Create a new "stream" of the file data
    const blob = await response.blob();

    // 3. Hand it to the browser with a "FORCE DOWNLOAD" header
    return new NextResponse(blob, {
      headers: {
        'Content-Disposition': `attachment; filename="${filename || 'recording.mp4'}"`,
        'Content-Type': response.headers.get('Content-Type') || 'video/mp4',
      },
    });
  } catch (error) {
    console.error('Download Proxy Error:', error);
    return new Response('Download failed', { status: 500 });
  }
}