// Connected Accounts API Route
// GET /api/settings/connected-accounts - Get user's connected social accounts
// DELETE /api/settings/connected-accounts - Disconnect a social account

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { mcpSupabase } from '@/lib/supabase/mcp-helpers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const profile = await mcpSupabase.getUserByAuthId(session.user.id)

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get connected accounts
    const { data: connectedAccounts, error: accountsError } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', profile.id)
      .order('connected_at', { ascending: false })

    if (accountsError) {
      throw accountsError
    }

    return NextResponse.json({
      success: true,
      accounts: (connectedAccounts || []).map((account: any) => ({
        id: account.id,
        provider: account.provider,
        email: account.email,
        display_name: account.display_name,
        avatar_url: account.avatar_url,
        is_primary: account.is_primary,
        connected_at: account.connected_at,
        last_used: account.last_used
      }))
    })

  } catch (error: any) {
    console.error('Connected accounts GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch connected accounts' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const profile = await mcpSupabase.getUserByAuthId(session.user.id)

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const { account_id, provider } = await request.json()

    if (!account_id && !provider) {
      return NextResponse.json(
        { error: 'Account ID or provider is required' },
        { status: 400 }
      )
    }

    // Check if this is the primary account
    const { data: accountToDelete } = await supabase
      .from('connected_accounts')
      .select('is_primary, provider')
      .eq('id', account_id)
      .eq('user_id', profile.id)
      .single()

    if (accountToDelete?.is_primary) {
      // Count total connected accounts
      const { count } = await supabase
        .from('connected_accounts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profile.id)

      if (count && count <= 1) {
        return NextResponse.json(
          { error: 'Cannot disconnect your only login method. Please add another account first.' },
          { status: 400 }
        )
      }
    }

    // Delete the connected account
    const { error: deleteError } = await supabase
      .from('connected_accounts')
      .delete()
      .eq('id', account_id)
      .eq('user_id', profile.id)

    if (deleteError) {
      throw deleteError
    }

    // Log the activity
    await supabase.rpc('log_user_activity', {
      user_uuid: profile.id,
      activity_type: 'security_update',
      activity_description: `Disconnected ${accountToDelete?.provider || 'social'} account`
    })

    return NextResponse.json({
      success: true,
      message: 'Account disconnected successfully'
    })

  } catch (error: any) {
    console.error('Connected accounts DELETE error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to disconnect account' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const profile = await mcpSupabase.getUserByAuthId(session.user.id)

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const { provider } = await request.json()

    if (!provider) {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 })
    }

    // Validate provider
    const validProviders = ['google', 'github', 'twitter', 'discord']
    if (!validProviders.includes(provider.toLowerCase())) {
      return NextResponse.json(
        { error: `Invalid provider. Must be one of: ${validProviders.join(', ')}` },
        { status: 400 }
      )
    }

    // Initiate OAuth flow with Supabase Auth
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/settings/account?connected=${provider}`,
        scopes: 'email profile'
      }
    })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      oauth_url: data.url,
      message: 'Redirecting to OAuth provider...'
    })

  } catch (error: any) {
    console.error('Connected accounts POST error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to initiate account connection' },
      { status: 500 }
    )
  }
}
