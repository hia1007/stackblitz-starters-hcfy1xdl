import { NextResponse } from 'next/server';

// Multiple realistic browser user agents to rotate through
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
  'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/119.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
];

// Get random user agent
function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Exponential backoff retry logic
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Add random delay between retries (1-3 seconds)
      if (attempt > 0) {
        const delay = Math.random() * 2000 + 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return response;
      }

      // If 500+ error, retry; otherwise return the error response
      if (response.status >= 500) {
        lastError = new Error(`HTTP ${response.status}: Server error`);
        console.log(`Attempt ${attempt + 1}/${maxRetries} failed with HTTP ${response.status}, retrying...`);
        continue;
      }

      return response;
    } catch (error: any) {
      lastError = error;
      console.log(`Attempt ${attempt + 1}/${maxRetries} failed:`, error.message);

      if (attempt === maxRetries - 1) {
        throw lastError;
      }
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

  // Rotate user agent
  const userAgent = getRandomUserAgent();

  const headers = {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8',
    'User-Agent': userAgent,
    'Referer': 'https://prepaid.desco.org.bd/',
    'Origin': 'https://prepaid.desco.org.bd',
    'Connection': 'keep-alive',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  };

  try {
    console.log(`[DESCO] Fetching account ${accountNo} with UA: ${userAgent.substring(0, 50)}...`);

    // Try primary endpoint first with retries
    let balanceRes: Response | null = null;
    let balanceData: any = null;

    try {
      balanceRes = await fetchWithRetry(
        `https://prepaid.desco.org.bd/api/unified/customer/getBalance?accountNo=${accountNo}`,
        { headers, next: { revalidate: 300 } },
        3
      );

      if (balanceRes.ok) {
        balanceData = await balanceRes.json();
        console.log(`[DESCO] Balance fetch successful (HTTP ${balanceRes.status})`);
      } else {
        console.log(`[DESCO] Balance fetch returned HTTP ${balanceRes.status}`);
      }
    } catch (error: any) {
      console.error(`[DESCO] Balance fetch failed after retries:`, error.message);
    }

    // Fetch history data in parallel with retries
    let rechargeData: any = null;

    try {
      const [res1, res2, res3, res4] = await Promise.all([
        fetchWithRetry(
          `https://prepaid.desco.org.bd/api/unified/customer/getRechargeHistory?accountNo=${accountNo}`,
          { headers, next: { revalidate: 300 } },
          2
        ).catch(() => null),
        fetchWithRetry(
          `https://prepaid.desco.org.bd/api/tkdes/customer/getRechargeHistory?accountNo=${accountNo}`,
          { headers, next: { revalidate: 300 } },
          2
        ).catch(() => null),
        fetchWithRetry(
          `https://prepaid.desco.org.bd/api/unified/customer/getVendingHistory?accountNo=${accountNo}`,
          { headers, next: { revalidate: 300 } },
          2
        ).catch(() => null),
        fetchWithRetry(
          `https://prepaid.desco.org.bd/api/tkdes/customer/getVendingHistory?accountNo=${accountNo}`,
          { headers, next: { revalidate: 300 } },
          2
        ).catch(() => null),
      ]);

      const historyResponses = await Promise.all([
        res1?.ok ? res1.json() : null,
        res2?.ok ? res2.json() : null,
        res3?.ok ? res3.json() : null,
        res4?.ok ? res4.json() : null,
      ]);

      // SMART CHECK: Find the response with actual data
      for (const data of historyResponses) {
        if (data && data.code === 200 && Array.isArray(data.data) && data.data.length > 0) {
          if (data.data[0].totalAmount !== undefined) {
            rechargeData = data;
            console.log('[DESCO] Recharge history fetch successful');
            break;
          }
        }
      }
    } catch (error: any) {
      console.error('[DESCO] History fetch error:', error.message);
    }

    if (!balanceData) {
      throw new Error('DESCO balance fetch failed - no response data');
    }

    // Return the verified payload
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
          'Access-Control-Allow-Methods': 'GET',
          'Cache-Control': 'private, max-age=300',
        },
      }
    );
  } catch (error: any) {
    console.error('[DESCO] Proxy Error:', error.message);
    return NextResponse.json(
      {
        error: 'Failed to connect to DESCO grid servers',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
