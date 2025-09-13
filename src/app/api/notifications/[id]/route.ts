import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateNotificationSchema = z.object({
  read: z.boolean().optional()
})

// GET /api/notifications/[id] - Get specific notification
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: notification, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
      }
      console.error('Error fetching notification:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch notification',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json(notification)

  } catch (error) {
    console.error('Error in notification GET:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch notification' 
    }, { status: 500 })
  }
}

// PATCH /api/notifications/[id] - Update notification (mark as read, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateNotificationSchema.parse(body)

    // Verify notification ownership
    const { data: existingNotification, error: fetchError } = await supabase
      .from('notifications')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
      }
      console.error('Error fetching notification for update:', fetchError)
      return NextResponse.json({ 
        error: 'Failed to fetch notification',
        details: fetchError.message 
      }, { status: 500 })
    }

    // Update notification
    const { data: updatedNotification, error: updateError } = await supabase
      .from('notifications')
      .update(validatedData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating notification:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update notification',
        details: updateError.message 
      }, { status: 500 })
    }

    return NextResponse.json(updatedNotification)

  } catch (error) {
    console.error('Error in notification PATCH:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid notification data',
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'Failed to update notification' 
    }, { status: 500 })
  }
}

// DELETE /api/notifications/[id] - Delete notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify notification ownership and delete
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting notification:', error)
      return NextResponse.json({ 
        error: 'Failed to delete notification',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ message: 'Notification deleted successfully' })

  } catch (error) {
    console.error('Error in notification DELETE:', error)
    return NextResponse.json({ 
      error: 'Failed to delete notification' 
    }, { status: 500 })
  }
}