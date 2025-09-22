// Account Management API Route
// DELETE /api/settings/account - Delete user account and all associated data

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { mcpSupabase } from '@/lib/supabase/mcp-helpers'

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

    const { confirmation_text } = await request.json()

    // Require confirmation text for account deletion
    if (confirmation_text !== 'DELETE MY ACCOUNT') {
      return NextResponse.json(
        { error: 'Invalid confirmation text. Please type "DELETE MY ACCOUNT" to confirm.' },
        { status: 400 }
      )
    }

    // Log the account deletion attempt
    await supabase.rpc('log_user_activity', {
      user_uuid: profile.id,
      activity_type: 'account_deletion',
      activity_description: 'Account deletion initiated',
      activity_metadata: {
        email: session.user.email,
        user_id: profile.id
      }
    })

    // Start transaction-like deletion process
    // Note: Supabase doesn't support transactions in client libraries,
    // but CASCADE DELETE is set up in the schema to handle related data

    try {
      // Delete user from users table (CASCADE will handle related tables)
      const { error: userDeleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', profile.id)

      if (userDeleteError) {
        throw userDeleteError
      }

      // Delete auth user (this should be done last)
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(session.user.id)

      if (authDeleteError) {
        console.error('Warning: Failed to delete auth user:', authDeleteError)
        // Continue anyway since user data is deleted
      }

      return NextResponse.json({
        message: 'Account deleted successfully',
        deleted_user_id: profile.id,
        deleted_at: new Date().toISOString(),
        success: true
      })

    } catch (deletionError: any) {
      console.error('Account deletion error:', deletionError)

      // Log the failed deletion attempt
      await supabase.rpc('log_user_activity', {
        user_uuid: profile.id,
        activity_type: 'account_deletion_failed',
        activity_description: 'Account deletion failed',
        activity_metadata: {
          error: deletionError.message
        }
      })

      return NextResponse.json(
        { error: 'Failed to delete account: ' + deletionError.message },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('Account deletion API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to get account deletion info/requirements
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

    // Get data that will be deleted
    const [
      { data: portfolios },
      { data: creditTransactions },
      { data: aiSessions },
      { data: activities },
      { data: notifications }
    ] = await Promise.all([
      supabase.from('portfolios').select('id', { count: 'exact' }).eq('user_id', profile.id),
      supabase.from('credit_transactions').select('id', { count: 'exact' }).eq('user_id', profile.id),
      supabase.from('ai_chat_sessions').select('id', { count: 'exact' }).eq('user_id', profile.id),
      supabase.from('user_activities').select('id', { count: 'exact' }).eq('user_id', profile.id),
      supabase.from('notifications').select('id', { count: 'exact' }).eq('user_id', profile.id)
    ])

    return NextResponse.json({
      user: {
        id: profile.id,
        email: session.user.email,
        full_name: profile.full_name,
        tier: profile.tier,
        created_at: profile.created_at
      },
      data_to_be_deleted: {
        portfolios: portfolios?.length || 0,
        credit_transactions: creditTransactions?.length || 0,
        ai_chat_sessions: aiSessions?.length || 0,
        user_activities: activities?.length || 0,
        notifications: notifications?.length || 0
      },
      deletion_requirements: {
        confirmation_text: 'DELETE MY ACCOUNT',
        warning: 'This action cannot be undone. All your data will be permanently deleted.',
        data_retention: 'Some anonymized analytics data may be retained for up to 90 days.'
      },
      success: true
    })

  } catch (error: any) {
    console.error('Account info error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}