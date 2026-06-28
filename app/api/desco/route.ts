import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accountNo = searchParams.get('accountNo');

  if (!accountNo) {
    return NextResponse.json({ error: 'Account number missing in request.' }, { status: 400 });
  }

  try {
    // Securely pinging DESCO's internal web portal API
    const response = await fetch(`https://prepaid.desco.org.bd/api/unified/customer/getBalance?accountNo=${accountNo}`, {
      headers: {
        'Accept': 'application/json',
        // Spoofing the User-Agent prevents basic bot-blocking firewalls from rejecting the request
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      // Caching the response for 5 minutes (300s) to prevent spamming their servers
      next: { revalidate: 300 } 
    });

    if (!response.ok) {
      throw new Error('DESCO server rejected the proxy request.');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("DESCO Proxy Fault:", error);
    return NextResponse.json({ error: 'Synchronization with DESCO grid failed.' }, { status: 500 });
  }
}