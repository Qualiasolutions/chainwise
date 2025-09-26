// Individual Coin Details API Route - Proxy for CoinGecko
// GET /api/crypto/coins/[id] - Get detailed information for a specific cryptocurrency

import { NextRequest, NextResponse } from 'next/server'

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'

// Comprehensive fallback data for popular cryptocurrencies
const FALLBACK_COIN_DATA: Record<string, any> = {
  bitcoin: {
    id: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    image: {
      large: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
    },
    market_cap_rank: 1,
    market_data: {
      current_price: { usd: 112000 },
      market_cap: { usd: 2200000000000 },
      total_volume: { usd: 28000000000 },
      price_change_percentage_24h: 1.82,
      price_change_percentage_7d: 5.2,
      price_change_percentage_30d: 12.8,
      high_24h: { usd: 113500 },
      low_24h: { usd: 110500 },
      circulating_supply: 19650000,
      total_supply: 21000000,
      max_supply: 21000000,
      ath: { usd: 115000 },
      ath_date: { usd: "2025-01-15T00:00:00Z" },
      atl: { usd: 67.81 },
      atl_date: { usd: "2013-07-06T00:00:00Z" }
    },
    description: {
      en: "Bitcoin is the first successful internet money based on peer-to-peer technology; whereby no central bank or authority is involved in the transaction and production of the Bitcoin currency. It was created by an anonymous individual/group under the name, Satoshi Nakamoto. The source code is available publicly as an open source project, anybody can look at it and be part of the developmental process."
    },
    links: {
      homepage: ["https://bitcoin.org"],
      blockchain_site: ["https://blockchair.com/bitcoin", "https://btc.com"],
      twitter_screen_name: "bitcoin",
      facebook_username: "",
      telegram_channel_identifier: "",
      subreddit_url: "https://www.reddit.com/r/Bitcoin",
      repos_url: { github: ["https://github.com/bitcoin/bitcoin"] }
    },
    community_data: {
      twitter_followers: 5200000,
      reddit_subscribers: 4800000,
      telegram_channel_user_count: 0
    },
    developer_data: {
      stars: 78000,
      forks: 35000,
      subscribers: 3800,
      total_issues: 12000,
      closed_issues: 11500
    }
  },
  ethereum: {
    id: "ethereum",
    symbol: "eth",
    name: "Ethereum",
    image: {
      large: "https://assets.coingecko.com/coins/images/279/large/ethereum.png"
    },
    market_cap_rank: 2,
    market_data: {
      current_price: { usd: 4200 },
      market_cap: { usd: 505000000000 },
      total_volume: { usd: 12000000000 },
      price_change_percentage_24h: 1.2,
      price_change_percentage_7d: 3.8,
      price_change_percentage_30d: 8.5,
      high_24h: { usd: 4280 },
      low_24h: { usd: 4150 },
      circulating_supply: 120200000,
      total_supply: 120200000,
      max_supply: null,
      ath: { usd: 4878 },
      ath_date: { usd: "2021-11-10T00:00:00Z" },
      atl: { usd: 0.432979 },
      atl_date: { usd: "2015-10-20T00:00:00Z" }
    },
    description: {
      en: "Ethereum is a decentralized platform that runs smart contracts: applications that run exactly as programmed without any possibility of downtime, censorship, fraud or third-party interference. These apps run on a custom built blockchain, an enormously powerful shared global infrastructure that can move value around and represent the ownership of property."
    },
    links: {
      homepage: ["https://ethereum.org"],
      blockchain_site: ["https://etherscan.io", "https://ethplorer.io"],
      twitter_screen_name: "ethereum",
      facebook_username: "",
      telegram_channel_identifier: "",
      subreddit_url: "https://www.reddit.com/r/ethereum",
      repos_url: { github: ["https://github.com/ethereum/go-ethereum"] }
    },
    community_data: {
      twitter_followers: 3100000,
      reddit_subscribers: 1200000,
      telegram_channel_user_count: 0
    },
    developer_data: {
      stars: 46000,
      forks: 19000,
      subscribers: 2100,
      total_issues: 8500,
      closed_issues: 8100
    }
  },
  ripple: {
    id: "ripple",
    symbol: "xrp",
    name: "XRP",
    image: {
      large: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png"
    },
    market_cap_rank: 6,
    market_data: {
      current_price: { usd: 2.45 },
      market_cap: { usd: 139000000000 },
      total_volume: { usd: 8200000000 },
      price_change_percentage_24h: 5.8,
      price_change_percentage_7d: 12.3,
      price_change_percentage_30d: 285.2,
      high_24h: { usd: 2.52 },
      low_24h: { usd: 2.31 },
      circulating_supply: 57000000000,
      total_supply: 99987000000,
      max_supply: 100000000000,
      ath: { usd: 3.84 },
      ath_date: { usd: "2018-01-07T00:00:00Z" },
      atl: { usd: 0.00268621 },
      atl_date: { usd: "2014-05-22T00:00:00Z" }
    },
    description: {
      en: "XRP is a digital asset built for payments. It is the native digital asset on the XRP Ledger—an open-source, permissionless and decentralized blockchain technology that can settle transactions in 3-5 seconds. XRP can be sent directly without needing a central intermediary, making it a convenient instrument in bridging two different currencies quickly and efficiently."
    },
    links: {
      homepage: ["https://xrpl.org"],
      blockchain_site: ["https://xrpscan.com", "https://bithomp.com"],
      twitter_screen_name: "Ripple",
      facebook_username: "",
      telegram_channel_identifier: "",
      subreddit_url: "https://www.reddit.com/r/Ripple",
      repos_url: { github: ["https://github.com/XRPLF/rippled"] }
    },
    community_data: {
      twitter_followers: 2800000,
      reddit_subscribers: 450000,
      telegram_channel_user_count: 0
    },
    developer_data: {
      stars: 4500,
      forks: 1400,
      subscribers: 350,
      total_issues: 1200,
      closed_issues: 1100
    }
  },
  solana: {
    id: "solana",
    symbol: "sol",
    name: "Solana",
    image: {
      large: "https://assets.coingecko.com/coins/images/4128/large/solana.png"
    },
    market_cap_rank: 4,
    market_data: {
      current_price: { usd: 256 },
      market_cap: { usd: 124000000000 },
      total_volume: { usd: 4800000000 },
      price_change_percentage_24h: 0.83,
      price_change_percentage_7d: 8.2,
      price_change_percentage_30d: 15.7,
      high_24h: { usd: 262 },
      low_24h: { usd: 252 },
      circulating_supply: 484000000,
      total_supply: 593000000,
      max_supply: null,
      ath: { usd: 263.83 },
      ath_date: { usd: "2024-11-23T00:00:00Z" },
      atl: { usd: 0.500801 },
      atl_date: { usd: "2020-05-11T00:00:00Z" }
    },
    description: {
      en: "Solana is a highly functional open source project that banks on blockchain technology's permissionless nature to provide decentralized finance (DeFi) solutions. While the idea and initial work on the project began in 2017, Solana was officially launched in March 2020 by the Solana Foundation with headquarters in Geneva, Switzerland."
    },
    links: {
      homepage: ["https://solana.com"],
      blockchain_site: ["https://explorer.solana.com", "https://solscan.io"],
      twitter_screen_name: "solana",
      facebook_username: "",
      telegram_channel_identifier: "",
      subreddit_url: "https://www.reddit.com/r/solana",
      repos_url: { github: ["https://github.com/solana-labs/solana"] }
    },
    community_data: {
      twitter_followers: 3200000,
      reddit_subscribers: 220000,
      telegram_channel_user_count: 0
    },
    developer_data: {
      stars: 13000,
      forks: 4100,
      subscribers: 450,
      total_issues: 2800,
      closed_issues: 2400
    }
  },
  cardano: {
    id: "cardano",
    symbol: "ada",
    name: "Cardano",
    image: {
      large: "https://assets.coingecko.com/coins/images/975/large/cardano.png"
    },
    market_cap_rank: 5,
    market_data: {
      current_price: { usd: 1.23 },
      market_cap: { usd: 43000000000 },
      total_volume: { usd: 1800000000 },
      price_change_percentage_24h: 1.23,
      price_change_percentage_7d: 4.5,
      price_change_percentage_30d: 18.9,
      high_24h: { usd: 1.26 },
      low_24h: { usd: 1.20 },
      circulating_supply: 35000000000,
      total_supply: 45000000000,
      max_supply: 45000000000,
      ath: { usd: 3.09 },
      ath_date: { usd: "2021-09-02T00:00:00Z" },
      atl: { usd: 0.01925275 },
      atl_date: { usd: "2017-10-01T00:00:00Z" }
    },
    description: {
      en: "Cardano is a proof-of-stake blockchain platform that says its goal is to allow \"changemakers, innovators and visionaries\" to bring about positive global change. The open-source project also aims to \"redistribute power from unaccountable structures to the margins to individuals\" — helping to create a society that is more secure, transparent and fair."
    },
    links: {
      homepage: ["https://cardano.org"],
      blockchain_site: ["https://cardanoscan.io", "https://explorer.cardano.org"],
      twitter_screen_name: "cardano",
      facebook_username: "",
      telegram_channel_identifier: "",
      subreddit_url: "https://www.reddit.com/r/cardano",
      repos_url: { github: ["https://github.com/input-output-hk/cardano-node"] }
    },
    community_data: {
      twitter_followers: 1800000,
      reddit_subscribers: 680000,
      telegram_channel_user_count: 0
    },
    developer_data: {
      stars: 3000,
      forks: 720,
      subscribers: 120,
      total_issues: 1500,
      closed_issues: 1350
    }
  },
  binancecoin: {
    id: "binancecoin",
    symbol: "bnb",
    name: "BNB",
    image: {
      large: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png"
    },
    market_cap_rank: 3,
    market_data: {
      current_price: { usd: 712 },
      market_cap: { usd: 102000000000 },
      total_volume: { usd: 2100000000 },
      price_change_percentage_24h: 0.59,
      price_change_percentage_7d: 4.2,
      price_change_percentage_30d: 18.5,
      high_24h: { usd: 720 },
      low_24h: { usd: 705 },
      circulating_supply: 143000000,
      total_supply: 143000000,
      max_supply: 200000000,
      ath: { usd: 787.98 },
      ath_date: { usd: "2024-06-06T00:00:00Z" },
      atl: { usd: 0.0398177 },
      atl_date: { usd: "2017-10-19T00:00:00Z" }
    },
    description: {
      en: "BNB was originally created as a utility token for discounted trading fees on Binance in 2017, but its uses have expanded far beyond that. BNB is now the gas token for BNB Smart Chain, one of the most popular blockchains in the world, and can be used for a wide variety of applications and use cases."
    },
    links: {
      homepage: ["https://www.bnbchain.org"],
      blockchain_site: ["https://bscscan.com", "https://explorer.bnbchain.org"],
      twitter_screen_name: "BNBCHAIN",
      facebook_username: "",
      telegram_channel_identifier: "",
      subreddit_url: "https://www.reddit.com/r/bnbchainofficial",
      repos_url: { github: ["https://github.com/bnb-chain/bsc"] }
    },
    community_data: {
      twitter_followers: 2100000,
      reddit_subscribers: 85000,
      telegram_channel_user_count: 0
    },
    developer_data: {
      stars: 2500,
      forks: 1200,
      subscribers: 180,
      total_issues: 850,
      closed_issues: 780
    }
  },
  litecoin: {
    id: "litecoin",
    symbol: "ltc",
    name: "Litecoin",
    image: {
      large: "https://assets.coingecko.com/coins/images/2/large/litecoin.png"
    },
    market_cap_rank: 8,
    market_data: {
      current_price: { usd: 105 },
      market_cap: { usd: 7800000000 },
      total_volume: { usd: 680000000 },
      price_change_percentage_24h: 1.5,
      price_change_percentage_7d: 3.8,
      price_change_percentage_30d: 25.7,
      high_24h: { usd: 107 },
      low_24h: { usd: 103 },
      circulating_supply: 74300000,
      total_supply: 84000000,
      max_supply: 84000000,
      ath: { usd: 412.96 },
      ath_date: { usd: "2021-05-10T00:00:00Z" },
      atl: { usd: 1.15 },
      atl_date: { usd: "2015-01-14T00:00:00Z" }
    },
    description: {
      en: "Litecoin is a peer-to-peer cryptocurrency and open-source software project released under the MIT/X11 license. Litecoin was an early bitcoin spinoff or altcoin, starting in October 2011. In technical details, Litecoin is nearly identical to Bitcoin."
    },
    links: {
      homepage: ["https://litecoin.org"],
      blockchain_site: ["https://blockchair.com/litecoin", "https://ltc.com"],
      twitter_screen_name: "litecoin",
      facebook_username: "",
      telegram_channel_identifier: "",
      subreddit_url: "https://www.reddit.com/r/litecoin",
      repos_url: { github: ["https://github.com/litecoin-project/litecoin"] }
    },
    community_data: {
      twitter_followers: 850000,
      reddit_subscribers: 380000,
      telegram_channel_user_count: 0
    },
    developer_data: {
      stars: 4300,
      forks: 1800,
      subscribers: 220,
      total_issues: 420,
      closed_issues: 390
    }
  },
  dogecoin: {
    id: "dogecoin",
    symbol: "doge",
    name: "Dogecoin",
    image: {
      large: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png"
    },
    market_cap_rank: 7,
    market_data: {
      current_price: { usd: 0.38 },
      market_cap: { usd: 56000000000 },
      total_volume: { usd: 3200000000 },
      price_change_percentage_24h: 2.1,
      price_change_percentage_7d: 8.7,
      price_change_percentage_30d: 145.2,
      high_24h: { usd: 0.39 },
      low_24h: { usd: 0.37 },
      circulating_supply: 147000000000,
      total_supply: 147000000000,
      max_supply: null,
      ath: { usd: 0.731578 },
      ath_date: { usd: "2021-05-08T00:00:00Z" },
      atl: { usd: 0.00008547 },
      atl_date: { usd: "2015-05-06T00:00:00Z" }
    },
    description: {
      en: "Dogecoin is a cryptocurrency which main feature is that it has likeness of the Shiba Inu dog. It was initially introduced as joke but Dogecoin quickly developed its own online community and reached a market capitalization of US$60 million in January 2014. Compared to other cryptocurrencies, Dogecoin had a fast initial coin production schedule."
    },
    links: {
      homepage: ["https://dogecoin.com"],
      blockchain_site: ["https://dogechain.info", "https://blockchair.com/dogecoin"],
      twitter_screen_name: "dogecoin",
      facebook_username: "",
      telegram_channel_identifier: "",
      subreddit_url: "https://www.reddit.com/r/dogecoin",
      repos_url: { github: ["https://github.com/dogecoin/dogecoin"] }
    },
    community_data: {
      twitter_followers: 3800000,
      reddit_subscribers: 2200000,
      telegram_channel_user_count: 0
    },
    developer_data: {
      stars: 14500,
      forks: 2800,
      subscribers: 520,
      total_issues: 800,
      closed_issues: 750
    }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const coinId = params.id

    if (!coinId) {
      return NextResponse.json(
        { error: 'Coin ID is required' },
        { status: 400 }
      )
    }

    // Build CoinGecko API URL
    const apiUrl = `${COINGECKO_API_BASE}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true&sparkline=false`

    // Make server-side request to CoinGecko (no CORS issues)
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      }
    })

    if (response.ok) {
      const data = await response.json()

      // Return the data with proper headers
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60'
        }
      })
    } else {
      // If API call fails, check for fallback data
      console.warn(`CoinGecko API failed for ${coinId}, using fallback data`)

      if (FALLBACK_COIN_DATA[coinId]) {
        return NextResponse.json(FALLBACK_COIN_DATA[coinId], {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
          }
        })
      } else {
        // Return a generic error with suggestions
        return NextResponse.json(
          {
            error: `Coin '${coinId}' not found`,
            message: `The cryptocurrency '${coinId}' is not available. Please check the coin ID or try searching for it in the market overview.`,
            suggestions: Object.keys(FALLBACK_COIN_DATA)
          },
          { status: 404 }
        )
      }
    }

  } catch (error) {
    console.error(`Coin details API error for ${params.id}:`, error)

    // Try fallback data
    const coinId = params.id
    if (FALLBACK_COIN_DATA[coinId]) {
      return NextResponse.json(FALLBACK_COIN_DATA[coinId], {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
        }
      })
    }

    // Return error response
    return NextResponse.json(
      {
        error: 'Failed to fetch coin details',
        message: 'Unable to retrieve cryptocurrency information. Please try again later.',
        coinId: params.id
      },
      { status: 500 }
    )
  }
}