import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const scheduleSchema = z.object({
  reportType: z.enum(['pro_weekly', 'elite_monthly', 'deep_dive']),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  parameters: z.object({
    coins: z.array(z.string()).optional(),
    timeframe: z.string().optional(),
    customPrompt: z.string().optional()
  }).optional(),
  isActive: z.boolean().default(true)
})

// GET - List user's scheduled reports
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user's scheduled reports
    const { data: schedules, error: schedulesError } = await supabase
      .from('report_schedules')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (schedulesError) {
      console.error('Error fetching report schedules:', schedulesError)
      return NextResponse.json(
        { error: 'Failed to fetch schedules' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      schedules: schedules || []
    })

  } catch (error) {
    console.error('Error in GET report schedules:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new scheduled report
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { reportType, frequency, parameters = {}, isActive } = scheduleSchema.parse(body)

    // Check user permissions
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()
    
    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check permissions for report type
    const canSchedule = canScheduleReport(reportType, userData.subscription_tier)
    if (!canSchedule.allowed) {
      return NextResponse.json(
        { error: canSchedule.error },
        { status: 403 }
      )
    }

    // Check if user already has this type of schedule
    const { data: existingSchedule } = await supabase
      .from('report_schedules')
      .select('id')
      .eq('user_id', user.id)
      .eq('report_type', reportType)
      .eq('frequency', frequency)
      .single()

    if (existingSchedule) {
      return NextResponse.json(
        { error: 'You already have a schedule for this report type and frequency' },
        { status: 409 }
      )
    }

    // Calculate next run time
    const nextRunAt = calculateNextRunTime(frequency)

    // Create schedule
    const { data: schedule, error: scheduleError } = await supabase
      .from('report_schedules')
      .insert({
        user_id: user.id,
        report_type: reportType,
        frequency,
        parameters,
        is_active: isActive,
        next_run_at: nextRunAt.toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (scheduleError) {
      console.error('Error creating schedule:', scheduleError)
      return NextResponse.json(
        { error: 'Failed to create schedule' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      schedule,
      message: 'Report schedule created successfully'
    })

  } catch (error) {
    console.error('Error creating report schedule:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Remove scheduled report
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const scheduleId = url.searchParams.get('id')

    if (!scheduleId) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      )
    }

    // Delete schedule (only if owned by user)
    const { error: deleteError } = await supabase
      .from('report_schedules')
      .delete()
      .eq('id', scheduleId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting schedule:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete schedule' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Schedule deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting report schedule:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function canScheduleReport(reportType: string, userTier: string) {
  switch (reportType) {
    case 'pro_weekly':
      return {
        allowed: ['pro', 'elite'].includes(userTier),
        error: 'Pro Weekly reports require Pro or Elite subscription'
      }
    
    case 'elite_monthly':
      return {
        allowed: userTier === 'elite',
        error: 'Elite Monthly reports require Elite subscription'
      }
    
    case 'deep_dive':
      return {
        allowed: true,
        error: null
      }
    
    default:
      return {
        allowed: false,
        error: 'Invalid report type'
      }
  }
}

function calculateNextRunTime(frequency: string): Date {
  const now = new Date()
  
  switch (frequency) {
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000) // +1 day
    
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // +1 week
    
    case 'monthly':
      const nextMonth = new Date(now)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      return nextMonth
    
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000)
  }
}