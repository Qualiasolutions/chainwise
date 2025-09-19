// AI Scam & Risk Detection API Route
// POST /api/tools/scam-detector - Analyze crypto projects for scam/risk indicators

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { OpenAIService } from '@/lib/openai/service'
import { CREDIT_COSTS } from '@/lib/openai/personas'

interface ScamDetectionRequest {
  coinSymbol: string
  coinName?: string
  contractAddress?: string
  website?: string
  socialLinks?: {
    twitter?: string
    telegram?: string
    discord?: string
  }
  additionalInfo?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id, tier, credits')
      .eq('auth_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const body = await request.json() as ScamDetectionRequest
    const { coinSymbol, coinName, contractAddress, website, socialLinks, additionalInfo } = body

    // Validate input
    if (!coinSymbol) {
      return NextResponse.json({
        error: 'Coin symbol is required'
      }, { status: 400 })
    }

    const creditCost = CREDIT_COSTS.scam_detection

    // Check if user has enough credits
    if (profile.credits < creditCost) {
      return NextResponse.json({
        error: `Insufficient credits. This feature requires ${creditCost} credits.`,
        required_credits: creditCost,
        user_credits: profile.credits
      }, { status: 402 })
    }

    // Create AI prompt for scam detection analysis
    const detectionPrompt = `
    Analyze the following cryptocurrency project for potential scam indicators and risk factors:

    Project Details:
    - Symbol: ${coinSymbol}
    ${coinName ? `- Name: ${coinName}` : ''}
    ${contractAddress ? `- Contract Address: ${contractAddress}` : ''}
    ${website ? `- Website: ${website}` : ''}
    ${socialLinks?.twitter ? `- Twitter: ${socialLinks.twitter}` : ''}
    ${socialLinks?.telegram ? `- Telegram: ${socialLinks.telegram}` : ''}
    ${socialLinks?.discord ? `- Discord: ${socialLinks.discord}` : ''}
    ${additionalInfo ? `- Additional Info: ${additionalInfo}` : ''}

    Please provide a comprehensive analysis including:

    1. **Red Flags Analysis:**
       - Anonymous team/developers
       - Unrealistic promises or guaranteed returns
       - Lack of clear use case or technology
       - Poor website quality or plagiarized content
       - Suspicious tokenomics (high dev allocation, etc.)
       - Social media manipulation or fake followers

    2. **Technical Risk Assessment:**
       - Smart contract security concerns
       - Centralization risks
       - Liquidity issues
       - Token distribution analysis

    3. **Social Sentiment Indicators:**
       - Community engagement quality
       - Influencer endorsements vs organic growth
       - Social media presence authenticity

    4. **Development Activity:**
       - GitHub activity and code quality
       - Team transparency and experience
       - Roadmap feasibility

    5. **Overall Risk Score (1-100)** where:
       - 1-25: Very Low Risk (Likely legitimate)
       - 26-50: Low Risk (Minor concerns)
       - 51-75: High Risk (Multiple red flags)
       - 76-100: Very High Risk (Likely scam)

    6. **Final Verdict:** safe | caution | high_risk | scam

    Format as JSON with detailed analysis and specific recommendations.`

    // Generate AI analysis using Trader persona for professional analysis
    const aiAnalysis = await OpenAIService.generateChatResponse({
      persona: 'trader',
      message: detectionPrompt,
      maxTokens: 1200,
      temperature: 0.2 // Lower temperature for more consistent analysis
    })

    // Parse AI response and create structured detection result
    let detectionData
    try {
      // Try to extract JSON from AI response
      const jsonMatch = aiAnalysis.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        detectionData = JSON.parse(jsonMatch[0])
      } else {
        // Create structured fallback analysis
        detectionData = createFallbackAnalysis(coinSymbol, aiAnalysis)
      }
    } catch (parseError) {
      // Create fallback analysis
      detectionData = createFallbackAnalysis(coinSymbol, aiAnalysis)
    }

    // Ensure risk score is within bounds
    const riskScore = Math.min(100, Math.max(1, detectionData.risk_score || 50))

    // Determine verdict if not provided
    let verdict = detectionData.overall_verdict || 'caution'
    if (riskScore <= 25) verdict = 'safe'
    else if (riskScore <= 50) verdict = 'caution'
    else if (riskScore <= 75) verdict = 'high_risk'
    else verdict = 'scam'

    // Save scam detection result to database
    const { data: scamDetection, error: saveError } = await supabase
      .from('scam_detections')
      .insert({
        user_id: profile.id,
        coin_symbol: coinSymbol,
        contract_address: contractAddress,
        risk_score: riskScore,
        risk_factors: detectionData.risk_factors || [],
        social_sentiment: detectionData.social_sentiment || {},
        developer_activity: detectionData.developer_activity || {},
        overall_verdict: verdict,
        analysis_data: detectionData
      })
      .select()
      .single()

    if (saveError) {
      console.error('Scam detection save error:', saveError)
      return NextResponse.json({ error: 'Failed to save scam detection result' }, { status: 500 })
    }

    // Deduct credits
    const { error: creditError } = await supabase
      .from('users')
      .update({ credits: profile.credits - creditCost })
      .eq('id', profile.id)

    if (creditError) {
      console.error('Credit deduction error:', creditError)
    }

    // Record credit transaction
    await supabase
      .from('credit_transactions')
      .insert({
        user_id: profile.id,
        transaction_type: 'spend',
        amount: -creditCost,
        description: `Scam detection analysis for ${coinSymbol}`,
        ai_persona: 'trader'
      })

    // Record feature usage
    await supabase
      .from('feature_usage')
      .insert({
        user_id: profile.id,
        feature_type: 'premium',
        feature_name: 'scam_detector',
        credits_used: creditCost,
        success: true,
        metadata: {
          coin_symbol: coinSymbol,
          risk_score: riskScore,
          verdict: verdict
        }
      })

    return NextResponse.json({
      success: true,
      detection: scamDetection,
      credits_remaining: profile.credits - creditCost,
      credits_used: creditCost,
      ai_analysis: aiAnalysis
    })

  } catch (error) {
    console.error('Scam Detector API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function createFallbackAnalysis(coinSymbol: string, aiAnalysis: string) {
  return {
    risk_score: 50, // Default moderate risk
    risk_factors: [
      'Limited information available for comprehensive analysis',
      'Requires further investigation of project fundamentals',
      'Monitor for community and development activity'
    ],
    social_sentiment: {
      overall_sentiment: 'neutral',
      community_size: 'unknown',
      engagement_quality: 'requires_analysis'
    },
    developer_activity: {
      github_activity: 'unknown',
      team_transparency: 'requires_verification',
      code_quality: 'not_analyzed'
    },
    red_flags: [
      'Insufficient data for complete red flag analysis'
    ],
    recommendations: [
      'Conduct thorough research before investing',
      'Verify team credentials and project legitimacy',
      'Start with small investment amounts',
      'Monitor project development and community growth'
    ],
    overall_verdict: 'caution',
    detailed_analysis: aiAnalysis
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get user's scam detection results
    const { data: detections, error } = await supabase
      .from('scam_detections')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Scam detections fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch scam detections' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      detections: detections || []
    })

  } catch (error) {
    console.error('Scam Detections GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}