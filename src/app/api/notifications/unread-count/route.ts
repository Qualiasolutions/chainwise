import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/notifications/unread-count - Get unread notification count
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (error) {
      console.error('Error fetching unread count:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch unread count',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      unreadCount: count || 0 
    })

  } catch (error) {
    console.error('Error in unread-count GET:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch unread count' 
    }, { status: 500 })
  }
}