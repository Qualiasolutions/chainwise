// Crypto News API Route
// GET /api/crypto/news - Get latest cryptocurrency news

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // For now, return curated crypto news
    // In production, you could integrate with a news API like NewsAPI or CryptoPanic
    const mockNews = [
      {
        id: "1",
        title: "Bitcoin Surges Past $112,000 as Institutional Adoption Accelerates",
        description: "Major corporations continue to add Bitcoin to their balance sheets, driving prices to new highs amid growing institutional confidence.",
        url: "https://chainwise.tech/news/bitcoin-institutional-adoption",
        urlToImage: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800",
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        source: {
          id: "chainwise",
          name: "ChainWise News"
        },
        category: "market"
      },
      {
        id: "2",
        title: "Ethereum Layer 2 Solutions See Record Transaction Volume",
        description: "Arbitrum and Optimism process over 5 million daily transactions as DeFi activity surges on Layer 2 networks.",
        url: "https://chainwise.tech/news/ethereum-layer2-volume",
        urlToImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800",
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        source: {
          id: "chainwise",
          name: "ChainWise News"
        },
        category: "technology"
      },
      {
        id: "3",
        title: "SEC Approves New Crypto ETF Applications from Major Financial Institutions",
        description: "Regulatory clarity improves as multiple Bitcoin and Ethereum ETF applications receive approval, opening doors for mainstream investment.",
        url: "https://chainwise.tech/news/sec-etf-approvals",
        urlToImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800",
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        source: {
          id: "chainwise",
          name: "ChainWise News"
        },
        category: "regulation"
      },
      {
        id: "4",
        title: "DeFi Protocol Launches Revolutionary Yield Optimization Strategy",
        description: "New automated yield farming protocol promises 20% APY with reduced risk through innovative hedging mechanisms.",
        url: "https://chainwise.tech/news/defi-yield-optimization",
        urlToImage: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800",
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        source: {
          id: "chainwise",
          name: "ChainWise News"
        },
        category: "defi"
      },
      {
        id: "5",
        title: "Solana Ecosystem Grows with 100+ New Projects This Month",
        description: "Developer activity on Solana reaches all-time high as ecosystem attracts gaming, DeFi, and NFT projects.",
        url: "https://chainwise.tech/news/solana-ecosystem-growth",
        urlToImage: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800",
        publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
        source: {
          id: "chainwise",
          name: "ChainWise News"
        },
        category: "ecosystem"
      },
      {
        id: "6",
        title: "Central Banks Explore Digital Currency Implementation Strategies",
        description: "Multiple countries advance CBDC pilots as digital currency adoption becomes increasingly inevitable.",
        url: "https://chainwise.tech/news/cbdc-implementation",
        urlToImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800",
        publishedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        source: {
          id: "chainwise",
          name: "ChainWise News"
        },
        category: "cbdc"
      },
      {
        id: "7",
        title: "NFT Market Evolves with Focus on Utility and Real-World Assets",
        description: "NFT projects pivot from speculation to utility, integrating real-world assets and practical applications.",
        url: "https://chainwise.tech/news/nft-utility-evolution",
        urlToImage: "https://images.unsplash.com/photo-1646463910506-e43cd7307142?w=800",
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        source: {
          id: "chainwise",
          name: "ChainWise News"
        },
        category: "nft"
      },
      {
        id: "8",
        title: "AI and Blockchain Integration Creates New Investment Opportunities",
        description: "Convergence of AI and blockchain technology spawns innovative projects combining decentralized computing with machine learning.",
        url: "https://chainwise.tech/news/ai-blockchain-convergence",
        urlToImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
        publishedAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
        source: {
          id: "chainwise",
          name: "ChainWise News"
        },
        category: "technology"
      }
    ]

    // Return requested number of news items
    const newsItems = mockNews.slice(0, Math.min(limit, mockNews.length))

    return NextResponse.json(newsItems, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60'
      }
    })

  } catch (error) {
    console.error('Crypto news API error:', error)

    return NextResponse.json(
      { error: 'Failed to fetch news', articles: [] },
      { status: 500 }
    )
  }
}