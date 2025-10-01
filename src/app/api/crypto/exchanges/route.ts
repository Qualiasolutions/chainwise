import { NextRequest, NextResponse } from 'next/server';

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const perPage = searchParams.get('per_page') || '100';

    const response = await fetch(
      `${COINGECKO_API_BASE}/exchanges?per_page=${perPage}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Exchanges API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exchanges data' },
      { status: 500 }
    );
  }
}
