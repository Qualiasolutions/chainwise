import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

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

    // Fetch portfolio with holdings
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .select(`
        *,
        portfolio_holdings (
          id,
          symbol,
          name,
          amount,
          purchase_price,
          current_price,
          purchase_date,
          created_at
        )
      `)
      .eq('id', portfolioId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    const holdings = portfolio.portfolio_holdings || [];

    // Calculate enhanced metrics
    const totalValue = holdings.reduce((sum, h) => {
      return sum + (h.amount * h.current_price);
    }, 0);

    const totalCost = holdings.reduce((sum, h) => {
      return sum + (h.amount * h.purchase_price);
    }, 0);

    const totalPnL = totalValue - totalCost;
    const totalPnLPercentage = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

    // Calculate portfolio health score (0-100)
    const diversificationScore = calculateDiversificationScore(holdings, totalValue);
    const riskScore = calculateRiskScore(holdings);
    const profitabilityScore = Math.min(100, Math.max(0, 50 + totalPnLPercentage));
    const healthScore = (diversificationScore * 0.4 + (100 - riskScore) * 0.3 + profitabilityScore * 0.3);

    // Calculate volatility (simplified)
    const volatility = calculateVolatility(holdings);

    // Find best and worst performers
    const performanceData = holdings.map(h => ({
      symbol: h.symbol,
      name: h.name,
      pnlPercentage: ((h.current_price - h.purchase_price) / h.purchase_price) * 100,
      value: h.amount * h.current_price
    })).sort((a, b) => b.pnlPercentage - a.pnlPercentage);

    const bestPerformer = performanceData[0] || null;
    const worstPerformer = performanceData[performanceData.length - 1] || null;

    // Calculate realized vs unrealized gains (all unrealized for now)
    const unrealizedGains = totalPnL;
    const realizedGains = 0;

    const metrics = {
      totalValue,
      totalCost,
      totalPnL,
      totalPnLPercentage,
      healthScore: Math.round(healthScore),
      diversificationScore: Math.round(diversificationScore),
      riskScore: Math.round(riskScore),
      volatility: Math.round(volatility * 100) / 100,
      bestPerformer,
      worstPerformer,
      unrealizedGains,
      realizedGains,
      holdingsCount: holdings.length,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({ metrics });
  } catch (error: any) {
    console.error('Portfolio metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate portfolio metrics' },
      { status: 500 }
    );
  }
}

// Helper function to calculate diversification score
function calculateDiversificationScore(holdings: any[], totalValue: number): number {
  if (holdings.length === 0) return 0;
  if (holdings.length === 1) return 20;

  // Calculate Herfindahl index (concentration)
  const herfindahl = holdings.reduce((sum, h) => {
    const share = (h.amount * h.current_price) / totalValue;
    return sum + (share * share);
  }, 0);

  // Convert to diversification score (1 = concentrated, 0 = diversified)
  // Perfect diversification with 10+ holdings = 100 score
  const diversificationIndex = 1 - herfindahl;
  const score = Math.min(100, (diversificationIndex * 150) + (holdings.length * 5));

  return score;
}

// Helper function to calculate risk score
function calculateRiskScore(holdings: any[]): number {
  if (holdings.length === 0) return 100;

  // Simple risk model based on price volatility and concentration
  // In production, would use historical volatility data
  let totalRisk = 0;

  holdings.forEach(h => {
    const priceChangePercent = Math.abs(((h.current_price - h.purchase_price) / h.purchase_price) * 100);
    // Higher price changes indicate higher volatility/risk
    totalRisk += Math.min(100, priceChangePercent * 2);
  });

  return totalRisk / holdings.length;
}

// Helper function to calculate portfolio volatility
function calculateVolatility(holdings: any[]): number {
  if (holdings.length === 0) return 0;

  const returns = holdings.map(h => {
    return ((h.current_price - h.purchase_price) / h.purchase_price) * 100;
  });

  // Calculate standard deviation of returns
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  return stdDev;
}
