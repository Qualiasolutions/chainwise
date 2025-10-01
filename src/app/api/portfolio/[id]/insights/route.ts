import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { cryptoAPI } from '@/lib/crypto-api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const portfolioId = params.id;

    // Fetch portfolio holdings
    const { data: holdings, error } = await supabase
      .from('portfolio_holdings')
      .select('*')
      .eq('portfolio_id', portfolioId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!holdings || holdings.length === 0) {
      return NextResponse.json({
        insights: {
          fearGreedIndex: null,
          marketSentiment: 'neutral',
          recommendations: [],
          opportunities: [],
          warnings: []
        }
      });
    }

    // Calculate portfolio metrics
    const totalValue = holdings.reduce((sum, h) => sum + (h.amount * h.current_price), 0);
    const totalPnL = holdings.reduce((sum, h) => {
      return sum + ((h.current_price - h.purchase_price) * h.amount);
    }, 0);

    // Get global market data
    let globalData: any = null;
    try {
      globalData = await cryptoAPI.getGlobalData();
    } catch (err) {
      console.warn('Failed to fetch global data:', err);
    }

    // Generate AI-powered insights
    const recommendations: any[] = [];
    const opportunities: any[] = [];
    const warnings: any[] = [];

    // Analyze each holding
    for (const holding of holdings) {
      const allocation = ((holding.amount * holding.current_price) / totalValue) * 100;
      const pnlPercent = ((holding.current_price - holding.purchase_price) / holding.purchase_price) * 100;

      // Over-concentration warning
      if (allocation > 35) {
        warnings.push({
          type: 'concentration',
          severity: 'high',
          symbol: holding.symbol.toUpperCase(),
          message: `${holding.symbol.toUpperCase()} represents ${allocation.toFixed(1)}% of your portfolio. Consider rebalancing to reduce risk.`,
          action: 'rebalance'
        });
      }

      // Profit-taking opportunity
      if (pnlPercent > 50) {
        opportunities.push({
          type: 'profit_taking',
          symbol: holding.symbol.toUpperCase(),
          message: `${holding.symbol.toUpperCase()} is up ${pnlPercent.toFixed(1)}%. Consider taking partial profits.`,
          potentialGain: holding.amount * holding.current_price * 0.3,
          action: 'sell_partial'
        });
      }

      // Loss mitigation
      if (pnlPercent < -20) {
        warnings.push({
          type: 'loss',
          severity: 'medium',
          symbol: holding.symbol.toUpperCase(),
          message: `${holding.symbol.toUpperCase()} is down ${Math.abs(pnlPercent).toFixed(1)}%. Review your investment thesis.`,
          action: 'review'
        });
      }

      // Buy more opportunity (DCA)
      if (pnlPercent < -10 && pnlPercent > -30 && allocation < 20) {
        opportunities.push({
          type: 'buy_dip',
          symbol: holding.symbol.toUpperCase(),
          message: `${holding.symbol.toUpperCase()} is down ${Math.abs(pnlPercent).toFixed(1)}%. Good opportunity for dollar-cost averaging.`,
          action: 'buy_more'
        });
      }
    }

    // Portfolio-level recommendations
    if (holdings.length < 5) {
      recommendations.push({
        type: 'diversification',
        priority: 'high',
        message: 'Your portfolio has limited diversification. Consider adding 3-5 more assets to reduce risk.',
        action: 'diversify'
      });
    }

    if (totalPnL > 0 && (totalPnL / totalValue) > 0.3) {
      recommendations.push({
        type: 'rebalancing',
        priority: 'medium',
        message: 'Your portfolio has significant unrealized gains. Consider rebalancing to lock in profits.',
        action: 'rebalance'
      });
    }

    // Market sentiment analysis
    const marketSentiment = globalData && globalData.market_cap_change_percentage_24h_usd > 5
      ? 'bullish'
      : globalData && globalData.market_cap_change_percentage_24h_usd < -5
      ? 'bearish'
      : 'neutral';

    // Fear & Greed Index (simplified - in production, fetch from external API)
    const fearGreedIndex = globalData
      ? Math.min(100, Math.max(0, 50 + (globalData.market_cap_change_percentage_24h_usd * 5)))
      : null;

    const insights = {
      fearGreedIndex: fearGreedIndex ? Math.round(fearGreedIndex) : null,
      fearGreedLabel: fearGreedIndex
        ? fearGreedIndex > 75 ? 'Extreme Greed'
        : fearGreedIndex > 55 ? 'Greed'
        : fearGreedIndex > 45 ? 'Neutral'
        : fearGreedIndex > 25 ? 'Fear'
        : 'Extreme Fear'
        : null,
      marketSentiment,
      marketCapChange24h: globalData?.market_cap_change_percentage_24h_usd || 0,
      recommendations: recommendations.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return (priorityOrder[a.priority as keyof typeof priorityOrder] || 2) -
               (priorityOrder[b.priority as keyof typeof priorityOrder] || 2);
      }),
      opportunities: opportunities.slice(0, 5),
      warnings: warnings.sort((a, b) => {
        const severityOrder = { high: 0, medium: 1, low: 2 };
        return (severityOrder[a.severity as keyof typeof severityOrder] || 2) -
               (severityOrder[b.severity as keyof typeof severityOrder] || 2);
      }).slice(0, 5),
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({ insights });
  } catch (error: any) {
    console.error('Portfolio insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
