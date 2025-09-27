// Whale Tracker API Route
// POST /api/tools/whale-tracker - Generate whale tracking report

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { mcpSupabase } from '@/lib/supabase/mcp-helpers'

interface WhaleTrackerRequest {
  walletAddresses: string[]
  timePeriod: '1h' | '24h' | '7d' | '30d'
  reportType: 'standard' | 'detailed'
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
    const profile = await mcpSupabase.getUserByAuthId(session.user.id)

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const body: WhaleTrackerRequest = await request.json()
    const { walletAddresses, timePeriod = '24h', reportType = 'standard' } = body

    if (!walletAddresses || walletAddresses.length === 0) {
      return NextResponse.json({
        error: 'At least one wallet address is required'
      }, { status: 400 })
    }

    // Validate wallet addresses (basic validation)
    const invalidAddresses = walletAddresses.filter(address => {
      // Bitcoin address validation (basic)
      if (address.match(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/)) return false
      // Ethereum address validation (basic)
      if (address.match(/^0x[a-fA-F0-9]{40}$/)) return false
      return true
    })

    if (invalidAddresses.length > 0) {
      return NextResponse.json({
        error: `Invalid wallet addresses: ${invalidAddresses.join(', ')}`
      }, { status: 400 })
    }

    // Determine credit cost
    const creditCost = reportType === 'detailed' ? 10 : 5

    // Check if user has enough credits
    if (profile.credits < creditCost) {
      return NextResponse.json({
        error: `Insufficient credits. This ${reportType} report requires ${creditCost} credits.`
      }, { status: 402 })
    }

    // Check tier access (Pro+ for whale tracker)
    const tierHierarchy = { free: 0, pro: 1, elite: 2 }
    const userTierLevel = tierHierarchy[profile.tier as keyof typeof tierHierarchy] || 0

    if (userTierLevel < 1) {
      return NextResponse.json({
        error: 'Whale Tracker requires Pro tier or higher'
      }, { status: 403 })
    }


    // Generate the whale tracker report using database function
    const { data: reportData, error: reportError } = await supabase
      .rpc('generate_whale_tracker_report', {
        p_user_id: profile.id,
        p_whale_wallets: walletAddresses,
        p_time_period: timePeriod,
        p_report_type: reportType
      })

    if (reportError) {
      console.error('Whale tracker report generation error:', reportError)
      return NextResponse.json({
        error: 'Failed to generate whale tracker report'
      }, { status: 500 })
    }

    const report = reportData[0]
    if (!report) {
      return NextResponse.json({
        error: 'No report data generated'
      }, { status: 500 })
    }

    // Deduct credits and record transaction
    const creditSuccess = await mcpSupabase.recordCreditUsage(
      profile.id,
      creditCost,
      `Whale Tracker Report (${reportType}, ${timePeriod})`,
      'whale_tracker',
      report.report_id
    )

    if (!creditSuccess) {
      console.warn('Credit usage recording failed, but continuing with report')
    }

    // Update user credits
    try {
      await mcpSupabase.updateUser(profile.id, {
        credits: profile.credits - creditCost
      })
    } catch (error) {
      console.error('Failed to update user credits:', error)
      return NextResponse.json({ error: 'Failed to process credits' }, { status: 500 })
    }

    // Enhance report data with additional analysis
    const enhancedReport = {
      ...report.report_data,
      metadata: {
        reportId: report.report_id,
        creditsUsed: creditCost,
        generatedAt: new Date().toISOString(),
        requestedBy: profile.email,
        walletCount: walletAddresses.length,
        timePeriod,
        reportType
      }
    }


    return NextResponse.json({
      success: true,
      report: enhancedReport,
      creditsRemaining: profile.credits - creditCost,
      creditsUsed: creditCost
    })

  } catch (error) {
    console.error('Whale tracker API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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
    const profile = await mcpSupabase.getUserByAuthId(session.user.id)

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get user's whale tracker reports
    const { data: reports, error } = await supabase
      .from('whale_tracker_reports')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Failed to fetch whale tracker reports:', error)
      return NextResponse.json({
        error: 'Failed to fetch reports'
      }, { status: 500 })
    }

    // Get popular whale wallets for suggestions
    const { data: popularWhales, error: whalesError } = await supabase
      .from('whale_wallets')
      .select('wallet_address, wallet_label, total_usd_value, last_activity_at')
      .eq('is_active', true)
      .order('total_usd_value', { ascending: false })
      .limit(10)

    if (whalesError) {
      console.error('Failed to fetch whale wallets:', whalesError)
    }

    return NextResponse.json({
      success: true,
      reports: reports || [],
      popularWhales: popularWhales || [],
      userTier: profile.tier,
      creditsRemaining: profile.credits
    })

  } catch (error) {
    console.error('Whale tracker GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}