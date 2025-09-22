// Email Update API Route
// PUT /api/settings/email - Update user's email address with verification

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { mcpSupabase } from '@/lib/supabase/mcp-helpers'

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

    const { new_email } = await request.json()

    if (!new_email || !isValidEmail(new_email)) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      )
    }

    // Check if email is already in use
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const emailExists = existingUsers?.users?.some(
      user => user.email?.toLowerCase() === new_email.toLowerCase() && user.id !== session.user.id
    )

    if (emailExists) {
      return NextResponse.json(
        { error: 'Email address is already in use' },
        { status: 409 }
      )
    }

    // Update email using Supabase Auth
    const { data, error: updateError } = await supabase.auth.updateUser({
      email: new_email
    })

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update email: ' + updateError.message },
        { status: 400 }
      )
    }

    // Log the email change activity
    await supabase.rpc('log_user_activity', {
      user_uuid: profile.id,
      activity_type: 'email_change',
      activity_description: `Email change requested to ${new_email}`,
      activity_metadata: {
        old_email: session.user.email,
        new_email: new_email
      }
    })

    return NextResponse.json({
      message: 'Email verification sent to new address',
      new_email: new_email,
      verification_required: true,
      success: true
    })

  } catch (error: any) {
    console.error('Email update error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}