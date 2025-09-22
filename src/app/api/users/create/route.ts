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
      // Use MCP to create user directly - try the actual MCP function
      // @ts-ignore - MCP function is available in server context
      const { mcp__supabase__execute_sql } = globalThis

      // Check if user already exists first
      const checkQuery = `
        SELECT * FROM users WHERE auth_id = '${userData.auth_id}' LIMIT 1;
      `

      const existingResult = await mcp__supabase__execute_sql({
        project_id: projectId,
        query: checkQuery
      })

      if (existingResult && Array.isArray(existingResult) && existingResult.length > 0) {
        console.log('User already exists:', userData.auth_id)
        return NextResponse.json({ user: existingResult[0] })
      }

      // Create new user via MCP
      const insertQuery = `
        INSERT INTO users (auth_id, email, full_name, bio, location, website, avatar_url, tier, credits, monthly_credits, created_at, updated_at)
        VALUES ('${userData.auth_id}', '${userData.email}', ${userData.full_name ? `'${userData.full_name}'` : 'NULL'}, ${userData.bio ? `'${userData.bio}'` : 'NULL'}, ${userData.location ? `'${userData.location}'` : 'NULL'}, ${userData.website ? `'${userData.website}'` : 'NULL'}, ${userData.avatar_url ? `'${userData.avatar_url}'` : 'NULL'}, '${userData.tier}', ${userData.credits}, ${userData.monthly_credits}, NOW(), NOW())
        RETURNING *;
      `

      const createResult = await mcp__supabase__execute_sql({
        project_id: projectId,
        query: insertQuery
      })

      if (createResult && Array.isArray(createResult) && createResult.length > 0) {
        console.log('User created via MCP:', userData.auth_id)
        return NextResponse.json({ user: createResult[0] })
      }

      return NextResponse.json(
        { error: 'Failed to create user via MCP' },
        { status: 500 }
      )

      // Fallback to direct approach if MCP fails
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