// Smart Alerts API Route
// POST /api/tools/smart-alerts - Create new smart alert
// GET /api/tools/smart-alerts - Get user's smart alerts

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { mcpSupabase } from '@/lib/supabase/mcp-helpers'

interface SmartAlertRequest {
  alertName: string
  alertType: 'price_movement' | 'volume_spike' | 'whale_activity' | 'narrative_change'
  targetSymbol?: string
  conditions: Record<string, any>
  notificationMethods?: {
    email?: boolean
    push?: boolean
    sms?: boolean
  }
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

    const body: SmartAlertRequest = await request.json()
    const {
      alertName,
      alertType,
      targetSymbol,
      conditions,
      notificationMethods = { email: true, push: false, sms: false }
    } = body

    if (!alertName || !alertType || !conditions) {
      return NextResponse.json({
        error: 'Alert name, type, and conditions are required'
      }, { status: 400 })
    }

    // Validate alert type
    const validAlertTypes = ['price_movement', 'volume_spike', 'whale_activity', 'narrative_change']
    if (!validAlertTypes.includes(alertType)) {
      return NextResponse.json({
        error: 'Invalid alert type'
      }, { status: 400 })
    }

    console.log(`Creating smart alert for user: ${profile.id}`)
    console.log(`Alert: ${alertName}, Type: ${alertType}, Symbol: ${targetSymbol}`)

    // Create the smart alert using enhanced database function with AI integration
    const { data: alertData, error: alertError } = await supabase
      .rpc('generate_smart_alert_system', {
        p_user_id: profile.id,
        p_alert_name: alertName,
        p_alert_type: alertType,
        p_target_symbol: targetSymbol || null,
        p_conditions: conditions,
        p_notification_methods: notificationMethods
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

    console.log(`Smart alert created successfully: ${result.alert_id}`)
    console.log(`Credits charged: ${result.credits_charged}`)

    return NextResponse.json({
      success: true,
      alertId: result.alert_id,
      alertConfig: result.alert_config,
      creditsCharged: result.credits_charged,
      message: `Smart alert "${alertName}" created successfully with AI-enhanced configuration`
    })

  } catch (error) {
    console.error('Smart alerts API error:', error)
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

    // Get user's smart alerts
    const { data: alerts, error } = await supabase
      .from('smart_alerts')
      .select(`
        id,
        alert_name,
        alert_type,
        target_symbol,
        conditions,
        notification_methods,
        is_active,
        last_triggered_at,
        trigger_count,
        created_at
      `)
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch smart alerts:', error)
      return NextResponse.json({
        error: 'Failed to fetch alerts'
      }, { status: 500 })
    }

    // Get alert templates
    const { data: templates, error: templatesError } = await supabase
      .from('alert_templates')
      .select('alert_type, template_name, description, default_conditions')
      .eq('is_active', true)

    if (templatesError) {
      console.error('Failed to fetch alert templates:', templatesError)
    }

    // Get alert limits for user's tier
    const { data: limits, error: limitsError } = await supabase
      .from('alert_limits')
      .select('*')
      .eq('tier', profile.tier)
      .single()

    if (limitsError) {
      console.error('Failed to fetch alert limits:', limitsError)
    }

    // Get recent alert triggers
    const { data: recentTriggers, error: triggersError } = await supabase
      .from('alert_triggers')
      .select(`
        id,
        smart_alert_id,
        trigger_data,
        message,
        triggered_at,
        delivery_status
      `)
      .eq('user_id', profile.id)
      .order('triggered_at', { ascending: false })
      .limit(20)

    if (triggersError) {
      console.error('Failed to fetch alert triggers:', triggersError)
    }

    return NextResponse.json({
      success: true,
      alerts: alerts || [],
      templates: templates || [],
      limits: limits || null,
      recentTriggers: recentTriggers || [],
      userTier: profile.tier
    })

  } catch (error) {
    console.error('Smart alerts GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
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

    // Check for alert triggers using the enhanced function
    const { data: triggerResults, error: triggerError } = await supabase
      .rpc('check_smart_alerts')

    if (triggerError) {
      console.error('Alert checking error:', triggerError)
      return NextResponse.json({
        error: 'Failed to check alerts'
      }, { status: 500 })
    }

    // Get user's performance stats
    const { data: performanceData, error: performanceError } = await supabase
      .rpc('get_alert_performance_stats', {
        p_user_id: profile.id
      })

    if (performanceError) {
      console.error('Performance stats error:', performanceError)
    }

    const performance = performanceData?.[0] || {
      total_alerts: 0,
      active_alerts: 0,
      total_triggers: 0,
      avg_accuracy: 0,
      performance_score: 0
    }

    console.log(`Alert check complete: ${triggerResults?.length || 0} alerts processed`)

    return NextResponse.json({
      success: true,
      alertsChecked: triggerResults?.length || 0,
      triggeredAlerts: triggerResults?.filter(r => r.triggered)?.length || 0,
      notificationsSent: triggerResults?.filter(r => r.notification_sent)?.length || 0,
      performance,
      message: 'Alert monitoring cycle completed successfully'
    })

  } catch (error) {
    console.error('Smart alerts PATCH API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}