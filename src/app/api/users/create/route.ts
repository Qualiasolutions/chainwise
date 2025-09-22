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
      // Use direct SQL insert to bypass RLS policies for user creation
      const insertQuery = `
        INSERT INTO users (auth_id, email, full_name, bio, location, website, avatar_url, tier, credits, monthly_credits)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *;
      `

      // For now, we'll use a direct approach since we need to bypass RLS
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

      // Use PostgreSQL UPSERT functionality to handle duplicates gracefully
      const { data, error } = await supabase
        .from('users')
        .upsert(userData, {
          onConflict: 'auth_id',
          ignoreDuplicates: false
        })
        .select()
        .single()

      if (error) {
        console.error('Database upsert error:', error)

        // If upsert fails, try to get the existing user
        if (error.message?.includes('duplicate') || error.code === '23505') {
          console.log('Duplicate key detected, fetching existing user...')

          const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', userData.auth_id)
            .single()

          if (!fetchError && existingUser) {
            console.log('Found existing user:', existingUser.auth_id)
            return NextResponse.json({ user: existingUser })
          }
        }

        return NextResponse.json(
          { error: error.message },
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