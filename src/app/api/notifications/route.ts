// Notifications API Routes
// GET /api/notifications - Get user notifications
// PUT /api/notifications - Mark notifications as read

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
      .from('users')
      .select('id')
      .eq('auth_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')
    const type = searchParams.get('type')

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 100)) // Cap at 100

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    if (type) {
      query = query.eq('type', type)
    }

    // TODO: Replace with MCP query
    const { data: notifications, error } = await query

    if (error) {
      console.error('Notifications fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }

    // Get unread count
    const { data: unreadCount } = await supabase
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', profile.id)
      .eq('is_read', false)

    return NextResponse.json({
      notifications: notifications || [],
      unreadCount: unreadCount?.length || 0,
      success: true
    })

  } catch (error) {
    console.error('Notifications API error:', error)
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
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { notificationIds, markAllAsRead } = body

    if (markAllAsRead) {
      // Mark all notifications as read
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', profile.id)
        .eq('is_read', false)

      if (error) {
        console.error('Mark all notifications read error:', error)
        return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read'
      })
    }

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json({
        error: 'notificationIds array is required when markAllAsRead is false'
      }, { status: 400 })
    }

    // Mark specific notifications as read
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', profile.id)
      .in('id', notificationIds)

    if (error) {
      console.error('Mark notifications read error:', error)
      return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `${notificationIds.length} notification(s) marked as read`
    })

  } catch (error) {
    console.error('Update notifications API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}