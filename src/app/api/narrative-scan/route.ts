import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const narrativeScanSchema = z.object({
  scanType: z.enum(['trending', 'emerging', 'specific']).default('trending'),
  specificNarrative: z.string().optional(),
  timeframe: z.enum(['1h', '6h', '24h', '7d']).default('24h'),
  includeTokens: z.boolean().default(true)
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
    const { scanType, specificNarrative, timeframe, includeTokens } = narrativeScanSchema.parse(body)

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

    // Check if user has elite subscription
    if (userData.subscription_tier !== 'elite') {
      return NextResponse.json(
        { error: 'Narrative Deep Scans require Elite subscription' },
        { status: 403 }
      )
    }

    const requiredCredits = 40

    // Check credits
    if (userData.credits_balance < requiredCredits) {
      return NextResponse.json(
        { error: 'Insufficient credits', required: requiredCredits, current: userData.credits_balance },
        { status: 402 }
      )
    }

    // Generate narrative scan report
    const narrativeReport = await generateNarrativeReport(scanType, specificNarrative, timeframe, includeTokens)
    
    // Deduct credits
    const { error: creditsError } = await supabase.rpc('spend_credits', {
      user_id: user.id,
      credit_amount: requiredCredits,
      feature_name: 'narrative_deep_scan',
      transaction_description: `Narrative deep scan: ${scanType} (${timeframe})`
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
        action: 'narrative_scan_usage',
        entity_type: 'narrative_scan',
        entity_id: `${scanType}_${timeframe}`,
        metadata: {
          scan_type: scanType,
          specific_narrative: specificNarrative,
          timeframe,
          include_tokens: includeTokens,
          credits_used: requiredCredits
        }
      })

    return NextResponse.json({
      success: true,
      report: narrativeReport,
      creditsUsed: requiredCredits,
      remainingCredits: userData.credits_balance - requiredCredits
    })

  } catch (error) {
    console.error('Error in narrative scan:', error)
    
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

async function generateNarrativeReport(
  scanType: string, 
  specificNarrative: string | undefined, 
  timeframe: string, 
  includeTokens: boolean
): Promise<any> {
  // In a real implementation, this would:
  // 1. Scrape crypto Twitter, Reddit, Discord
  // 2. Analyze news articles and blogs
  // 3. Use NLP/AI to identify narratives
  // 4. Track narrative momentum and sentiment
  // 5. Correlate with token performance
  
  const narratives = generateMockNarratives(scanType, specificNarrative, timeframe)
  const tokens = includeTokens ? generateRelatedTokens(narratives) : []
  
  return {
    scanType,
    specificNarrative,
    timeframe,
    executedAt: new Date().toISOString(),
    summary: {
      totalNarratives: narratives.length,
      strongNarratives: narratives.filter(n => n.strength > 7).length,
      emergingNarratives: narratives.filter(n => n.momentum > 0.5).length,
      relatedTokens: tokens.length
    },
    narratives: narratives.slice(0, 10), // Top 10 narratives
    relatedTokens: tokens.slice(0, 20), // Top 20 tokens
    insights: generateNarrativeInsights(narratives, tokens),
    recommendations: generateRecommendations(narratives, tokens)
  }
}

function generateMockNarratives(scanType: string, specific: string | undefined, timeframe: string) {
  const baseNarratives = [
    {
      name: 'AI & Machine Learning',
      description: 'AI tokens seeing renewed interest with ChatGPT adoption',
      strength: 8.5,
      momentum: 0.7,
      sentiment: 0.8,
      mentions: 15420,
      growth: '+45%',
      keyTopics: ['ChatGPT integration', 'AI infrastructure', 'Decentralized AI'],
      influencerBuzz: 'High',
      timeToBreakout: '2-4 weeks'
    },
    {
      name: 'Layer 2 Scaling',
      description: 'L2 solutions gaining adoption as Ethereum fees rise',
      strength: 7.8,
      momentum: 0.6,
      sentiment: 0.7,
      mentions: 12340,
      growth: '+32%',
      keyTopics: ['zkEVM', 'Optimistic rollups', 'Cross-chain bridges'],
      influencerBuzz: 'Medium-High',
      timeToBreakout: '1-2 weeks'
    },
    {
      name: 'RWA Tokenization',
      description: 'Real World Assets tokenization picking up steam',
      strength: 7.2,
      momentum: 0.8,
      sentiment: 0.6,
      mentions: 8900,
      growth: '+78%',
      keyTopics: ['Treasury bills', 'Real estate', 'Commodities'],
      influencerBuzz: 'Medium',
      timeToBreakout: '3-6 weeks'
    },
    {
      name: 'Gaming & Metaverse',
      description: 'Gaming tokens showing signs of revival',
      strength: 6.5,
      momentum: 0.4,
      sentiment: 0.5,
      mentions: 7650,
      growth: '+15%',
      keyTopics: ['Play-to-earn', 'Virtual land', 'Gaming infrastructure'],
      influencerBuzz: 'Medium',
      timeToBreakout: '4-8 weeks'
    },
    {
      name: 'Bitcoin Ordinals',
      description: 'NFTs on Bitcoin gaining traction',
      strength: 6.8,
      momentum: 0.5,
      sentiment: 0.6,
      mentions: 5430,
      growth: '+25%',
      keyTopics: ['BRC-20', 'Digital artifacts', 'Bitcoin NFTs'],
      influencerBuzz: 'Medium',
      timeToBreakout: '2-3 weeks'
    },
    {
      name: 'DePIN Networks',
      description: 'Decentralized Physical Infrastructure gaining momentum',
      strength: 7.5,
      momentum: 0.9,
      sentiment: 0.7,
      mentions: 4200,
      growth: '+95%',
      keyTopics: ['5G networks', 'Storage networks', 'Compute sharing'],
      influencerBuzz: 'High',
      timeToBreakout: '1-3 weeks'
    }
  ]
  
  if (specific) {
    return baseNarratives.filter(n => 
      n.name.toLowerCase().includes(specific.toLowerCase()) ||
      n.description.toLowerCase().includes(specific.toLowerCase())
    )
  }
  
  if (scanType === 'emerging') {
    return baseNarratives.filter(n => n.momentum > 0.6).sort((a, b) => b.momentum - a.momentum)
  }
  
  return baseNarratives.sort((a, b) => b.strength - a.strength)
}

function generateRelatedTokens(narratives: any[]) {
  const tokensByNarrative: Record<string, string[]> = {
    'AI & Machine Learning': ['FET', 'AGIX', 'RNDR', 'TAO', 'OCEAN'],
    'Layer 2 Scaling': ['ARB', 'OP', 'MATIC', 'IMX', 'METIS'],
    'RWA Tokenization': ['ONDO', 'POLYX', 'RIO', 'MAPLE', 'CFG'],
    'Gaming & Metaverse': ['AXS', 'SAND', 'MANA', 'GALA', 'ENJ'],
    'Bitcoin Ordinals': ['ORDI', 'SATS', '1000SATS', 'RATS', 'PIZZA'],
    'DePIN Networks': ['HNT', 'IOTX', 'FIL', 'AR', 'STORJ']
  }
  
  const tokens: any[] = []
  
  narratives.forEach(narrative => {
    const relatedTokens = tokensByNarrative[narrative.name] || []
    relatedTokens.forEach(symbol => {
      tokens.push({
        symbol,
        name: `${symbol} Token`,
        narrative: narrative.name,
        narrativeStrength: narrative.strength,
        priceChange24h: (Math.random() * 40 - 20).toFixed(2),
        volume24h: (Math.random() * 10000000).toFixed(0),
        marketCap: (Math.random() * 1000000000).toFixed(0),
        socialScore: Math.floor(Math.random() * 100),
        riskLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]
      })
    })
  })
  
  return tokens.sort((a, b) => b.narrativeStrength - a.narrativeStrength)
}

function generateNarrativeInsights(narratives: any[], tokens: any[]): string[] {
  return [
    `${narratives.filter(n => n.momentum > 0.7).length} narratives showing strong momentum (+70% growth)`,
    `AI & DePIN sectors leading narrative growth with highest social engagement`,
    `${tokens.filter(t => parseFloat(t.priceChange24h) > 10).length} related tokens showing >10% daily gains`,
    `Average narrative strength is ${(narratives.reduce((sum, n) => sum + n.strength, 0) / narratives.length).toFixed(1)}/10`,
    `${narratives.filter(n => n.timeToBreakout.includes('1-2')).length} narratives expected to breakout within 2 weeks`,
    'Cross-narrative correlations detected between AI and DePIN sectors'
  ]
}

function generateRecommendations(narratives: any[], tokens: any[]): string[] {
  const topNarrative = narratives[0]
  const topTokens = tokens.slice(0, 3)
  
  return [
    `Focus on ${topNarrative.name} narrative - highest strength score (${topNarrative.strength}/10)`,
    `Consider positions in ${topTokens.map(t => t.symbol).join(', ')} for narrative exposure`,
    'Monitor social sentiment shifts - current momentum may indicate trend continuation',
    'Set alerts for narrative strength drops below 6.0 as exit signal',
    `${topNarrative.timeToBreakout} expected timeline for maximum narrative impact`
  ]
}