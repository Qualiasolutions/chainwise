// Security Settings API Route
// GET /api/settings/security - Get user's security settings
// PUT /api/settings/security - Update security settings (2FA, notifications, etc.)

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

    // Get security settings
    const { data: securitySettings, error: securityError } = await supabase
      .from('account_security')
      .select('*')
      .eq('user_id', profile.id)
      .single()

    if (securityError && securityError.code !== 'PGRST116') {
      throw securityError
    }

    // Get recent security-related activities
    const { data: securityActivities } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', profile.id)
      .in('activity_type', ['login', 'password_change', 'security_update', 'session_revoked'])
      .order('created_at', { ascending: false })
      .limit(10)

    // Get connected accounts
    const { data: connectedAccounts, error: accountsError } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', profile.id)
      .order('connected_at', { ascending: false })

    if (accountsError) {
      throw accountsError
    }

    // Format the response
    const securityData = securitySettings || {
      two_factor_enabled: false,
      security_notifications: true,
      login_notifications: true,
      password_changed_at: profile.created_at,
      last_security_audit: profile.created_at
    }

    return NextResponse.json({
      security: {
        two_factor_enabled: securityData.two_factor_enabled,
        security_notifications: securityData.security_notifications,
        login_notifications: securityData.login_notifications,
        password_changed_at: securityData.password_changed_at,
        last_security_audit: securityData.last_security_audit,
        has_backup_codes: !!securityData.backup_codes?.length
      },
      connected_accounts: (connectedAccounts || []).map((account: any) => ({
        id: account.id,
        provider: account.provider,
        email: account.email,
        display_name: account.display_name,
        is_primary: account.is_primary,
        connected_at: account.connected_at,
        last_used: account.last_used
      })),
      recent_security_activities: (securityActivities || []).map((activity: any) => ({
        id: activity.id,
        type: activity.activity_type,
        description: activity.activity_description,
        created_at: activity.created_at,
        ip_address: activity.ip_address
      })),
      success: true
    })

  } catch (error: any) {
    console.error('Security settings GET error:', error)
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

    // Get request body
    const body = await request.json()
    const {
      two_factor_enabled,
      security_notifications,
      login_notifications,
      current_password,
      new_password
    } = body

    // Handle password change if requested
    if (current_password && new_password) {
      try {
        // Verify current password and update to new password
        const { error: passwordError } = await supabase.auth.updateUser({
          password: new_password
        })

        if (passwordError) {
          return NextResponse.json(
            { error: 'Failed to update password: ' + passwordError.message },
            { status: 400 }
          )
        }

        // Update password changed timestamp
        await supabase
          .from('account_security')
          .upsert({
            user_id: profile.id,
            password_changed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        // Log password change activity
        await supabase.rpc('log_user_activity', {
          user_uuid: profile.id,
          activity_type: 'password_change',
          activity_description: 'Password changed successfully'
        })
      } catch (error: any) {
        return NextResponse.json(
          { error: 'Password update failed: ' + error.message },
          { status: 400 }
        )
      }
    }

    // Update security settings using the database function
    const { data: updateResult, error: updateError } = await supabase
      .rpc('update_user_security_settings', {
        user_uuid: profile.id,
        enable_2fa: two_factor_enabled,
        security_notifications: security_notifications,
        login_notifications: login_notifications
      })

    if (updateError) {
      throw updateError
    }

    // Get updated security settings
    const { data: updatedSettings, error: fetchError } = await supabase
      .from('account_security')
      .select('*')
      .eq('user_id', profile.id)
      .single()

    if (fetchError) {
      throw fetchError
    }

    return NextResponse.json({
      message: 'Security settings updated successfully',
      security: {
        two_factor_enabled: updatedSettings.two_factor_enabled,
        security_notifications: updatedSettings.security_notifications,
        login_notifications: updatedSettings.login_notifications,
        password_changed_at: updatedSettings.password_changed_at,
        last_security_audit: updatedSettings.last_security_audit
      },
      success: true
    })

  } catch (error: any) {
    console.error('Security settings PUT error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST endpoint for enabling/disabling 2FA specifically
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

    const { action, totp_secret, backup_codes } = await request.json()

    if (action === 'enable_2fa') {
      // Enable 2FA with provided TOTP secret and backup codes
      const { error: updateError } = await supabase
        .from('account_security')
        .upsert({
          user_id: profile.id,
          two_factor_enabled: true,
          two_factor_secret: totp_secret, // Should be encrypted in real implementation
          backup_codes: backup_codes, // Should be encrypted in real implementation
          updated_at: new Date().toISOString()
        })

      if (updateError) {
        throw updateError
      }

      // Log 2FA enablement
      await supabase.rpc('log_user_activity', {
        user_uuid: profile.id,
        activity_type: 'security_update',
        activity_description: 'Two-factor authentication enabled'
      })

      return NextResponse.json({
        message: '2FA enabled successfully',
        two_factor_enabled: true,
        success: true
      })

    } else if (action === 'disable_2fa') {
      // Disable 2FA
      const { error: updateError } = await supabase
        .from('account_security')
        .update({
          two_factor_enabled: false,
          two_factor_secret: null,
          backup_codes: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', profile.id)

      if (updateError) {
        throw updateError
      }

      // Log 2FA disablement
      await supabase.rpc('log_user_activity', {
        user_uuid: profile.id,
        activity_type: 'security_update',
        activity_description: 'Two-factor authentication disabled'
      })

      return NextResponse.json({
        message: '2FA disabled successfully',
        two_factor_enabled: false,
        success: true
      })

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error: any) {
    console.error('2FA toggle error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}