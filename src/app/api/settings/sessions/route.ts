// User Sessions Management API Route
// GET /api/settings/sessions - Get user's active sessions
// DELETE /api/settings/sessions - Revoke a specific session

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

    // Get user's active sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', profile.id)
      .gte('expires_at', new Date().toISOString())
      .order('last_active', { ascending: false })

    if (sessionsError) {
      throw sessionsError
    }

    // Format sessions for UI
    const formattedSessions = (sessions || []).map((userSession: any) => ({
      id: userSession.id,
      device: getDeviceString(userSession.device_info, userSession.user_agent),
      location: userSession.location || 'Unknown location',
      ip_address: userSession.ip_address,
      last_active: userSession.last_active,
      is_current: userSession.is_current,
      created_at: userSession.created_at,
      expires_at: userSession.expires_at
    }))

    // Get account overview stats
    const totalSessions = formattedSessions.length
    const currentSession = formattedSessions.find(s => s.is_current)

    return NextResponse.json({
      sessions: formattedSessions,
      stats: {
        total_active: totalSessions,
        current_session: currentSession?.id || null,
        oldest_session: formattedSessions[formattedSessions.length - 1]?.created_at || null
      },
      success: true
    })

  } catch (error: any) {
    console.error('Sessions API GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    // Get session ID from request body
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Verify the session belongs to the user and is not the current session
    const { data: sessionToRevoke, error: sessionError } = await supabase
      .from('user_sessions')
      .select('id, is_current')
      .eq('id', sessionId)
      .eq('user_id', profile.id)
      .single()

    if (sessionError || !sessionToRevoke) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (sessionToRevoke.is_current) {
      return NextResponse.json({ error: 'Cannot revoke current session' }, { status: 400 })
    }

    // Revoke the session by setting expires_at to now
    const { error: revokeError } = await supabase
      .from('user_sessions')
      .update({
        expires_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('user_id', profile.id)

    if (revokeError) {
      throw revokeError
    }

    // Log the session revocation activity
    await supabase.rpc('log_user_activity', {
      user_uuid: profile.id,
      activity_type: 'session_revoked',
      activity_description: 'User session revoked',
      activity_metadata: { session_id: sessionId }
    })

    return NextResponse.json({
      message: 'Session revoked successfully',
      revoked_session_id: sessionId,
      success: true
    })

  } catch (error: any) {
    console.error('Sessions API DELETE error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to format device information
function getDeviceString(deviceInfo: any, userAgent: string): string {
  if (deviceInfo && typeof deviceInfo === 'object') {
    const browser = deviceInfo.browser || 'Unknown Browser'
    const os = deviceInfo.os || 'Unknown OS'
    const device = deviceInfo.device || ''

    if (device) {
      return `${browser} on ${device} (${os})`
    } else {
      return `${browser} on ${os}`
    }
  }

  // Fallback to user agent parsing
  if (userAgent) {
    if (userAgent.includes('Chrome')) {
      if (userAgent.includes('Mobile')) {
        return userAgent.includes('iPhone') ? 'Chrome on iPhone' : 'Chrome on Mobile'
      } else if (userAgent.includes('Mac')) {
        return 'Chrome on macOS'
      } else if (userAgent.includes('Windows')) {
        return 'Chrome on Windows'
      } else {
        return 'Chrome on Desktop'
      }
    } else if (userAgent.includes('Safari') && userAgent.includes('iPhone')) {
      return 'Safari on iPhone'
    } else if (userAgent.includes('Safari') && userAgent.includes('Mac')) {
      return 'Safari on macOS'
    } else if (userAgent.includes('Firefox')) {
      return userAgent.includes('Mobile') ? 'Firefox on Mobile' : 'Firefox on Desktop'
    } else if (userAgent.includes('Edge')) {
      return 'Edge on Windows'
    }
  }

  return 'Unknown Device'
}