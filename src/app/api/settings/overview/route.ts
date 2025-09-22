// Settings Overview API Route
// GET /api/settings/overview - Get user's settings dashboard data

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

    // Get recent activities
    const { data: recentActivities } = await supabase
      .rpc('get_user_recent_activities', { user_uuid: profile.id, activity_limit: 5 })

    // Get notification count (unread notifications)
    const { data: notificationCount } = await supabase
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', profile.id)
      .eq('is_read', false)

    // Get active sessions count
    const { data: sessionCount } = await supabase
      .from('user_sessions')
      .select('id', { count: 'exact' })
      .eq('user_id', profile.id)
      .gte('expires_at', new Date().toISOString())

    // Get security settings
    const { data: securitySettings } = await supabase
      .from('account_security')
      .select('two_factor_enabled, security_notifications, login_notifications')
      .eq('user_id', profile.id)
      .single()

    // Get notification preferences
    const { data: notificationPrefs } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', profile.id)
      .single()

    // Get connected accounts count
    const { data: connectedAccountsCount } = await supabase
      .from('connected_accounts')
      .select('id', { count: 'exact' })
      .eq('user_id', profile.id)

    // Calculate subscription badge
    let subscriptionBadge = null
    if (profile.tier === 'pro') {
      subscriptionBadge = 'Pro Plan'
    } else if (profile.tier === 'elite') {
      subscriptionBadge = 'Elite Plan'
    }

    // Count active alerts/notifications
    const activeNotifications = notificationCount?.count || 0
    const activeSessions = sessionCount?.count || 0
    const connectedAccounts = connectedAccountsCount?.count || 0

    // Format recent activities for UI
    const formattedActivities = (recentActivities || []).map((activity: any) => ({
      id: activity.id,
      type: activity.activity_type,
      description: activity.activity_description,
      timestamp: activity.created_at,
      // Map activity types to UI-friendly formats
      displayText: getActivityDisplayText(activity.activity_type, activity.activity_description),
      color: getActivityColor(activity.activity_type)
    }))

    return NextResponse.json({
      user: {
        id: profile.id,
        email: session.user.email,
        tier: profile.tier,
        full_name: profile.full_name
      },
      badges: {
        subscription: subscriptionBadge,
        notifications: activeNotifications > 0 ? `${activeNotifications} Active` : null,
        sessions: activeSessions > 1 ? `${activeSessions} Sessions` : null,
        connected_accounts: connectedAccounts > 0 ? `${connectedAccounts} Connected` : null
      },
      recent_activities: formattedActivities,
      stats: {
        total_notifications: activeNotifications,
        active_sessions: activeSessions,
        connected_accounts: connectedAccounts,
        two_factor_enabled: securitySettings?.two_factor_enabled || false,
        security_notifications: securitySettings?.security_notifications || false
      },
      preferences: {
        security: securitySettings,
        notifications: notificationPrefs
      },
      success: true
    })

  } catch (error: any) {
    console.error('Settings overview API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to format activity descriptions for UI
function getActivityDisplayText(activityType: string, description: string): string {
  switch (activityType) {
    case 'login':
      return 'Signed in to account'
    case 'profile_update':
      return 'Profile updated'
    case 'subscription_change':
      return 'Subscription updated'
    case 'security_update':
      return 'Security settings changed'
    case 'preferences_update':
      return 'Preferences updated'
    case 'password_change':
      return 'Password changed'
    case 'portfolio_update':
      return 'Portfolio modified'
    case 'ai_chat':
      return 'AI chat session'
    default:
      return description || 'Account activity'
  }
}

// Helper function to get activity colors for UI
function getActivityColor(activityType: string): string {
  switch (activityType) {
    case 'login':
      return 'blue'
    case 'profile_update':
      return 'green'
    case 'subscription_change':
      return 'purple'
    case 'security_update':
      return 'red'
    case 'preferences_update':
      return 'gray'
    case 'password_change':
      return 'orange'
    case 'portfolio_update':
      return 'teal'
    case 'ai_chat':
      return 'indigo'
    default:
      return 'gray'
  }
}