import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Request validation schemas
const addHoldingSchema = z.object({
  cryptoId: z.string().min(1),
  symbol: z.string().min(1).max(10).toUpperCase(),
  name: z.string().min(1),
  amount: z.number().positive(),
  averagePurchasePriceUsd: z.number().positive(),
  firstPurchaseDate: z.string().datetime().optional().transform(val => val ? new Date(val).toISOString() : new Date().toISOString())
})

// GET /api/portfolio/[id]/holdings - Get portfolio holdings
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify portfolio ownership
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    const { data: holdings, error: holdingsError } = await supabase
      .from('portfolio_holdings')
      .select('*')
      .eq('portfolio_id', params.id)
      .order('market_value_usd', { ascending: false })

    if (holdingsError) {
      return NextResponse.json({ 
        error: 'Failed to fetch holdings' 
      }, { status: 500 })
    }

    return NextResponse.json(holdings || [])

  } catch (error) {
    console.error('Error fetching holdings:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch holdings' 
    }, { status: 500 })
  }
}

// POST /api/portfolio/[id]/holdings - Add new holding
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = addHoldingSchema.parse(body)

    // Verify portfolio ownership
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Check if holding already exists for this crypto
    const { data: existingHolding } = await supabase
      .from('portfolio_holdings')
      .select('*')
      .eq('portfolio_id', params.id)
      .eq('crypto_id', validatedData.cryptoId)
      .maybeSingle()

    let holding
    
    if (existingHolding) {
      // Update existing holding with average cost calculation
      const existingAmount = parseFloat(existingHolding.amount)
      const existingCost = existingAmount * parseFloat(existingHolding.average_purchase_price_usd || existingHolding.cost_basis_usd)
      const newCost = validatedData.amount * validatedData.averagePurchasePriceUsd
      const totalAmount = existingAmount + validatedData.amount
      const newAverageCost = (existingCost + newCost) / totalAmount
      const newCurrentValue = totalAmount * parseFloat(existingHolding.current_price_usd || newAverageCost.toString())

      const { data: updatedHolding, error: updateError } = await supabase
        .from('portfolio_holdings')
        .update({
          amount: totalAmount.toString(),
          average_purchase_price_usd: newAverageCost.toString(),
          cost_basis_usd: newAverageCost.toString(),
          current_value_usd: newCurrentValue.toString(),
          market_value_usd: newCurrentValue.toString(),
          updated_at: new Date().toISOString(),
          last_updated: new Date().toISOString()
        })
        .eq('id', existingHolding.id)
        .select()
        .single()

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update holding' }, { status: 500 })
      }
      
      holding = updatedHolding
    } else {
      // Create new holding
      const currentValueUsd = validatedData.amount * validatedData.averagePurchasePriceUsd
      
      const { data: newHolding, error: createError } = await supabase
        .from('portfolio_holdings')
        .insert({
          portfolio_id: params.id,
          crypto_id: validatedData.cryptoId,
          symbol: validatedData.symbol,
          name: validatedData.name,
          amount: validatedData.amount.toString(),
          cost_basis_usd: validatedData.averagePurchasePriceUsd.toString(),
          average_purchase_price_usd: validatedData.averagePurchasePriceUsd.toString(),
          current_price_usd: validatedData.averagePurchasePriceUsd.toString(),
          current_value_usd: currentValueUsd.toString(),
          market_value_usd: currentValueUsd.toString(),
          profit_loss_usd: '0',
          profit_loss_percentage: '0',
          first_purchase_date: validatedData.firstPurchaseDate,
          last_updated: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        return NextResponse.json({ error: 'Failed to create holding' }, { status: 500 })
      }
      
      holding = newHolding
    }

    // Update portfolio totals using RPC function
    try {
      await supabase.rpc('update_portfolio_totals', {
        portfolio_id: params.id
      })
    } catch (rpcError) {
      console.warn('RPC function failed, updating manually:', rpcError)
      // Manual update as fallback
      const { data: allHoldings } = await supabase
        .from('portfolio_holdings')
        .select('amount, average_purchase_price_usd, current_value_usd')
        .eq('portfolio_id', params.id)

      if (allHoldings) {
        const totalValue = allHoldings.reduce((sum, h) => sum + parseFloat(h.current_value_usd || '0'), 0)
        const totalCost = allHoldings.reduce((sum, h) => sum + (parseFloat(h.amount) * parseFloat(h.average_purchase_price_usd || '0')), 0)
        
        await supabase
          .from('portfolios')
          .update({
            total_value_usd: totalValue,
            total_cost_usd: totalCost,
            last_updated: new Date().toISOString()
          })
          .eq('id', params.id)
      }
    }

    // Log activity
    try {
      await supabase
        .from('user_activity_logs')
        .insert({
          user_id: user.id,
          action: existingHolding ? 'holding_updated' : 'holding_added',
          entity_type: 'portfolio_holding',
          entity_id: holding.id,
          metadata: {
            portfolioId: params.id,
            cryptoId: validatedData.cryptoId,
            symbol: validatedData.symbol,
            amount: validatedData.amount,
            price: validatedData.averagePurchasePriceUsd
          }
        })
    } catch (logError) {
      console.warn('Failed to log activity:', logError)
      // Don't fail the request if logging fails
    }

    return NextResponse.json(holding, { status: 201 })

  } catch (error) {
    console.error('Error adding holding:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid holding data',
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'Failed to add holding' 
    }, { status: 500 })
  }
}