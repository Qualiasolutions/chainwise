import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Request validation schemas
const updateHoldingSchema = z.object({
  amount: z.number().positive().optional(),
  averagePurchasePriceUsd: z.number().positive().optional()
})

// GET /api/portfolio/[id]/holdings/[holdingId] - Get specific holding
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; holdingId: string } }
) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify portfolio ownership and get holding
    const { data: holding, error: holdingError } = await supabase
      .from('portfolio_holdings')
      .select(`
        *,
        portfolios (
          id,
          name,
          user_id
        )
      `)
      .eq('id', params.holdingId)
      .eq('portfolio_id', params.id)
      .eq('portfolios.user_id', user.id)
      .single()

    if (holdingError || !holding) {
      return NextResponse.json({ error: 'Holding not found' }, { status: 404 })
    }

    return NextResponse.json(holding)

  } catch (error) {
    console.error('Error fetching holding:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch holding' 
    }, { status: 500 })
  }
}

// PUT /api/portfolio/[id]/holdings/[holdingId] - Update holding
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; holdingId: string } }
) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateHoldingSchema.parse(body)

    // Verify portfolio ownership and get holding
    const { data: existingHolding, error: holdingError } = await supabase
      .from('portfolio_holdings')
      .select('*')
      .eq('id', params.holdingId)
      .eq('portfolio_id', params.id)
      .single()

    if (holdingError || !existingHolding) {
      return NextResponse.json({ error: 'Holding not found' }, { status: 404 })
    }

    // Check portfolio ownership
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('user_id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Calculate updates
    const updatedData: any = {
      updated_at: new Date().toISOString()
    }

    if (validatedData.amount !== undefined) {
      updatedData.amount = validatedData.amount
      // Recalculate current value
      const currentPrice = existingHolding.current_price_usd || 0
      updatedData.current_value_usd = validatedData.amount * currentPrice
      // Recalculate P&L
      const costBasis = validatedData.amount * existingHolding.average_purchase_price_usd
      updatedData.profit_loss_usd = updatedData.current_value_usd - costBasis
      updatedData.profit_loss_percentage = costBasis > 0 ? ((updatedData.current_value_usd - costBasis) / costBasis) * 100 : 0
    }

    if (validatedData.averagePurchasePriceUsd !== undefined) {
      updatedData.average_purchase_price_usd = validatedData.averagePurchasePriceUsd
      // Recalculate P&L with new cost basis
      const amount = validatedData.amount ?? existingHolding.amount
      const currentPrice = existingHolding.current_price_usd || 0
      const currentValue = amount * currentPrice
      const costBasis = amount * validatedData.averagePurchasePriceUsd
      updatedData.current_value_usd = currentValue
      updatedData.profit_loss_usd = currentValue - costBasis
      updatedData.profit_loss_percentage = costBasis > 0 ? ((currentValue - costBasis) / costBasis) * 100 : 0
    }

    // Update holding
    const { data: holding, error: updateError } = await supabase
      .from('portfolio_holdings')
      .update(updatedData)
      .eq('id', params.holdingId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    // Use database function to update portfolio totals
    await supabase.rpc('update_portfolio_totals', { portfolio_id: params.id })

    // Log activity
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: user.id,
        action: 'holding_updated',
        entity_type: 'portfolio_holding',
        entity_id: holding.id,
        metadata: {
          portfolioId: params.id,
          cryptoId: holding.crypto_id,
          symbol: holding.symbol,
          changes: validatedData
        }
      })

    const result = holding

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error updating holding:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid holding data',
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'Failed to update holding' 
    }, { status: 500 })
  }
}

// DELETE /api/portfolio/[id]/holdings/[holdingId] - Remove holding
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; holdingId: string } }
) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify portfolio ownership and get holding
    const { data: existingHolding, error: holdingError } = await supabase
      .from('portfolio_holdings')
      .select('*')
      .eq('id', params.holdingId)
      .eq('portfolio_id', params.id)
      .single()

    if (holdingError || !existingHolding) {
      return NextResponse.json({ error: 'Holding not found' }, { status: 404 })
    }

    // Check portfolio ownership
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('user_id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Delete holding
    const { error: deleteError } = await supabase
      .from('portfolio_holdings')
      .delete()
      .eq('id', params.holdingId)

    if (deleteError) {
      throw deleteError
    }

    // Use database function to update portfolio totals
    await supabase.rpc('update_portfolio_totals', { portfolio_id: params.id })

    // Log activity
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: user.id,
        action: 'holding_removed',
        entity_type: 'portfolio_holding',
        entity_id: params.holdingId,
        metadata: {
          portfolioId: params.id,
          cryptoId: existingHolding.crypto_id,
          symbol: existingHolding.symbol,
          amount: existingHolding.amount
        }
      })

    return NextResponse.json({ 
      success: true,
      message: 'Holding removed successfully' 
    })

  } catch (error) {
    console.error('Error removing holding:', error)
    return NextResponse.json({ 
      error: 'Failed to remove holding' 
    }, { status: 500 })
  }
}