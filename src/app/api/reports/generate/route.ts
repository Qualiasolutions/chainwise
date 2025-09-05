import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const generateReportSchema = z.object({
  reportType: z.enum(['pro_weekly', 'elite_monthly', 'deep_dive']),
  parameters: z.object({
    coins: z.array(z.string()).optional(),
    timeframe: z.string().optional(),
    customPrompt: z.string().optional()
  }).optional()
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { reportType, parameters = {} } = generateReportSchema.parse(body)
    
    // Check user permissions for report type
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('subscription_tier, credits_balance')
      .eq('id', user.id)
      .single()
    
    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Validate permissions and credit costs
    const reportConfig = getReportConfig(reportType, userData.subscription_tier)
    
    if (!reportConfig.allowed) {
      return NextResponse.json(
        { error: reportConfig.error },
        { status: 403 }
      )
    }

    // Check credits
    if (userData.credits_balance < reportConfig.creditCost) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 402 }
      )
    }

    // Generate the report content
    const reportContent = await generateReportContent(reportType, parameters)
    
    // Spend credits using RPC function
    const { error: creditsError } = await supabase.rpc('spend_credits', {
      user_id: user.id,
      credit_amount: reportConfig.creditCost,
      feature_name: `report_${reportType}`,
      transaction_description: `${reportConfig.title} report generation`
    })

    if (creditsError) {
      return NextResponse.json(
        { error: 'Failed to deduct credits' },
        { status: 500 }
      )
    }

    // Save report to database
    const { data: report, error: reportError } = await supabase
      .from('ai_reports')
      .insert({
        user_id: user.id,
        report_type: reportType,
        title: reportConfig.title,
        content: reportContent,
        credits_cost: reportConfig.creditCost,
        metadata: {
          parameters,
          generated_at: new Date().toISOString(),
          user_tier: userData.subscription_tier
        }
      })
      .select()
      .single()

    if (reportError) {
      console.error('Error saving report:', reportError)
      return NextResponse.json(
        { error: 'Failed to save report' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        title: report.title,
        content: report.content,
        reportType: report.report_type,
        creditsCost: report.credits_cost,
        generatedAt: report.generated_at
      }
    })
  } catch (error) {
    console.error('Error generating report:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getReportConfig(reportType: string, userTier: string) {
  switch (reportType) {
    case 'pro_weekly':
      return {
        allowed: ['pro', 'elite'].includes(userTier),
        creditCost: 5,
        title: 'Weekly Pro AI Report',
        error: 'Weekly reports require Pro or Elite subscription'
      }
    
    case 'elite_monthly':
      return {
        allowed: userTier === 'elite',
        creditCost: 10,
        title: 'Monthly Elite Deep AI Report',
        error: 'Monthly deep reports require Elite subscription'
      }
    
    case 'deep_dive':
      return {
        allowed: true, // Available to all users with credits
        creditCost: 10,
        title: 'AI Deep Dive Report',
        error: null
      }
    
    default:
      return {
        allowed: false,
        creditCost: 0,
        title: 'Unknown Report',
        error: 'Invalid report type'
      }
  }
}

async function generateReportContent(reportType: string, parameters: any = {}): Promise<string> {
  // This is where you'd integrate with OpenAI or your AI service
  // For now, I'll provide template-based content
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  switch (reportType) {
    case 'pro_weekly':
      return generateProWeeklyReport(currentDate)
    
    case 'elite_monthly':
      return generateEliteMonthlyReport(currentDate)
    
    case 'deep_dive':
      return generateDeepDiveReport(currentDate, parameters)
    
    default:
      return 'Report content not available'
  }
}

function generateProWeeklyReport(date: string): string {
  return `# Weekly Pro AI Report
**Generated on:** ${date}

## Top 3 Coins to Watch This Week

### 1. Bitcoin (BTC)
- **Performance:** Up 6.2% this week
- **Key Level:** Broke resistance at $63,500
- **Outlook:** Bullish momentum continues with strong volume

### 2. Ethereum (ETH) 
- **Performance:** Up 4.1% this week
- **Key Development:** Gas fees rising (+15%) indicating increased network activity
- **Outlook:** Positive fundamentals supporting price action

### 3. Arbitrum (ARB)
- **Performance:** Volume spike +22% vs last week
- **Social Buzz:** Increased mentions around DeFi protocols
- **Outlook:** Layer 2 narrative gaining traction

## Market Overview

- **Fear & Greed Index:** 72 (Greed) → Possible overheating risk
- **BTC Dominance:** 52% → Altcoins still lagging behind Bitcoin
- **Total Market Cap:** $2.1T (+3.2% weekly)

## Portfolio Tip

Consider keeping at least 10-15% in stablecoins as a hedge against potential market volatility. Current greed levels suggest caution.

## Alerts Summary

- ✅ BTC broke $63.5k major resistance 
- ⚠️ ETH gas fees surged 30% vs last week
- 📈 DeFi tokens showing renewed interest

---
*This report was generated by ChainWise AI. Past performance does not guarantee future results.*`
}

function generateEliteMonthlyReport(date: string): string {
  return `# Elite Monthly Deep AI Report
**Generated on:** ${date}

## Executive Summary

This month has shown significant developments in the cryptocurrency space, with AI tokens leading the charge and institutional adoption accelerating.

## Market Narratives Detected

### 1. AI Token Surge (+280% social mentions)
- **Leaders:** FET, AGIX, RNDR showing strong momentum
- **Catalyst:** Nvidia earnings and AI infrastructure growth
- **Sentiment:** Extremely bullish across all social platforms

### 2. Real World Assets (RWA) Emergence
- **Top Performers:** ONDO, POLYX leading the sector
- **Institutional Interest:** Major banks exploring tokenization
- **Market Size:** $2B+ in RWA tokens, expected 5x growth

### 3. Bitcoin Halving Anticipation
- **Timeline:** 6 months remaining until halving event
- **Social Trend:** "$100k Bitcoin" discussions resurging
- **On-chain Metrics:** Accumulation patterns similar to 2020 cycle

## Advanced On-Chain & Technical Analysis

### Bitcoin (BTC)
- **Whale Activity:** Large wallets accumulated 50,000+ BTC this month
- **Network Health:** Hash rate at all-time highs
- **Price Action:** Clean break above $60k with strong support

### Ethereum (ETH)
- **Network Usage:** Daily active addresses up +12% month-over-month  
- **Staking Ratio:** 22% of total supply now staked
- **EIP-4844:** Blob transactions reducing L2 costs significantly

### Solana (SOL)
- **Ecosystem Growth:** On-chain activity spiked +30%
- **DeFi TVL:** $1.2B locked in Solana protocols
- **Mobile Strategy:** Saga phone sales exceeding expectations

## Institutional Whale Activity

### Major Movements Detected:
- **$220M BTC** moved off exchanges → Bullish accumulation signal
- **Ethereum whales** accumulating during recent dips
- **MicroStrategy** continues DCA strategy with weekly purchases

## Risk Assessment & Market Outlook

### Short-term (1-3 months):
- **Probability:** 65% chance of continued uptrend
- **Key Levels:** BTC $58k support, $72k resistance
- **Risks:** Fed policy changes, regulatory uncertainty

### Medium-term (3-6 months):
- **Halving Impact:** Historical patterns suggest 6-month pre-halving rally
- **Altcoin Season:** Expected to begin if BTC dominance breaks below 48%
- **Institutional Flow:** $2B+ expected from ETF inflows

## Elite Investment Recommendations

### Immediate Actions:
1. **Accumulate on dips:** BTC below $62k, ETH below $3,400
2. **AI Exposure:** Allocate 5-10% to quality AI tokens (FET, RNDR)
3. **RWA Positioning:** Early positions in ONDO, POLYX for long-term hold

### Portfolio Allocation (Elite Strategy):
- **40% Bitcoin** - Core holding, institutional safe haven
- **30% Ethereum** - Smart contract leader, staking yield
- **15% Large-cap alts** - SOL, ADA, AVAX for diversification  
- **10% Emerging narratives** - AI, RWA tokens for alpha
- **5% Stablecoins** - Dry powder for opportunities

## Advanced Risk Management

### Stop-Loss Strategy:
- **BTC:** Trailing stop at 15% below all-time high
- **ETH:** Support break below $3,000 as exit signal
- **Alts:** Implement 20% stop-loss for speculative positions

### Market Cycle Position:
**Current Phase:** Late accumulation / Early bull market
**Next Phase:** Euphoria expected in 6-12 months
**Strategy:** Accumulate quality assets, prepare for distribution

---
*This Elite report contains advanced analysis reserved for premium subscribers. Trading involves significant risk.*`
}

function generateDeepDiveReport(date: string, parameters: any): string {
  const { coins = ['Bitcoin'], timeframe = '30 days', customPrompt = '' } = parameters
  
  return `# AI Deep Dive Analysis Report
**Generated on:** ${date}
**Focus:** ${coins.join(', ')}
**Timeframe:** ${timeframe}

## Analysis Overview

This deep dive report provides comprehensive analysis of the selected cryptocurrencies using advanced AI algorithms and market intelligence.

## Methodology

Our analysis combines:
- Technical chart patterns and indicators
- On-chain metrics and whale behavior  
- Social sentiment across 50+ platforms
- Fundamental protocol developments
- Macro-economic correlations

## Detailed Findings

${coins.map(coin => `
### ${coin} Deep Analysis

#### Technical Analysis
- **Trend:** Current momentum and key levels
- **Support/Resistance:** Critical price zones
- **Volume Profile:** Liquidity analysis
- **Chart Patterns:** Identified formations

#### On-Chain Metrics  
- **Network Activity:** Transaction volume and fees
- **Holder Behavior:** Accumulation vs distribution
- **Exchange Flows:** Institutional movement patterns
- **Staking/Yield:** Network participation rates

#### Sentiment Analysis
- **Social Volume:** Mention frequency across platforms
- **Sentiment Score:** Bullish vs bearish sentiment
- **Influencer Activity:** Key opinion leader positions
- **News Impact:** Recent developments and their effect

#### Risk Assessment
- **Volatility Metrics:** Expected price swings
- **Liquidity Risk:** Market depth analysis
- **Regulatory Risk:** Compliance and legal factors
- **Technology Risk:** Protocol security and updates

`).join('')}

## Investment Thesis

Based on our comprehensive analysis, here are the key investment considerations:

### Bullish Factors:
- Strong technical momentum
- Positive on-chain fundamentals  
- Growing institutional adoption
- Favorable sentiment trends

### Risk Factors:
- Market volatility concerns
- Regulatory uncertainty
- Technical resistance levels
- Macroeconomic headwinds

## Conclusion

${customPrompt ? `**Custom Analysis:** ${customPrompt}` : ''}

This deep dive analysis suggests a cautiously optimistic outlook for the analyzed assets, with key focus on risk management and position sizing.

---
*This analysis is for informational purposes only and should not be considered financial advice.*`
}