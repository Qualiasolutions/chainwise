// Notification Preferences API Route
// GET /api/settings/notifications - Get user's notification preferences
// PUT /api/settings/notifications - Update notification preferences

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { mcpSupabase } from '@/lib/supabase/mcp-helpers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile using MCP helper
    const profile = await mcpSupabase.getUserByAuthId(session.user.id)

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get notification preferences using the database function
    const { data: preferences, error: prefsError } = await supabase
      .rpc('get_user_notification_preferences', { user_uuid: profile.id })

    if (prefsError) {
      throw prefsError
    }

    // Get notification statistics
    const { data: totalNotifications } = await supabase
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', profile.id)

    const { data: unreadNotifications } = await supabase
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', profile.id)
      .eq('is_read', false)

    // Get recent notifications for preview
    const { data: recentNotifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(5)

    // Default preferences if none exist
    const notificationPrefs = preferences?.[0] || {
      email_notifications: true,
      push_notifications: true,
      marketing_emails: false,
      price_alerts: true,
      portfolio_updates: true,
      weekly_reports: true,
      security_alerts: true
    }

    return NextResponse.json({
      preferences: notificationPrefs,
      statistics: {
        total_notifications: totalNotifications?.count || 0,
        unread_notifications: unreadNotifications?.count || 0,
        email_enabled: notificationPrefs.email_notifications,
        push_enabled: notificationPrefs.push_notifications
      },
      recent_notifications: (recentNotifications || []).map((notification: any) => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        is_read: notification.is_read,
        created_at: notification.created_at
      })),
      success: true
    })

  } catch (error: any) {
    console.error('Notification preferences GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
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

    // Get user profile using MCP helper
    const profile = await mcpSupabase.getUserByAuthId(session.user.id)

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get preferences from request body
    const preferences = await request.json()

    // Validate preferences structure
    const validKeys = [
      'email_notifications',
      'push_notifications',
      'marketing_emails',
      'price_alerts',
      'portfolio_updates',
      'weekly_reports',
      'security_alerts'
    ]

    const sanitizedPrefs: any = {}
    for (const key of validKeys) {
      if (key in preferences) {
        sanitizedPrefs[key] = Boolean(preferences[key])
      }
    }

    if (Object.keys(sanitizedPrefs).length === 0) {
      return NextResponse.json(
        { error: 'No valid preferences provided' },
        { status: 400 }
      )
    }

    // Update preferences using the database function
    const { data: updateResult, error: updateError } = await supabase
      .rpc('update_notification_preferences', {
        user_uuid: profile.id,
        prefs: sanitizedPrefs
      })

    if (updateError) {
      throw updateError
    }

    // Get updated preferences to return
    const { data: updatedPrefs, error: fetchError } = await supabase
      .rpc('get_user_notification_preferences', { user_uuid: profile.id })

    if (fetchError) {
      throw fetchError
    }

    const finalPrefs = updatedPrefs?.[0] || sanitizedPrefs

    return NextResponse.json({
      message: 'Notification preferences updated successfully',
      preferences: finalPrefs,
      updated_fields: Object.keys(sanitizedPrefs),
      success: true
    })

  } catch (error: any) {
    console.error('Notification preferences PUT error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST endpoint for marking notifications as read
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile using MCP helper
    const profile = await mcpSupabase.getUserByAuthId(session.user.id)

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const { action, notification_ids } = await request.json()

    if (action === 'mark_as_read') {
      let updateResult

      if (notification_ids && Array.isArray(notification_ids)) {
        // Mark specific notifications as read
        const { error: markError } = await supabase
          .from('notifications')
          .update({ is_read: true, updated_at: new Date().toISOString() })
          .eq('user_id', profile.id)
          .in('id', notification_ids)

        if (markError) {
          throw markError
        }

        updateResult = `${notification_ids.length} notifications marked as read`

      } else {
        // Mark all notifications as read
        const { error: markAllError } = await supabase
          .from('notifications')
          .update({ is_read: true, updated_at: new Date().toISOString() })
          .eq('user_id', profile.id)
          .eq('is_read', false)

        if (markAllError) {
          throw markAllError
        }

        updateResult = 'All notifications marked as read'
      }

      // Log the activity
      await supabase.rpc('log_user_activity', {
        user_uuid: profile.id,
        activity_type: 'preferences_update',
        activity_description: 'Notifications marked as read',
        activity_metadata: { notification_ids: notification_ids || 'all' }
      })

      return NextResponse.json({
        message: updateResult,
        success: true
      })

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Notification action error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}