// Email Existence Check API Route
// GET /api/auth/check-email?email=user@example.com
// Returns whether an email is already registered

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 })
    }

    // Use service role client to check auth.users table
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Check if email exists in auth.users table
    const { data: authUsers, error: authError } = await supabase
      .from('auth.users')
      .select('email')
      .eq('email', email.toLowerCase())
      .limit(1)

    if (authError) {
      console.error('Error checking auth.users:', authError)
      return NextResponse.json({ error: 'Failed to check email' }, { status: 500 })
    }

    // Check if email exists in custom users table as backup
    const { data: customUsers, error: customError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email.toLowerCase())
      .limit(1)

    if (customError) {
      console.error('Error checking users table:', customError)
      // Don't fail on custom users check, auth.users is the source of truth
    }

    const emailExists = (authUsers && authUsers.length > 0) || (customUsers && customUsers.length > 0)

    return NextResponse.json({
      exists: emailExists,
      message: emailExists ? 'Email is already registered' : 'Email is available'
    })

  } catch (error) {
    console.error('Email check API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}