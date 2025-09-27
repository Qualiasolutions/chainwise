// Individual Alert API Routes
// GET /api/alerts/[id] - Get specific alert
// PUT /api/alerts/[id] - Update alert
// DELETE /api/alerts/[id] - Delete alert

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { id: alertId } = await params

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const { data: alert, error } = await supabase
      .from('user_alerts')
      .select('*')
      .eq('id', alertId)
      .eq('user_id', profile.id)
      .single()

    if (error || !alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    return NextResponse.json({
      alert,
      success: true
    })

  } catch (error) {
    console.error('Get alert API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { id: alertId } = await params

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { targetValue, isActive } = body

    // Build update object with enhanced validation
    const updates: Record<string, unknown> = {}

    if (targetValue !== undefined) {
      const parsedTargetValue = parseFloat(targetValue)
      if (isNaN(parsedTargetValue) || parsedTargetValue <= 0) {
        return NextResponse.json({
          error: 'Target value must be a positive number greater than 0'
        }, { status: 400 })
      }

      // Validate target value ranges
      if (parsedTargetValue > 10000000) {
        return NextResponse.json({
          error: 'Price target cannot exceed $10,000,000'
        }, { status: 400 })
      }

      updates.target_value = parsedTargetValue
    }

    if (isActive !== undefined) {
      if (typeof isActive !== 'boolean') {
        return NextResponse.json({
          error: 'isActive must be a boolean value'
        }, { status: 400 })
      }
      updates.is_active = isActive
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 })
    }

    const { data: updatedAlert, error } = await supabase
      .from('user_alerts')
      .update(updates)
      .eq('id', alertId)
      .eq('user_id', profile.id)
      .select()
      .single()

    if (error || !updatedAlert) {
      console.error('Alert update error:', error)
      return NextResponse.json({ error: 'Alert not found or update failed' }, { status: 404 })
    }

    return NextResponse.json({
      alert: updatedAlert,
      success: true
    })

  } catch (error) {
    console.error('Update alert API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { id: alertId } = await params

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get alert info before deletion
    const { data: alert } = await supabase
      .from('user_alerts')
      .select('symbol, alert_type')
      .eq('id', alertId)
      .eq('user_id', profile.id)
      .single()

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('user_alerts')
      .delete()
      .eq('id', alertId)
      .eq('user_id', profile.id)

    if (error) {
      console.error('Alert deletion error:', error)
      return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Alert for ${alert.symbol.toUpperCase()} (${alert.alert_type}) deleted successfully`
    })

  } catch (error) {
    console.error('Delete alert API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}