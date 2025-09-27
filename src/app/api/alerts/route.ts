// User Alerts API Routes
// GET /api/alerts - Get user alerts
// POST /api/alerts - Create new alert

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'

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
      .from('profiles')
      .select('id, tier')
      .eq('auth_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'
    const symbol = searchParams.get('symbol')

    let query = supabase
      .from('user_alerts')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    if (symbol) {
      query = query.eq('symbol', symbol.toLowerCase())
    }

    // TODO: Replace with MCP query
    const { data: alerts, error } = await query

    if (error) {
      console.error('Alerts fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
    }

    return NextResponse.json({
      alerts: alerts || [],
      success: true
    })

  } catch (error) {
    console.error('Alerts API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, tier')
      .eq('auth_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { symbol, alertType, targetValue } = body

    // Enhanced validation
    if (!symbol || !alertType || targetValue === undefined || targetValue === null) {
      return NextResponse.json({
        error: 'Missing required fields: symbol, alertType, targetValue'
      }, { status: 400 })
    }

    // Validate symbol format (basic cryptocurrency symbol validation)
    const symbolRegex = /^[A-Z0-9]{1,10}$/
    if (!symbolRegex.test(symbol.toUpperCase())) {
      return NextResponse.json({
        error: 'Invalid symbol format. Use uppercase letters and numbers only (1-10 characters)'
      }, { status: 400 })
    }

    const validAlertTypes = ['price_above', 'price_below', 'percentage_change']
    if (!validAlertTypes.includes(alertType)) {
      return NextResponse.json({
        error: 'Invalid alert type. Must be: price_above, price_below, or percentage_change'
      }, { status: 400 })
    }

    const parsedTargetValue = parseFloat(targetValue)
    if (isNaN(parsedTargetValue) || parsedTargetValue <= 0) {
      return NextResponse.json({
        error: 'Target value must be a positive number greater than 0'
      }, { status: 400 })
    }

    // Validate target value ranges based on alert type
    if (alertType === 'percentage_change') {
      if (parsedTargetValue > 1000) {
        return NextResponse.json({
          error: 'Percentage change cannot exceed 1000%'
        }, { status: 400 })
      }
    } else {
      // For price alerts, check reasonable price limits
      if (parsedTargetValue > 10000000) {
        return NextResponse.json({
          error: 'Price target cannot exceed $10,000,000'
        }, { status: 400 })
      }
    }

    // Check alert limits based on tier
    const { data: existingAlerts } = await supabase
      .from('user_alerts')
      .select('id')
      .eq('user_id', profile.id)
      .eq('is_active', true)

    const alertLimits = {
      free: 3,
      pro: 10,
      elite: 999999 // Unlimited
    }

    const userLimit = alertLimits[profile.tier as keyof typeof alertLimits] || 3

    if (existingAlerts && existingAlerts.length >= userLimit) {
      return NextResponse.json({
        error: `Alert limit reached. ${profile.tier} tier allows ${userLimit === 999999 ? 'unlimited' : userLimit} active alerts.`
      }, { status: 400 })
    }

    // Check for duplicate alert
    const { data: duplicateAlert } = await supabase
      .from('user_alerts')
      .select('id')
      .eq('user_id', profile.id)
      .eq('symbol', symbol.toLowerCase())
      .eq('alert_type', alertType)
      .eq('target_value', targetValue)
      .eq('is_active', true)
      .single()

    if (duplicateAlert) {
      return NextResponse.json({
        error: 'An identical alert already exists for this symbol'
      }, { status: 400 })
    }

    // TODO: Replace with MCP query
    const { data: newAlert, error } = await supabase
      .from('user_alerts')
      .insert({
        user_id: profile.id,
        symbol: symbol.toLowerCase(),
        alert_type: alertType,
        target_value: parsedTargetValue,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Alert creation error:', error)
      return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 })
    }

    return NextResponse.json({
      alert: newAlert,
      success: true
    })

  } catch (error) {
    console.error('Create alert API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}