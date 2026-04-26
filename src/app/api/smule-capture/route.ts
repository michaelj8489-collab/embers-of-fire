import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
  // Replace the hardcoded fetch line with this:
const response = await fetch(`${process.env.NEXT_PUBLIC_SCRAPER_API_URL}/ping`, {
    method: 'GET',
});
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Send Oracle's reply back to your screen
    return NextResponse.json({ success: true, message: data.message });
    
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Connection Failed: ' + error.message });
  }
}