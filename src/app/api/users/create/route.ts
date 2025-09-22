import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userData } = await request.json()

    if (!userData) {
      return NextResponse.json(
        { error: 'Missing userData' },
        { status: 400 }
      )
    }

    // Use MCP for user creation to bypass RLS restrictions
    const projectId = 'vmnuzwoocympormyizsc'

    try {
      // Use service role to bypass RLS for user creation
      const { createClient } = await import('@supabase/supabase-js')

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json(
          { error: 'Supabase environment variables not configured' },
          { status: 500 }
        )
      }

      // Use service role key to bypass RLS for user creation
      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      // First, try to find existing user
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', userData.auth_id)
        .single()

      if (existingUser) {
        console.log('User already exists:', existingUser.auth_id)
        return NextResponse.json({ user: existingUser })
      }

      // If no existing user, create new one
      const { data, error } = await supabase
        .from('users')
        .insert({
          ...userData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Database insert error:', error)

        // If still failing due to race condition, try to fetch again
        if (error.message?.includes('duplicate') || error.code === '23505') {
          console.log('Race condition detected, fetching existing user...')

          const { data: raceUser, error: raceError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', userData.auth_id)
            .single()

          if (!raceError && raceUser) {
            console.log('Found user after race condition:', raceUser.auth_id)
            return NextResponse.json({ user: raceUser })
          }
        }

        return NextResponse.json(
          { error: `Failed to create user: ${error.message}` },
          { status: 500 }
        )
      }

      console.log('User upserted successfully:', data.auth_id)
      return NextResponse.json({ user: data })
    } catch (mcpError) {
      console.error('Database operation failed:', mcpError)
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}