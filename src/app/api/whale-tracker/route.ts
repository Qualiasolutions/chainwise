import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleAPIError } from '@/lib/api-error-handler'
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

    // Generate whale tracking report using real data
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

    return NextResponse.json({
      success: true,
      data: whaleReport,
      creditsUsed: requiredCredits,
      remainingCredits: userData.credits_balance - requiredCredits
    })

  } catch (error) {
    return handleAPIError(error, 'whale-tracker')
  }
}

async function generateWhaleReport(walletAddress: string, duration: string): Promise<any> {
  // Use real Moralis data for premium whale tracking
  try {
    const { MoralisService } = await import('@/lib/moralis-service')
    
    const limit = duration === '1h' ? 10 : duration === '6h' ? 25 : duration === '24h' ? 50 : 100
    const transactions = await MoralisService.getWalletTransactions(walletAddress, 'eth', limit)
    
    // Get wallet balance for additional context
    const balance = await MoralisService.getWalletTokenBalances(walletAddress, 'eth')
    const nativeBalance = await MoralisService.getNativeBalance(walletAddress, 'eth')
    
    const analysis = analyzeRealTransactions(transactions, balance)
    
    return {
      walletAddress,
      trackingPeriod: duration,
      summary: {
        totalTransactions: transactions.length,
        totalVolumeETH: analysis.totalVolume,
        uniqueTokens: analysis.uniqueTokens,
        riskScore: analysis.riskScore,
        activityPattern: analysis.pattern,
        currentBalance: nativeBalance.formatted
      },
      transactions: transactions.slice(0, 20),
      insights: analysis.insights,
      alerts: analysis.alerts,
      generatedAt: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error generating whale report:', error)
    throw new Error('Failed to analyze wallet data. Please ensure you have sufficient credits and the wallet address is valid.')
  }
}

function analyzeRealTransactions(transactions: any[], balances: any[]) {
  const totalVolume = transactions.reduce((sum, tx) => {
    const value = parseFloat(tx.value) || 0
    return sum + (value / Math.pow(10, 18)) // Convert Wei to ETH
  }, 0)
  
  const uniqueAddresses = new Set([...transactions.map(tx => tx.to), ...transactions.map(tx => tx.from)]).size
  
  return {
    totalVolume,
    uniqueTokens: balances.length,
    riskScore: calculateRiskScore(transactions, totalVolume),
    pattern: analyzeActivityPattern(transactions),
    insights: generateRealInsights(transactions, totalVolume),
    alerts: generateRealAlerts(transactions, balances)
  }
}

function calculateRiskScore(transactions: any[], totalVolume: number): number {
  const txCount = transactions.length
  const avgTxValue = totalVolume / txCount || 0
  const timeSpread = getTimeSpread(transactions)
  
  let score = 0
  
  // Volume-based scoring
  if (totalVolume > 1000) score += 30 // 1000 ETH
  else if (totalVolume > 100) score += 20 // 100 ETH
  else if (totalVolume > 10) score += 10 // 10 ETH
  
  // Transaction frequency scoring
  if (txCount > 100) score += 25
  else if (txCount > 50) score += 15
  else if (txCount > 10) score += 5
  
  // Average transaction size
  if (avgTxValue > 50) score += 25 // 50 ETH per tx
  else if (avgTxValue > 10) score += 15 // 10 ETH per tx
  else if (avgTxValue > 1) score += 5 // 1 ETH per tx
  
  // Activity pattern
  if (timeSpread < 3600) score += 20 // Very active in short time
  
  return Math.min(100, Math.max(0, score))
}

function analyzeActivityPattern(transactions: any[]): string {
  const timeSpread = getTimeSpread(transactions)
  const txCount = transactions.length
  
  if (txCount > 50 && timeSpread < 86400) return 'high_frequency'
  if (txCount > 20 && timeSpread < 3600) return 'burst_activity'
  if (txCount > 10) return 'moderate_activity'
  return 'low_activity'
}

function getTimeSpread(transactions: any[]): number {
  if (transactions.length < 2) return 0
  const timestamps = transactions.map(tx => new Date(tx.blockTimestamp).getTime())
  return (Math.max(...timestamps) - Math.min(...timestamps)) / 1000
}

function generateRealInsights(transactions: any[], totalVolume: number): string[] {
  return [
    `Analyzed ${transactions.length} real blockchain transactions`,
    `Total transaction volume: ${totalVolume.toFixed(4)} ETH`,
    `Unique addresses interacted: ${new Set([...transactions.map(tx => tx.to), ...transactions.map(tx => tx.from)]).size}`,
    transactions.length > 20 ? 'High activity wallet - potential whale behavior' : 'Standard activity levels',
    totalVolume > 100 ? 'Large volume movements detected' : 'Normal transaction volumes'
  ]
}

function generateRealAlerts(transactions: any[], balances: any[]): string[] {
  const alerts = []
  
  if (transactions.length > 50) {
    alerts.push('High-frequency trading pattern detected')
  }
  
  if (balances.length > 10) {
    alerts.push('Highly diversified portfolio detected')
  }
  
  const largeTransactions = transactions.filter(tx => (parseFloat(tx.value) / Math.pow(10, 18)) > 10)
  if (largeTransactions.length > 0) {
    alerts.push(`${largeTransactions.length} large transactions (>10 ETH) detected`)
  }
  
  if (alerts.length === 0) {
    alerts.push('No significant alerts for this tracking period')
  }
  
  return alerts
}