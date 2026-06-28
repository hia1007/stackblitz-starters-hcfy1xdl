import { NextResponse } from 'next/server';

// 🚀 FORCES VERCEL NOT TO CACHE THIS ROUTE (Crucial for bypassing firewalls)
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Multiple realistic browser user agents to rotate through
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.5; rv:127.0) Gecko/20100101 Firefox/127.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Exponential backoff retry logic with cache-busting
async function fetchWithRetry(
  baseUrl: string,
  options: RequestInit,
  maxRetries: number = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.random() * 2000 + 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Add a dynamic timestamp to bypass aggressive firewall caching
      const cacheBuster = `&_t=${new Date().getTime() + attempt}`;
      const url = baseUrl.includes('?') ? `${baseUrl}${cacheBuster}` : `${baseUrl}?${cacheBuster}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); 

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) return response;

      if (response.status >= 500 || response.status === 403) {
        lastError = new Error(`HTTP ${response.status}: Server or Firewall error`);
        console.log(`Attempt ${attempt + 1}/${maxRetries} failed with HTTP ${response.status}, retrying...`);
        continue;
      }

      return response;
    } catch (error: any) {
      lastError = error;
      console.log(`Attempt ${attempt + 1}/${maxRetries} failed:`, error.message);
      if (attempt === maxRetries - 1) throw lastError;
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accountNo = searchParams.get('accountNo');

  if (!accountNo) {
    return NextResponse.json({ error: 'Account number missing in request.' }, { status: 400 });
  }

  const userAgent = getRandomUserAgent();

  // 🦊 MAXIMUM STEALTH HEADERS
  const headers = {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8',
    'User-Agent': userAgent,
    'Referer': 'https://prepaid.desco.org.bd/',
    'Origin': 'https://prepaid.desco.org.bd',
    'Connection': 'keep-alive',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'Pragma': 'no-cache',
    'Cache-Control': 'no-cache',
  };

  try {
    console.log(`[DESCO] Fetching account ${accountNo} with Stealth UA...`);

    let balanceData: any = null;
    let rechargeData: any = null;

    // 1. Fetch Balance
    try {
      const balanceRes = await fetchWithRetry(
        `https://prepaid.desco.org.bd/api/unified/customer/getBalance?accountNo=${accountNo}`,
        { headers, cache: 'no-store' },
        3
      );
      balanceData = await balanceRes.json();
    } catch (error: any) {
      console.error(`[DESCO] Balance fetch failed:`, error.message);
    }

    // 2. Fetch History in Parallel
    try {
      const endpoints = [
        `https://prepaid.desco.org.bd/api/unified/customer/getRechargeHistory?accountNo=${accountNo}`,
        `https://prepaid.desco.org.bd/api/tkdes/customer/getRechargeHistory?accountNo=${accountNo}`,
        `https://prepaid.desco.org.bd/api/unified/customer/getVendingHistory?accountNo=${accountNo}`,
        `https://prepaid.desco.org.bd/api/tkdes/customer/getVendingHistory?accountNo=${accountNo}`
      ];

      const historyPromises = endpoints.map(url => 
        fetchWithRetry(url, { headers, cache: 'no-store' }, 2).catch(() => null)
      );

      const responses = await Promise.all(historyPromises);
      const historyJsons = await Promise.all(
        responses.map(res => res?.ok ? res.json().catch(() => null) : null)
      );

      for (const data of historyJsons) {
        if (data && data.code === 200 && Array.isArray(data.data) && data.data.length > 0) {
          if (data.data[0].totalAmount !== undefined || data.data[0].amount !== undefined) {
            rechargeData = data;
            break;
          }
        }
      }
    } catch (error: any) {
      console.error('[DESCO] History fetch error:', error.message);
    }

    // If both failed, trigger the fallback block
    if (!balanceData && !rechargeData) {
      throw new Error('DESCO server refused all stealth connections.');
    }

    return NextResponse.json(
      {
        balanceData,
        rechargeData,
        fetchedAt: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
    
  } catch (error: any) {
    console.error('[DESCO] Proxy Error:', error.message);
    
    // Returning 200 with a fallback flag prevents the UI from throwing a hard 500 error page
    return NextResponse.json(
      {
        error: 'Failed to connect to DESCO grid servers',
        message: error.message,
        fallback: true,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}