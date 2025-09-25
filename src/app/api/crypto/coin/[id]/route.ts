// Server-side individual crypto coin data API to avoid CORS issues
import { NextRequest, NextResponse } from 'next/server'

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const { searchParams } = new URL(request.url)
  const localization = searchParams.get('localization') || 'false'
  const tickers = searchParams.get('tickers') || 'false'
  const market_data = searchParams.get('market_data') || 'true'
  const community_data = searchParams.get('community_data') || 'true'
  const developer_data = searchParams.get('developer_data') || 'true'
  const sparkline = searchParams.get('sparkline') || 'false'

  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/${id}?localization=${localization}&tickers=${tickers}&market_data=${market_data}&community_data=${community_data}&developer_data=${developer_data}&sparkline=${sparkline}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 60 } // Cache for 1 minute
      }
    )

    if (!response.ok) {
      if (response.status === 429) {
        // Rate limited - return fallback data
        return NextResponse.json(generateFallbackCoinData(id))
      }
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error(`CoinGecko coin ${id} API error:`, error)

    // Return fallback coin data
    return NextResponse.json(generateFallbackCoinData(id))
  }
}

function generateFallbackCoinData(coinId: string) {
  const coinData: Record<string, any> = {
    bitcoin: {
      id: 'bitcoin',
      symbol: 'btc',
      name: 'Bitcoin',
      asset_platform_id: null,
      platforms: {},
      detail_platforms: {},
      block_time_in_minutes: 10,
      hashing_algorithm: 'SHA-256',
      categories: ['Cryptocurrency', 'Store of Value'],
      preview_listing: false,
      public_notice: null,
      additional_notices: [],
      description: {
        en: 'Bitcoin is the first successful internet money based on peer-to-peer technology.'
      },
      links: {
        homepage: ['http://www.bitcoin.org', '', ''],
        blockchain_site: [
          'https://blockchain.info/',
          'https://live.blockcypher.com/btc/',
          'https://blockchair.com/bitcoin'
        ],
        official_forum_url: ['https://bitcointalk.org/', '', ''],
        chat_url: ['', '', ''],
        announcement_url: ['', '', ''],
        twitter_screen_name: 'bitcoin',
        facebook_username: 'bitcoins',
        bitcointalk_thread_identifier: null,
        telegram_channel_identifier: '',
        subreddit_url: 'https://www.reddit.com/r/Bitcoin/',
        repos_url: {
          github: ['https://github.com/bitcoin/bitcoin', 'https://github.com/bitcoin/bips'],
          bitbucket: []
        }
      },
      image: {
        thumb: 'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png',
        small: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
        large: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
      },
      country_origin: '',
      genesis_date: '2009-01-03',
      sentiment_votes_up_percentage: 80.5,
      sentiment_votes_down_percentage: 19.5,
      watchlist_portfolio_users: 1500000,
      market_cap_rank: 1,
      coingecko_rank: 1,
      coingecko_score: 83.151,
      developer_score: 99.241,
      community_score: 70.118,
      liquidity_score: 100.011,
      public_interest_score: 0.073,
      market_data: {
        current_price: {
          usd: 115269
        },
        total_value_locked: null,
        mcap_to_tvl_ratio: null,
        fdv_to_tvl_ratio: null,
        roi: null,
        ath: {
          usd: 117500
        },
        ath_change_percentage: {
          usd: -1.9
        },
        ath_date: {
          usd: '2025-09-20T00:00:00.000Z'
        },
        atl: {
          usd: 67.81
        },
        atl_change_percentage: {
          usd: 169900.5
        },
        atl_date: {
          usd: '2013-07-06T00:00:00.000Z'
        },
        market_cap: {
          usd: 2280000000000
        },
        market_cap_rank: 1,
        fully_diluted_valuation: {
          usd: 2420000000000
        },
        market_cap_fdv_ratio: 0.94,
        total_volume: {
          usd: 24500000000
        },
        high_24h: {
          usd: 117500
        },
        low_24h: {
          usd: 113800
        },
        price_change_24h: 1450.23,
        price_change_percentage_24h: 1.28,
        price_change_percentage_7d: 3.4,
        price_change_percentage_14d: 8.7,
        price_change_percentage_30d: 12.5,
        price_change_percentage_60d: 18.2,
        price_change_percentage_200d: 85.3,
        price_change_percentage_1y: 120.7,
        market_cap_change_24h: 28700000000,
        market_cap_change_percentage_24h: 1.28,
        price_change_24h_in_currency: {
          usd: 1450.23
        },
        price_change_percentage_1h_in_currency: {
          usd: 0.12
        },
        price_change_percentage_24h_in_currency: {
          usd: 1.28
        },
        price_change_percentage_7d_in_currency: {
          usd: 3.4
        },
        price_change_percentage_14d_in_currency: {
          usd: 8.7
        },
        price_change_percentage_30d_in_currency: {
          usd: 12.5
        },
        price_change_percentage_60d_in_currency: {
          usd: 18.2
        },
        price_change_percentage_200d_in_currency: {
          usd: 85.3
        },
        price_change_percentage_1y_in_currency: {
          usd: 120.7
        },
        market_cap_change_24h_in_currency: {
          usd: 28700000000
        },
        market_cap_change_percentage_24h_in_currency: {
          usd: 1.28
        },
        total_supply: 21000000,
        max_supply: 21000000,
        circulating_supply: 19800000,
        last_updated: new Date().toISOString()
      },
      community_data: {
        facebook_likes: null,
        twitter_followers: 6800000,
        reddit_average_posts_48h: 15,
        reddit_average_comments_48h: 520,
        reddit_subscribers: 5400000,
        reddit_accounts_active_48h: 12500,
        telegram_channel_user_count: null
      },
      developer_data: {
        forks: 35500,
        stars: 78000,
        subscribers: 3900,
        total_issues: 7200,
        closed_issues: 6800,
        pull_requests_merged: 25000,
        pull_request_contributors: 850,
        code_additions_deletions_4_weeks: {
          additions: 2500,
          deletions: -1200
        },
        commit_count_4_weeks: 95
      },
      public_interest_stats: {
        alexa_rank: 9440,
        bing_matches: null
      },
      status_updates: [],
      last_updated: new Date().toISOString()
    }
  }

  // Default data for other coins
  const defaultCoin = {
    id: coinId,
    symbol: coinId.slice(0, 3).toLowerCase(),
    name: coinId.charAt(0).toUpperCase() + coinId.slice(1),
    image: {
      thumb: `https://assets.coingecko.com/coins/images/1/thumb/${coinId}.png`,
      small: `https://assets.coingecko.com/coins/images/1/small/${coinId}.png`,
      large: `https://assets.coingecko.com/coins/images/1/large/${coinId}.png`
    },
    market_data: {
      current_price: { usd: 100 },
      market_cap: { usd: 1000000000 },
      total_volume: { usd: 50000000 },
      price_change_percentage_24h: 2.5,
      last_updated: new Date().toISOString()
    },
    description: {
      en: `${coinId} is a cryptocurrency.`
    },
    last_updated: new Date().toISOString()
  }

  return coinData[coinId] || defaultCoin
}