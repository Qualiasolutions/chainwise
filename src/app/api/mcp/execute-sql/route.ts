import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { project_id, query } = await request.json()

    if (!project_id || !query) {
      return NextResponse.json(
        { error: { message: 'Missing project_id or query' } },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: { message: 'Supabase environment variables not configured' } },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Use direct SQL execution via rpc for more complex queries
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_query: query
    })

    if (error) {
      // If the RPC doesn't exist, try direct SQL execution
      try {
        // Parse and execute manually for basic operations
        const cleanQuery = query.trim()

        if (cleanQuery.toLowerCase().startsWith('select')) {
          // For SELECT queries, try to parse and execute using Supabase client
          const result = await executeSelectQuery(supabase, cleanQuery)
          return NextResponse.json({ result })
        } else if (cleanQuery.toLowerCase().startsWith('insert')) {
          // For INSERT queries, try to parse and execute using Supabase client
          const result = await executeInsertQuery(supabase, cleanQuery)
          return NextResponse.json({ result })
        }

        throw new Error(`Unsupported query type: ${cleanQuery.substring(0, 20)}...`)
      } catch (fallbackError: any) {
        throw new Error(error.message || fallbackError.message)
      }
    }

    return NextResponse.json({ result: data })

  } catch (error: any) {
    console.error('Database query execution error:', error)
    return NextResponse.json(
      { error: { message: error.message || 'Database query failed' } },
      { status: 500 }
    )
  }
}

// Helper function to execute SELECT queries
async function executeSelectQuery(supabase: any, query: string) {
  const tableMatch = query.match(/from\s+(\w+)/i)
  const tableName = tableMatch ? tableMatch[1] : null

  if (!tableName) {
    throw new Error('Unable to parse table name from SELECT query')
  }

  // Parse WHERE conditions
  if (query.includes('WHERE auth_id =')) {
    const authIdMatch = query.match(/auth_id\s*=\s*'([^']+)'/i)
    if (authIdMatch) {
      const authId = authIdMatch[1]
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('auth_id', authId)
        .single()

      if (error && error.code === 'PGRST116') {
        return []
      } else if (error) {
        throw error
      }
      return data ? [data] : []
    }
  }

  // Default select all
  const { data, error } = await supabase.from(tableName).select('*')
  if (error) throw error
  return data
}

// Helper function to execute INSERT queries
async function executeInsertQuery(supabase: any, query: string) {
  // Parse INSERT INTO users (...) VALUES (...) RETURNING *
  const tableMatch = query.match(/insert\s+into\s+(\w+)/i)
  const tableName = tableMatch ? tableMatch[1] : null

  if (!tableName || tableName !== 'users') {
    throw new Error('Only INSERT into users table is supported')
  }

  // Extract values - this is a simplified parser
  const valuesMatch = query.match(/VALUES\s*\(\s*([^)]+)\s*\)/i)
  if (!valuesMatch) {
    throw new Error('Unable to parse VALUES from INSERT query')
  }

  // Parse the values
  const valuesStr = valuesMatch[1]
  const values = valuesStr.split(',').map(v => {
    const trimmed = v.trim()
    if (trimmed === 'NULL') return null
    if (trimmed === 'NOW()') return new Date().toISOString()
    if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
      return trimmed.slice(1, -1)
    }
    if (/^\d+$/.test(trimmed)) return parseInt(trimmed)
    return trimmed
  })

  // Map to user object (assuming standard user fields order)
  const userData = {
    auth_id: values[0],
    email: values[1],
    full_name: values[2],
    bio: values[3],
    location: values[4],
    website: values[5],
    avatar_url: values[6],
    tier: values[7] || 'free',
    credits: values[8] || 3,
    monthly_credits: values[9] || 3
  }

  const { data, error } = await supabase
    .from('users')
    .insert(userData)
    .select()
    .single()

  if (error) throw error
  return [data]
}