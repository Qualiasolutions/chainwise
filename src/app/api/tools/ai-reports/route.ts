// AI Reports API Route
// POST /api/tools/ai-reports - Generate AI reports (Weekly Pro, Monthly Elite)
// GET /api/tools/ai-reports - Get user's AI reports history

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { mcpSupabase } from '@/lib/supabase/mcp-helpers'
import { CREDIT_COSTS } from '@/lib/openai/personas'

interface AIReportRequest {
  reportType: 'weekly_pro' | 'monthly_elite' | 'deep_dive'
  customParameters?: Record<string, any>
  isPremium?: boolean // For extra reports beyond subscription
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

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

    const body: AIReportRequest = await request.json()
    const { reportType, customParameters = {}, isPremium = false } = body

    if (!reportType) {
      return NextResponse.json({
        error: 'Report type is required'
      }, { status: 400 })
    }

    // Validate report type
    if (!['weekly_pro', 'monthly_elite', 'deep_dive'].includes(reportType)) {
      return NextResponse.json({
        error: 'Invalid report type. Must be weekly_pro, monthly_elite, or deep_dive'
      }, { status: 400 })
    }

    // Check tier access and determine credit cost
    const tierHierarchy = { free: 0, pro: 1, elite: 2 }
    const userTierLevel = tierHierarchy[profile.tier as keyof typeof tierHierarchy] || 0

    let creditCost = 0
    let accessAllowed = false

    switch (reportType) {
      case 'weekly_pro':
        accessAllowed = userTierLevel >= 1 // Pro+
        creditCost = isPremium ? CREDIT_COSTS.extra_pro_report : 0 // Free for Pro users, 5 credits for extra
        break
      case 'monthly_elite':
        accessAllowed = userTierLevel >= 2 // Elite only
        creditCost = isPremium ? CREDIT_COSTS.extra_elite_report : 0 // Free for Elite users, 10 credits for extra
        break
      case 'deep_dive':
        accessAllowed = userTierLevel >= 1 // Pro+
        creditCost = CREDIT_COSTS.ai_deep_dive_report // Always costs credits
        break
      default:
        creditCost = CREDIT_COSTS.ai_deep_dive_report
        accessAllowed = true
    }

    if (!accessAllowed) {
      const requiredTier = reportType === 'monthly_elite' ? 'Elite' : 'Pro'
      return NextResponse.json({
        error: `${reportType} reports require ${requiredTier} tier or higher`
      }, { status: 403 })
    }

    // Check if user has enough credits (if cost applies)
    if (creditCost > 0 && profile.credits < creditCost) {
      return NextResponse.json({
        error: `Insufficient credits. This report requires ${creditCost} credits.`
      }, { status: 402 })
    }

    console.log(`Generating AI report for user: ${profile.id}`)
    console.log(`Report type: ${reportType}, Premium: ${isPremium}, Credits: ${creditCost}`)

    // Generate the AI report using database function
    const { data: reportData, error: reportError } = await supabase
      .rpc('generate_ai_report', {
        p_user_id: profile.id,
        p_report_type: reportType,
        p_custom_parameters: customParameters,
        p_is_premium: isPremium
      })

    if (reportError) {
      console.error('AI report generation error:', reportError)
      return NextResponse.json({
        error: 'Failed to generate AI report'
      }, { status: 500 })
    }

    const report = reportData[0]
    if (!report) {
      return NextResponse.json({
        error: 'No report data generated'
      }, { status: 500 })
    }

    // Deduct credits and record transaction (if applicable)
    if (creditCost > 0) {
      const creditSuccess = await mcpSupabase.recordCreditUsage(
        profile.id,
        creditCost,
        `AI Report (${reportType})`,
        'ai_report',
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
    }

    // Enhance report data with additional metadata
    const enhancedReport = {
      ...report.report_content,
      metadata: {
        reportId: report.report_id,
        creditsUsed: creditCost,
        generatedAt: new Date().toISOString(),
        requestedBy: profile.email,
        reportType,
        isPremium,
        userTier: profile.tier
      }
    }

    console.log(`AI report generated successfully. Credits used: ${creditCost}`)

    return NextResponse.json({
      success: true,
      report: enhancedReport,
      creditsRemaining: profile.credits - creditCost,
      creditsUsed: creditCost
    })

  } catch (error) {
    console.error('AI reports API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

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

    // Get user's AI reports
    const { data: reports, error } = await supabase
      .from('ai_reports')
      .select(`
        id,
        report_type,
        report_title,
        report_content,
        credits_used,
        is_premium,
        created_at,
        expires_at
      `)
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Failed to fetch AI reports:', error)
      return NextResponse.json({
        error: 'Failed to fetch reports'
      }, { status: 500 })
    }

    // Get user's report subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('ai_report_subscriptions')
      .select('*')
      .eq('user_id', profile.id)

    if (subError) {
      console.error('Failed to fetch report subscriptions:', subError)
    }

    // Get available report templates
    const { data: templates, error: templatesError } = await supabase
      .from('ai_report_templates')
      .select('report_type, template_name, template_sections')
      .eq('is_active', true)

    if (templatesError) {
      console.error('Failed to fetch report templates:', templatesError)
    }

    return NextResponse.json({
      success: true,
      reports: reports || [],
      subscriptions: subscriptions || [],
      templates: templates || [],
      userTier: profile.tier,
      creditsRemaining: profile.credits
    })

  } catch (error) {
    console.error('AI reports GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}