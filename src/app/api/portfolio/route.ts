import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Request validation schemas
const createPortfolioSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  isDefault: z.boolean().optional().default(false)
})

const portfolioQuerySchema = z.object({
  includeHoldings: z.string().optional().transform(val => val === 'true'),
  limit: z.string().optional().transform(val => parseInt(val || '20')),
  offset: z.string().optional().transform(val => parseInt(val || '0'))
})

// GET /api/portfolio - Get user portfolios
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Auth error in portfolio GET:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const { includeHoldings, limit, offset } = portfolioQuerySchema.parse(Object.fromEntries(searchParams))

    let query = supabase
      .from('portfolios')
      .select(`
        *,
        ${includeHoldings ? 'portfolio_holdings(*)' : ''}
      `)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('is_default', { ascending: false })
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: portfolios, error } = await query

    if (error) {
      console.error('Portfolio query error:', error)
      
      // Return empty array on any error instead of 500
      return NextResponse.json({
        portfolios: [],
        pagination: { total: 0, limit, offset, hasMore: false },
        message: error.message?.includes('relation') ? 'Database is being initialized' : 'Unable to fetch portfolios'
      })
    }

    // Calculate total portfolio count for pagination
    const { count: totalCount } = await supabase
      .from('portfolios')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('deleted_at', null)

    return NextResponse.json({
      portfolios,
      pagination: {
        total: totalCount || 0,
        limit,
        offset,
        hasMore: offset + limit < (totalCount || 0)
      }
    })

  } catch (error) {
    console.error('Error fetching portfolios:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid query parameters',
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'Failed to fetch portfolios' 
    }, { status: 500 })
  }
}

// POST /api/portfolio - Create new portfolio
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Auth error in portfolio POST:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createPortfolioSchema.parse(body)

    // Get user's subscription tier to check portfolio limits
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    // Check current portfolio count
    const { count: portfolioCount } = await supabase
      .from('portfolios')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('deleted_at', null)

    // Define limits based on tier
    const limits = {
      free: 1,
      pro: 3,
      elite: 10
    }
    
    const maxPortfolios = limits[userData?.subscription_tier as keyof typeof limits] || 1
    
    if ((portfolioCount || 0) >= maxPortfolios) {
      return NextResponse.json({
        error: 'Portfolio limit reached',
        message: `Your ${userData?.subscription_tier || 'Free'} plan allows up to ${maxPortfolios} portfolios. You currently have ${portfolioCount}.`,
        currentCount: portfolioCount,
        maxAllowed: maxPortfolios,
        upgradeRequired: true
      }, { status: 403 })
    }

    // If this is set as default, unset other defaults first
    if (validatedData.isDefault) {
      await supabase
        .from('portfolios')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('is_default', true)
        .is('deleted_at', null)
    }

    // Create the new portfolio
    const { data: portfolio, error: createError } = await supabase
      .from('portfolios')
      .insert({
        user_id: user.id,
        name: validatedData.name,
        description: validatedData.description,
        is_default: validatedData.isDefault || (portfolioCount === 0), // First portfolio is default
        total_value_usd: 0,
        total_cost_usd: 0,
        last_updated: new Date().toISOString()
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating portfolio:', createError)
      return NextResponse.json({ error: 'Failed to create portfolio', details: createError.message }, { status: 500 })
    }

    return NextResponse.json(portfolio, { status: 201 })

  } catch (error) {
    console.error('Error creating portfolio:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid portfolio data',
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'Failed to create portfolio' 
    }, { status: 500 })
  }
}