import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const whaleTrackerSchema = z.object({
  walletAddress: z.string().min(1, 'Wallet address is required'),
  trackingDuration: z.enum(['1h', '6h', '24h', '7d']).default('24h')
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
    const { walletAddress, trackingDuration } = whaleTrackerSchema.parse(body)

    // Check user permissions and credits
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

    // Check if user has pro/elite subscription
    if (!['pro', 'elite'].includes(userData.subscription_tier)) {
      return NextResponse.json(
        { error: 'Whale tracking requires Pro or Elite subscription' },
        { status: 403 }
      )
    }

    const requiredCredits = 5

    // Check credits
    if (userData.credits_balance < requiredCredits) {
      return NextResponse.json(
        { error: 'Insufficient credits', required: requiredCredits, current: userData.credits_balance },
        { status: 402 }
      )
    }

    // Generate whale tracking report (mock data for now)
    const whaleReport = await generateWhaleReport(walletAddress, trackingDuration)
    
    // Deduct credits
    const { error: creditsError } = await supabase.rpc('spend_credits', {
      user_id: user.id,
      credit_amount: requiredCredits,
      feature_name: 'whale_tracker',
      transaction_description: `Whale tracking analysis for ${walletAddress}`
    })

    if (creditsError) {
      return NextResponse.json(
        { error: 'Failed to deduct credits' },
        { status: 500 }
      )
    }

    // Log feature usage
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: user.id,
        action: 'whale_tracker_usage',
        entity_type: 'whale_tracker',
        entity_id: walletAddress,
        metadata: {
          wallet_address: walletAddress,
          tracking_duration: trackingDuration,
          credits_used: requiredCredits
        }
      })

    return NextResponse.json({
      success: true,
      report: whaleReport,
      creditsUsed: requiredCredits,
      remainingCredits: userData.credits_balance - requiredCredits
    })

  } catch (error) {
    console.error('Error in whale tracker:', error)
    
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

async function generateWhaleReport(walletAddress: string, duration: string): Promise<any> {
  // In a real implementation, this would:
  // 1. Query blockchain APIs (Etherscan, Moralis, etc.)
  // 2. Analyze transaction patterns
  // 3. Identify significant movements
  // 4. Generate insights using AI
  
  // For now, return mock data that looks realistic
  const mockTransactions = generateMockTransactions(walletAddress, duration)
  const analysis = generateMockAnalysis(mockTransactions)
  
  return {
    walletAddress,
    trackingPeriod: duration,
    summary: {
      totalTransactions: mockTransactions.length,
      totalVolumeUSD: analysis.totalVolume,
      uniqueTokens: analysis.uniqueTokens,
      riskScore: analysis.riskScore,
      activityPattern: analysis.pattern
    },
    transactions: mockTransactions.slice(0, 10), // Show top 10
    insights: analysis.insights,
    alerts: analysis.alerts,
    generatedAt: new Date().toISOString()
  }
}

function generateMockTransactions(address: string, duration: string) {
  const transactionCount = duration === '1h' ? 5 : duration === '6h' ? 15 : duration === '24h' ? 50 : 200
  const transactions = []
  
  for (let i = 0; i < transactionCount; i++) {
    transactions.push({
      hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      timestamp: new Date(Date.now() - Math.random() * getDurationMs(duration)).toISOString(),
      type: Math.random() > 0.5 ? 'buy' : 'sell',
      token: ['ETH', 'USDC', 'WETH', 'PEPE', 'SHIB'][Math.floor(Math.random() * 5)],
      amount: (Math.random() * 1000000).toFixed(2),
      valueUSD: (Math.random() * 5000000).toFixed(2),
      gasUsed: Math.floor(Math.random() * 200000) + 21000,
      to: `0x${Math.random().toString(16).substr(2, 40)}`,
      from: address
    })
  }
  
  return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

function generateMockAnalysis(transactions: any[]) {
  const totalVolume = transactions.reduce((sum, tx) => sum + parseFloat(tx.valueUSD), 0)
  const uniqueTokens = [...new Set(transactions.map(tx => tx.token))].length
  const buyTransactions = transactions.filter(tx => tx.type === 'buy').length
  const sellTransactions = transactions.filter(tx => tx.type === 'sell').length
  
  return {
    totalVolume: totalVolume.toFixed(2),
    uniqueTokens,
    riskScore: Math.floor(Math.random() * 100),
    pattern: buyTransactions > sellTransactions ? 'accumulating' : 'distributing',
    insights: [
      `High activity wallet with ${transactions.length} transactions in the tracking period`,
      `Primary focus on ${transactions[0]?.token || 'ETH'} with ${Math.floor(Math.random() * 60 + 20)}% of volume`,
      `${buyTransactions > sellTransactions ? 'Bullish' : 'Bearish'} positioning detected`,
      `Average transaction size: $${(totalVolume / transactions.length).toFixed(0)}`
    ],
    alerts: [
      totalVolume > 1000000 ? 'Large volume movements detected' : null,
      uniqueTokens > 10 ? 'High diversification across multiple tokens' : null,
      Math.abs(buyTransactions - sellTransactions) / transactions.length > 0.7 ? 'Strong directional bias' : null
    ].filter(Boolean)
  }
}

function getDurationMs(duration: string): number {
  switch (duration) {
    case '1h': return 60 * 60 * 1000
    case '6h': return 6 * 60 * 60 * 1000
    case '24h': return 24 * 60 * 60 * 1000
    case '7d': return 7 * 24 * 60 * 60 * 1000
    default: return 24 * 60 * 60 * 1000
  }
}