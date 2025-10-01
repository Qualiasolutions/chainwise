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
        riskAnalysis: {
          overallRisk: 'low',
          riskScore: 0,
          recommendations: ['Add holdings to your portfolio to enable risk analysis']
        }
      });
    }

    // Calculate total portfolio value
    const totalValue = holdings.reduce((sum, h) => sum + (h.amount * h.current_price), 0);

    // Calculate risk metrics for each holding
    const holdingRisks = holdings.map(h => {
      const value = h.amount * h.current_price;
      const allocation = (value / totalValue) * 100;
      const priceChange = ((h.current_price - h.purchase_price) / h.purchase_price) * 100;
      const volatility = Math.abs(priceChange);

      // Risk level determination
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (allocation > 40 || volatility > 30) riskLevel = 'high';
      else if (allocation > 25 || volatility > 15) riskLevel = 'medium';

      return {
        symbol: h.symbol.toUpperCase(),
        name: h.name,
        allocation,
        volatility,
        riskLevel,
        concentration: allocation > 30 ? 'high' : allocation > 20 ? 'medium' : 'low'
      };
    });

    // Calculate overall portfolio risk score (0-100, higher = more risky)
    const concentrationRisk = Math.max(...holdingRisks.map(h => h.allocation));
    const avgVolatility = holdingRisks.reduce((sum, h) => sum + h.volatility, 0) / holdingRisks.length;
    const diversificationPenalty = holdings.length < 3 ? 20 : holdings.length < 5 ? 10 : 0;

    const riskScore = Math.min(100,
      (concentrationRisk * 0.4) +
      (avgVolatility * 0.4) +
      diversificationPenalty
    );

    // Determine overall risk level
    let overallRisk: 'low' | 'medium' | 'high' = 'low';
    if (riskScore > 60) overallRisk = 'high';
    else if (riskScore > 35) overallRisk = 'medium';

    // Generate recommendations
    const recommendations: string[] = [];

    const highConcentration = holdingRisks.filter(h => h.concentration === 'high');
    if (highConcentration.length > 0) {
      recommendations.push(`Reduce concentration in ${highConcentration.map(h => h.symbol).join(', ')} (>30% allocation)`);
    }

    if (holdings.length < 5) {
      recommendations.push('Increase diversification by adding 3-5 more assets');
    }

    const highVolAssets = holdingRisks.filter(h => h.volatility > 25);
    if (highVolAssets.length > 0) {
      recommendations.push(`Consider rebalancing high-volatility assets: ${highVolAssets.map(h => h.symbol).join(', ')}`);
    }

    if (recommendations.length === 0) {
      recommendations.push('Your portfolio has a balanced risk profile');
    }

    // Calculate Value at Risk (VaR) - simplified 95% confidence
    const portfolioStdDev = avgVolatility;
    const valueAtRisk = totalValue * (portfolioStdDev / 100) * 1.65; // 95% confidence

    // Calculate correlation matrix (simplified)
    const correlationMatrix = calculateCorrelationMatrix(holdingRisks);

    const riskAnalysis = {
      overallRisk,
      riskScore: Math.round(riskScore),
      concentrationRisk: Math.round(concentrationRisk),
      avgVolatility: Math.round(avgVolatility * 100) / 100,
      diversificationScore: 100 - Math.round(diversificationPenalty),
      valueAtRisk: Math.round(valueAtRisk),
      holdingRisks,
      recommendations,
      correlationMatrix
    };

    return NextResponse.json({ riskAnalysis });
  } catch (error: any) {
    console.error('Risk analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to perform risk analysis' },
      { status: 500 }
    );
  }
}

// Helper function to calculate simplified correlation matrix
function calculateCorrelationMatrix(holdingRisks: any[]) {
  // In production, this would use historical price data
  // For now, return simplified correlation based on volatility similarity
  return holdingRisks.map((asset1, i) => ({
    symbol: asset1.symbol,
    correlations: holdingRisks.map((asset2, j) => {
      if (i === j) return 1.0;

      // Simplified correlation: assets with similar volatility have higher correlation
      const volDiff = Math.abs(asset1.volatility - asset2.volatility);
      const correlation = Math.max(0, 1 - (volDiff / 50));

      return Math.round(correlation * 100) / 100;
    })
  }));
}
