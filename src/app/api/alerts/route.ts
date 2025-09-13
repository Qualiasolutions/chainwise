import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Request validation schemas
const createAlertSchema = z.object({
  cryptoId: z.string().min(1),
  cryptoSymbol: z.string().min(1),
  targetPrice: z.number().positive(),
  condition: z.enum(['above', 'below']),
  message: z.string().optional()
})

const alertQuerySchema = z.object({
  active: z.string().optional().transform(val => val === 'true'),
  limit: z.string().optional().transform(val => parseInt(val || '20')),
  offset: z.string().optional().transform(val => parseInt(val || '0'))
})

// GET /api/alerts - Get user alerts
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const { active, limit, offset } = alertQuerySchema.parse(Object.fromEntries(searchParams))

    let query = supabase
      .from('user_alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (active !== undefined) {
      query = query.eq('is_active', active)
    }

    const { data: alerts, error } = await query

    if (error) {
      console.error('Error fetching alerts:', error)
      return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
    }

    // Calculate total alert count for pagination
    let countQuery = supabase
      .from('user_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (active !== undefined) {
      countQuery = countQuery.eq('is_active', active)
    }

    const { count: totalCount } = await countQuery

    return NextResponse.json({
      alerts,
      pagination: {
        total: totalCount || 0,
        limit,
        offset,
        hasMore: offset + limit < (totalCount || 0)
      }
    })

  } catch (error) {
    console.error('Error fetching alerts:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid query parameters',
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'Failed to fetch alerts' 
    }, { status: 500 })
  }
}

// POST /api/alerts - Create new alert
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createAlertSchema.parse(body)

    // Check user's subscription tier for alert limits
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    // Check current active alert count
    const { count: alertCount } = await supabase
      .from('user_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_active', true)

    // Define limits based on tier
    const limits = {
      free: 3,
      pro: 10,
      elite: 50
    }
    
    const maxAlerts = limits[userData?.subscription_tier as keyof typeof limits] || 3
    
    if ((alertCount || 0) >= maxAlerts) {
      return NextResponse.json({
        error: 'Alert limit reached',
        message: `Your ${userData?.subscription_tier || 'Free'} plan allows up to ${maxAlerts} active alerts. You currently have ${alertCount}.`,
        currentCount: alertCount,
        maxAllowed: maxAlerts,
        upgradeRequired: true
      }, { status: 403 })
    }

    // Create the new alert
    const { data: alert, error: createError } = await supabase
      .from('user_alerts')
      .insert({
        user_id: user.id,
        crypto_id: validatedData.cryptoId,
        crypto_symbol: validatedData.cryptoSymbol,
        target_price: validatedData.targetPrice,
        condition: validatedData.condition,
        message: validatedData.message || `Price alert for ${validatedData.cryptoSymbol}`,
        is_active: true
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating alert:', createError)
      return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 })
    }

    return NextResponse.json(alert, { status: 201 })

  } catch (error) {
    console.error('Error creating alert:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid alert data',
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'Failed to create alert' 
    }, { status: 500 })
  }
}