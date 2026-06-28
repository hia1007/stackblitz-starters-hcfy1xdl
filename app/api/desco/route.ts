import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accountNo = searchParams.get('accountNo');

  if (!accountNo) {
    return NextResponse.json({ error: 'Account number missing in request.' }, { status: 400 });
  }

  const headers = {
    'Accept': 'application/json, text/plain, */*',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://prepaid.desco.org.bd/',
    'Origin': 'https://prepaid.desco.org.bd',
    'Connection': 'keep-alive'
  };

  try {
    // ⚡ FIRE ALL REQUESTS CONCURRENTLY
    // We ping multiple potential endpoints across both of DESCO's internal servers
    const [balanceRes, unified1, tkdes1, unified2, tkdes2] = await Promise.all([
      fetch(`https://prepaid.desco.org.bd/api/unified/customer/getBalance?accountNo=${accountNo}`, { headers, next: { revalidate: 300 } }),
      fetch(`https://prepaid.desco.org.bd/api/unified/customer/getRechargeHistory?accountNo=${accountNo}`, { headers, next: { revalidate: 300 } }),
      fetch(`https://prepaid.desco.org.bd/api/tkdes/customer/getRechargeHistory?accountNo=${accountNo}`, { headers, next: { revalidate: 300 } }),
      fetch(`https://prepaid.desco.org.bd/api/unified/customer/getVendingHistory?accountNo=${accountNo}`, { headers, next: { revalidate: 300 } }),
      fetch(`https://prepaid.desco.org.bd/api/tkdes/customer/getVendingHistory?accountNo=${accountNo}`, { headers, next: { revalidate: 300 } })
    ]);

    const balanceData = balanceRes.ok ? await balanceRes.json() : null;
    
    // Parse all history responses
    const historyResponses = await Promise.all([
      unified1.ok ? unified1.json() : null,
      tkdes1.ok ? tkdes1.json() : null,
      unified2.ok ? unified2.json() : null,
      tkdes2.ok ? tkdes2.json() : null
    ]);

    let rechargeData = null;

    // SMART CHECK: Loop through the responses and pick the one that actually contains your real array
    for (const data of historyResponses) {
      if (data && data.code === 200 && Array.isArray(data.data) && data.data.length > 0) {
        // Confirm it's the right array by checking for totalAmount
        if (data.data[0].totalAmount !== undefined) {
           rechargeData = data;
           break;
        }
      }
    }

    if (!balanceRes.ok) {
      throw new Error(`DESCO portal rejected balance request.`);
    }

    // Return the verified payload
    return NextResponse.json({
      balanceData,
      rechargeData
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      }
    });
  } catch (error: any) {
    console.error("DESCO Proxy Error:", error.message);
    return NextResponse.json({ error: 'Failed to sync with DESCO grid.' }, { status: 500 });
  }
}