import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const querySchema = z.object({
  page: z.string().optional().transform(val => parseInt(val || '1')),
  limit: z.string().optional().transform(val => parseInt(val || '20')),
  type: z.string().optional(), // Filter by transaction type
})

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const { page, limit, type } = querySchema.parse(Object.fromEntries(searchParams))

    const offset = (page - 1) * limit
    
    // Build query
    let query = supabase
      .from('credit_transactions')
      .select(`
        id,
        transaction_type,
        amount,
        feature_used,
        description,
        created_at,
        metadata
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Add type filter if provided
    if (type) {
      query = query.eq('transaction_type', type)
    }

    const { data: transactions, error, count } = await query

    if (error) {
      console.error('Error fetching credit history:', error)
      return NextResponse.json(
        { error: 'Failed to fetch credit history' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching credit history:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid query parameters',
        details: error.errors 
      }, { status: 400 })
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}