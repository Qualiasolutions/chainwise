import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Request validation schemas
const getNotificationsSchema = z.object({
  read: z.enum(['true', 'false', 'all']).optional().default('all'),
  type: z.enum(['alert_triggered', 'portfolio_update', 'system_notification', 'trading_signal', 'ai_insight', 'all']).optional().default('all'),
  limit: z.string().optional().transform(val => parseInt(val || '20')),
  offset: z.string().optional().transform(val => parseInt(val || '0'))
})

const createNotificationSchema = z.object({
  type: z.enum(['alert_triggered', 'portfolio_update', 'system_notification', 'trading_signal', 'ai_insight']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
  metadata: z.record(z.any()).optional().default({}),
  expiresAt: z.string().datetime().optional()
})

// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const { read, type, limit, offset } = getNotificationsSchema.parse(Object.fromEntries(searchParams))

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (read !== 'all') {
      query = query.eq('is_read', read === 'true')
    }

    if (type !== 'all') {
      query = query.eq('type', type)
    }

    const { data: notifications, count, error } = await query

    if (error) {
      console.error('Error fetching notifications:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch notifications',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      notifications: notifications || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: offset + limit < (count || 0)
      }
    })

  } catch (error) {
    console.error('Error in notifications GET:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid query parameters',
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'Failed to fetch notifications' 
    }, { status: 500 })
  }
}

// POST /api/notifications - Create new notification (system/service use)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createNotificationSchema.parse(body)

    const notificationData = {
      user_id: user.id,
      type: validatedData.type,
      title: validatedData.title,
      message: validatedData.message,
      priority: validatedData.priority,
      metadata: validatedData.metadata,
      is_read: false,
      expires_at: validatedData.expiresAt ? new Date(validatedData.expiresAt).toISOString() : null
    }

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      return NextResponse.json({ 
        error: 'Failed to create notification',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json(notification, { status: 201 })

  } catch (error) {
    console.error('Error in notifications POST:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid notification data',
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'Failed to create notification' 
    }, { status: 500 })
  }
}

// PATCH /api/notifications - Mark all as read
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (error) {
      console.error('Error marking notifications as read:', error)
      return NextResponse.json({ 
        error: 'Failed to mark notifications as read',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ message: 'All notifications marked as read' })

  } catch (error) {
    console.error('Error in notifications PATCH:', error)
    return NextResponse.json({ 
      error: 'Failed to mark notifications as read' 
    }, { status: 500 })
  }
}