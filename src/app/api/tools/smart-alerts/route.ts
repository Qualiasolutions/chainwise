// Smart Alerts API Route
// POST /api/tools/smart-alerts - Create new smart alert
// GET /api/tools/smart-alerts - Get user's smart alerts

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { mcpSupabase } from '@/lib/supabase/mcp-helpers'
import {
  handleAPIError,
  validateAuth,
  validateProfile,
  validateRequired,
  validateCredits,
  validateEnum,
  checkRateLimit
} from '@/lib/api-error-handler'

interface SmartAlertRequest {
  alertName: string
  coinSymbol: string
  coinName?: string
  alertType: 'price_above' | 'price_below' | 'volume_spike' | 'price_change_percent' | 'technical_indicator' | 'whale_activity'
  conditionValue: number
  secondaryValue?: number
  timeFrame?: string
  alertFrequency?: 'once' | 'daily' | 'always'
}

export async function POST(request: NextRequest) {
  const path = '/api/tools/smart-alerts'
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    validateAuth(session)

    // Rate limiting
    checkRateLimit(`smart-alerts:${session!.user.id}`, 20, 60000)

    // Get user profile
    const profile = await mcpSupabase.getUserByAuthId(session!.user.id)
    validateProfile(profile)

    const body: SmartAlertRequest = await request.json()
    const {
      alertName,
      coinSymbol,
      coinName,
      alertType,
      conditionValue,
      secondaryValue,
      timeFrame = '1d',
      alertFrequency = 'once'
    } = body

    // Validate required fields
    validateRequired(body, ['alertName', 'coinSymbol', 'alertType', 'conditionValue'])

    // Validate alert type
    const validAlertTypes = ['price_above', 'price_below', 'volume_spike', 'price_change_percent', 'technical_indicator', 'whale_activity']
    validateEnum(alertType, validAlertTypes, 'alert type')

    // Check if user has sufficient credits
    const creditCost = 2 // Smart Alerts cost 2 credits
    validateCredits(profile!.credits, creditCost)


    // Create the smart alert using our database function
    const { data: alertData, error: alertError } = await supabase
      .rpc('generate_smart_alert', {
        p_user_id: profile.id,
        p_alert_name: alertName,
        p_coin_symbol: coinSymbol,
        p_coin_name: coinName || coinSymbol,
        p_alert_type: alertType,
        p_condition_value: conditionValue,
        p_secondary_value: secondaryValue,
        p_time_frame: timeFrame,
        p_alert_frequency: alertFrequency
      })

    if (alertError) {
      console.error('Smart alert creation error:', alertError)
      return NextResponse.json({
        error: 'Failed to create smart alert'
      }, { status: 500 })
    }

    const result = alertData[0]
    if (!result) {
      return NextResponse.json({
        error: 'Failed to create alert - no result returned'
      }, { status: 400 })
    }

    // Deduct credits and record transaction
    const creditSuccess = await mcpSupabase.recordCreditUsage(
      profile.id,
      creditCost,
      `Smart Alert: ${alertName}`,
      'smart_alert',
      result.alert_id
    )

    if (!creditSuccess) {
      console.warn('Credit usage recording failed, but continuing with alert')
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


    return NextResponse.json({
      success: true,
      alertId: result.alert_id,
      alertAnalysis: result.alert_analysis,
      creditsRemaining: profile.credits - creditCost,
      creditsUsed: creditCost,
      message: `Smart alert "${alertName}" created successfully`
    })

  } catch (error) {
    return handleAPIError(error, path)
  }
}

export async function GET(request: NextRequest) {
  const path = '/api/tools/smart-alerts'
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    validateAuth(session)

    // Get user profile
    const profile = await mcpSupabase.getUserByAuthId(session!.user.id)
    validateProfile(profile)

    // Get user's smart alerts using our database function
    const { data: alerts, error } = await supabase
      .rpc('get_user_smart_alerts', {
        p_user_id: profile.id
      })

    if (error) {
      console.error('Failed to fetch smart alerts:', error)
      return NextResponse.json({
        error: 'Failed to fetch alerts'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      alerts: alerts || [],
      userTier: profile.tier,
      creditsRemaining: profile.credits,
      creditCost: 2
    })

  } catch (error) {
    return handleAPIError(error, path)
  }
}

