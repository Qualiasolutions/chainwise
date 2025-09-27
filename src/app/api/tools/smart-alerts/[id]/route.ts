// Smart Alert Management API Route
// GET /api/tools/smart-alerts/[id] - Get specific alert
// PUT /api/tools/smart-alerts/[id] - Update alert
// DELETE /api/tools/smart-alerts/[id] - Delete alert

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { mcpSupabase } from '@/lib/supabase/mcp-helpers'

interface UpdateAlertRequest {
  alertName?: string
  conditions?: Record<string, any>
  notificationMethods?: {
    email?: boolean
    push?: boolean
    sms?: boolean
  }
  isActive?: boolean
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const alertId = params.id

    // Get specific alert
    const { data: alert, error } = await supabase
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
        created_at,
        updated_at
      `)
      .eq('id', alertId)
      .eq('user_id', profile.id)
      .single()

    if (error || !alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    // Get alert triggers for this specific alert
    const { data: triggers, error: triggersError } = await supabase
      .from('alert_triggers')
      .select(`
        id,
        trigger_data,
        message,
        triggered_at,
        delivery_status,
        delivered_at
      `)
      .eq('smart_alert_id', alertId)
      .order('triggered_at', { ascending: false })
      .limit(50)

    if (triggersError) {
      console.error('Failed to fetch alert triggers:', triggersError)
    }

    return NextResponse.json({
      success: true,
      alert,
      triggers: triggers || []
    })

  } catch (error) {
    console.error('Smart alert GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const alertId = params.id
    const body: UpdateAlertRequest = await request.json()

    const updates: any = {
      updated_at: new Date().toISOString()
    }

    if (body.alertName !== undefined) updates.alert_name = body.alertName
    if (body.conditions !== undefined) updates.conditions = body.conditions
    if (body.notificationMethods !== undefined) updates.notification_methods = body.notificationMethods
    if (body.isActive !== undefined) updates.is_active = body.isActive

    if (Object.keys(updates).length === 1) { // Only updated_at
      return NextResponse.json({
        error: 'No valid updates provided'
      }, { status: 400 })
    }

    console.log(`Updating alert ${alertId} for user: ${profile.id}`)

    // Update the alert
    const { data: alert, error } = await supabase
      .from('smart_alerts')
      .update(updates)
      .eq('id', alertId)
      .eq('user_id', profile.id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update alert:', error)
      return NextResponse.json({
        error: 'Failed to update alert'
      }, { status: 500 })
    }

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    console.log(`Alert updated successfully: ${alertId}`)

    return NextResponse.json({
      success: true,
      alert,
      message: 'Alert updated successfully'
    })

  } catch (error) {
    console.error('Smart alert PUT API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const alertId = params.id

    console.log(`Deleting alert ${alertId} for user: ${profile.id}`)

    // Delete the alert (triggers will be deleted by CASCADE)
    const { data: alert, error } = await supabase
      .from('smart_alerts')
      .delete()
      .eq('id', alertId)
      .eq('user_id', profile.id)
      .select()
      .single()

    if (error) {
      console.error('Failed to delete alert:', error)
      return NextResponse.json({
        error: 'Failed to delete alert'
      }, { status: 500 })
    }

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    console.log(`Alert deleted successfully: ${alertId}`)

    return NextResponse.json({
      success: true,
      message: 'Alert deleted successfully'
    })

  } catch (error) {
    console.error('Smart alert DELETE API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}