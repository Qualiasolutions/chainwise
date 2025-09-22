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

    const projectId = 'vmnuzwoocympormyizsc'

    try {
      // Import MCP function for Supabase operations
      const { mcp__supabase__execute_sql } = await import('@/lib/mcp-tools')

      // First, check if user already exists
      const checkQuery = `
        SELECT * FROM users WHERE auth_id = $1 LIMIT 1;
      `

      let existingResult
      try {
        existingResult = await mcp__supabase__execute_sql({
          project_id: projectId,
          query: `SELECT * FROM users WHERE auth_id = '${userData.auth_id}' LIMIT 1`
        })

        if (existingResult && Array.isArray(existingResult) && existingResult.length > 0) {
          console.log('User already exists:', userData.auth_id)
          return NextResponse.json({ user: existingResult[0] })
        }
      } catch (checkError) {
        console.log('Check user error (proceeding with creation):', checkError)
      }

      // Create new user using MCP execute_sql
      const insertQuery = `
        INSERT INTO users (auth_id, email, full_name, bio, location, website, avatar_url, tier, credits, monthly_credits, created_at, updated_at)
        VALUES (
          '${userData.auth_id}',
          '${userData.email}',
          ${userData.full_name ? `'${userData.full_name.replace(/'/g, "''")}'` : 'NULL'},
          ${userData.bio ? `'${userData.bio.replace(/'/g, "''")}'` : 'NULL'},
          ${userData.location ? `'${userData.location.replace(/'/g, "''")}'` : 'NULL'},
          ${userData.website ? `'${userData.website}'` : 'NULL'},
          ${userData.avatar_url ? `'${userData.avatar_url}'` : 'NULL'},
          '${userData.tier || 'free'}',
          ${userData.credits || 3},
          ${userData.monthly_credits || 3},
          NOW(),
          NOW()
        )
        RETURNING *;
      `

      const createResult = await mcp__supabase__execute_sql({
        project_id: projectId,
        query: insertQuery
      })

      if (createResult && Array.isArray(createResult) && createResult.length > 0) {
        console.log('User created successfully via MCP:', userData.auth_id)
        return NextResponse.json({ user: createResult[0] })
      }

      // If creation failed but no error thrown, try to fetch again (race condition)
      try {
        const raceResult = await mcp__supabase__execute_sql({
          project_id: projectId,
          query: `SELECT * FROM users WHERE auth_id = '${userData.auth_id}' LIMIT 1`
        })

        if (raceResult && Array.isArray(raceResult) && raceResult.length > 0) {
          console.log('Found user after race condition:', userData.auth_id)
          return NextResponse.json({ user: raceResult[0] })
        }
      } catch (raceError) {
        console.error('Race condition check failed:', raceError)
      }

      return NextResponse.json(
        { error: 'Failed to create user via MCP' },
        { status: 500 }
      )

    } catch (mcpError: any) {
      console.error('MCP operation failed:', mcpError)

      // Check if it's a duplicate key error
      if (mcpError.message && mcpError.message.includes('duplicate')) {
        try {
          // Try to fetch the existing user
          const { mcp__supabase__execute_sql } = await import('@/lib/mcp-tools')
          const existingResult = await mcp__supabase__execute_sql({
            project_id: projectId,
            query: `SELECT * FROM users WHERE auth_id = '${userData.auth_id}' LIMIT 1`
          })

          if (existingResult && Array.isArray(existingResult) && existingResult.length > 0) {
            console.log('Found existing user after duplicate error:', userData.auth_id)
            return NextResponse.json({ user: existingResult[0] })
          }
        } catch (fetchError) {
          console.error('Failed to fetch after duplicate error:', fetchError)
        }
      }

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