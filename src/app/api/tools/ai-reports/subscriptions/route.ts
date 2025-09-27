// AI Report Subscriptions API Route
// GET /api/tools/ai-reports/subscriptions - Get user subscriptions
// POST /api/tools/ai-reports/subscriptions - Manage report subscriptions
// PUT /api/tools/ai-reports/subscriptions - Update subscription settings

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { mcpSupabase } from '@/lib/supabase/mcp-helpers'

interface SubscriptionRequest {
  reportType: 'weekly_pro' | 'monthly_elite'
  isActive: boolean
  autoGenerate?: boolean
  emailDelivery?: boolean
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

    // Get user's report subscriptions
    const { data: subscriptions, error } = await supabase
      .from('ai_report_subscriptions')
      .select('*')
      .eq('user_id', profile.id)

    if (error) {
      console.error('Failed to fetch report subscriptions:', error)
      return NextResponse.json({
        error: 'Failed to fetch subscriptions'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      subscriptions: subscriptions || [],
      userTier: profile.tier
    })

  } catch (error) {
    console.error('AI report subscriptions GET API error:', error)
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
    const profile = await mcpSupabase.getUserByAuthId(session.user.id)

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const body: SubscriptionRequest = await request.json()
    const { reportType, isActive, autoGenerate = true, emailDelivery = true } = body

    if (!reportType || typeof isActive !== 'boolean') {
      return NextResponse.json({
        error: 'Report type and active status are required'
      }, { status: 400 })
    }

    // Check tier access
    const tierHierarchy = { free: 0, pro: 1, elite: 2 }
    const userTierLevel = tierHierarchy[profile.tier as keyof typeof tierHierarchy] || 0

    if (reportType === 'weekly_pro' && userTierLevel < 1) {
      return NextResponse.json({
        error: 'Weekly Pro reports require Pro tier or higher'
      }, { status: 403 })
    }

    if (reportType === 'monthly_elite' && userTierLevel < 2) {
      return NextResponse.json({
        error: 'Monthly Elite reports require Elite tier'
      }, { status: 403 })
    }

    // Calculate next due date
    const nextDueAt = isActive ? (() => {
      const now = new Date()
      if (reportType === 'weekly_pro') {
        return new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)) // 7 days
      } else {
        return new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)) // 30 days
      }
    })() : null

    // Upsert subscription
    const { data: subscription, error } = await supabase
      .from('ai_report_subscriptions')
      .upsert({
        user_id: profile.id,
        report_type: reportType,
        is_active: isActive,
        auto_generate: autoGenerate,
        email_delivery: emailDelivery,
        next_due_at: nextDueAt?.toISOString()
      }, {
        onConflict: 'user_id,report_type'
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to update subscription:', error)
      return NextResponse.json({
        error: 'Failed to update subscription'
      }, { status: 500 })
    }

    console.log(`AI report subscription updated: ${reportType} for user ${profile.id}`)

    return NextResponse.json({
      success: true,
      subscription,
      message: `${reportType} subscription ${isActive ? 'activated' : 'deactivated'}`
    })

  } catch (error) {
    console.error('AI report subscriptions POST API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    const body: Partial<SubscriptionRequest> & { id: string } = await request.json()
    const { id, autoGenerate, emailDelivery } = body

    if (!id) {
      return NextResponse.json({
        error: 'Subscription ID is required'
      }, { status: 400 })
    }

    const updates: any = {}
    if (typeof autoGenerate === 'boolean') updates.auto_generate = autoGenerate
    if (typeof emailDelivery === 'boolean') updates.email_delivery = emailDelivery

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({
        error: 'No valid updates provided'
      }, { status: 400 })
    }

    // Update subscription settings
    const { data: subscription, error } = await supabase
      .from('ai_report_subscriptions')
      .update(updates)
      .eq('id', id)
      .eq('user_id', profile.id) // Ensure user owns the subscription
      .select()
      .single()

    if (error) {
      console.error('Failed to update subscription settings:', error)
      return NextResponse.json({
        error: 'Failed to update subscription settings'
      }, { status: 500 })
    }

    if (!subscription) {
      return NextResponse.json({
        error: 'Subscription not found or access denied'
      }, { status: 404 })
    }

    console.log(`AI report subscription settings updated: ${id} for user ${profile.id}`)

    return NextResponse.json({
      success: true,
      subscription,
      message: 'Subscription settings updated successfully'
    })

  } catch (error) {
    console.error('AI report subscriptions PUT API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}