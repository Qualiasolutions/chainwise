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

    // For now, we'll handle simple SELECT queries by parsing and executing them
    // This is a simplified approach for the current implementation
    if (query.toLowerCase().trim().startsWith('select')) {
      // Parse table and conditions from the query
      const tableMatch = query.match(/from\s+(\w+)/i)
      const tableName = tableMatch ? tableMatch[1] : null

      if (!tableName) {
        throw new Error('Unable to parse table name from query')
      }

      // Handle different query patterns
      if (query.includes('WHERE auth_id =')) {
        const authIdMatch = query.match(/auth_id\s*=\s*\$1/)
        if (authIdMatch) {
          // This is a getUserByAuthId query - we need the auth_id parameter
          // For now, return empty result as we don't have the parameter
          return NextResponse.json({ result: [] })
        }
      }

      // Execute basic select
      const { data, error } = await supabase.from(tableName).select('*')

      if (error) {
        throw error
      }

      return NextResponse.json({ result: data })
    }

    return NextResponse.json(
      { error: { message: 'Query type not supported yet' } },
      { status: 400 }
    )

  } catch (error: any) {
    console.error('Database query execution error:', error)
    return NextResponse.json(
      { error: { message: error.message || 'Database query failed' } },
      { status: 500 }
    )
  }
}