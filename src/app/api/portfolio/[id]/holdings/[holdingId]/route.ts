// Individual Portfolio Holding API Routes
// GET /api/portfolio/[id]/holdings/[holdingId] - Get specific holding
// PUT /api/portfolio/[id]/holdings/[holdingId] - Update holding
// DELETE /api/portfolio/[id]/holdings/[holdingId] - Remove holding

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { cryptoAPI } from '@/lib/crypto-api'

interface RouteParams {
  params: {
    id: string
    holdingId: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { id: portfolioId, holdingId } = params

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const { data: holding, error } = await supabase
      .from('portfolio_holdings')
      .select(`
        *,
        portfolio:portfolios!inner(
          id,
          user_id,
          name
        )
      `)
      .eq('id', holdingId)
      .eq('portfolio.user_id', profile.id)
      .eq('portfolio_id', portfolioId)
      .single()

    if (error || !holding) {
      return NextResponse.json({ error: 'Holding not found' }, { status: 404 })
    }

    // Get current price and calculate metrics
    try {
      const cryptoData = await cryptoAPI.getCrypto(holding.symbol.toLowerCase())
      const currentPrice = cryptoData?.current_price || holding.current_price || holding.purchase_price

      const currentValue = holding.amount * currentPrice
      const totalPnL = currentValue - (holding.amount * holding.purchase_price)
      const pnlPercentage = holding.purchase_price > 0
        ? (totalPnL / (holding.amount * holding.purchase_price)) * 100
        : 0

      const enrichedHolding = {
        ...holding,
        current_price: currentPrice,
        currentValue,
        totalPnL,
        pnlPercentage,
        priceChange24h: cryptoData?.price_change_percentage_24h || 0
      }

      return NextResponse.json({
        holding: enrichedHolding,
        success: true
      })

    } catch (error) {
      console.warn(`Failed to get current price for ${holding.symbol}:`, error)

      // Fallback to stored data
      const currentPrice = holding.current_price || holding.purchase_price
      const currentValue = holding.amount * currentPrice
      const totalPnL = currentValue - (holding.amount * holding.purchase_price)
      const pnlPercentage = holding.purchase_price > 0
        ? (totalPnL / (holding.amount * holding.purchase_price)) * 100
        : 0

      const enrichedHolding = {
        ...holding,
        current_price: currentPrice,
        currentValue,
        totalPnL,
        pnlPercentage,
        priceChange24h: 0
      }

      return NextResponse.json({
        holding: enrichedHolding,
        success: true
      })
    }

  } catch (error) {
    console.error('Get holding API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { id: portfolioId, holdingId } = params

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { amount, purchasePrice, purchaseDate } = body

    // Validation
    if (amount !== undefined && amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }

    if (purchasePrice !== undefined && purchasePrice <= 0) {
      return NextResponse.json({ error: 'Purchase price must be greater than 0' }, { status: 400 })
    }

    // Verify ownership and get current holding
    const { data: currentHolding } = await supabase
      .from('portfolio_holdings')
      .select(`
        *,
        portfolio:portfolios!inner(
          id,
          user_id
        )
      `)
      .eq('id', holdingId)
      .eq('portfolio.user_id', profile.id)
      .eq('portfolio_id', portfolioId)
      .single()

    if (!currentHolding) {
      return NextResponse.json({ error: 'Holding not found' }, { status: 404 })
    }

    // Get current price for updated calculations
    let currentPrice = currentHolding.current_price
    try {
      const cryptoData = await cryptoAPI.getCrypto(currentHolding.symbol.toLowerCase())
      currentPrice = cryptoData?.current_price || currentPrice
    } catch (error) {
      console.warn(`Failed to get current price for ${currentHolding.symbol}:`, error)
    }

    // Build update object
    const updates: Record<string, unknown> = {
      current_price: currentPrice
    }

    if (amount !== undefined) updates.amount = parseFloat(amount)
    if (purchasePrice !== undefined) updates.purchase_price = parseFloat(purchasePrice)
    if (purchaseDate !== undefined) updates.purchase_date = new Date(purchaseDate).toISOString()

    const { data: updatedHolding, error } = await supabase
      .from('portfolio_holdings')
      .update(updates)
      .eq('id', holdingId)
      .select()
      .single()

    if (error) {
      console.error('Holding update error:', error)
      return NextResponse.json({ error: 'Failed to update holding' }, { status: 500 })
    }

    // Calculate metrics for updated holding
    const newAmount = updatedHolding.amount
    const newPurchasePrice = updatedHolding.purchase_price
    const newCurrentPrice = updatedHolding.current_price || newPurchasePrice

    const currentValue = newAmount * newCurrentPrice
    const totalPnL = currentValue - (newAmount * newPurchasePrice)
    const pnlPercentage = newPurchasePrice > 0
      ? (totalPnL / (newAmount * newPurchasePrice)) * 100
      : 0

    const enrichedHolding = {
      ...updatedHolding,
      currentValue,
      totalPnL,
      pnlPercentage
    }

    return NextResponse.json({
      holding: enrichedHolding,
      success: true
    })

  } catch (error) {
    console.error('Update holding API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { id: portfolioId, holdingId } = params

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Verify ownership before deletion
    const { data: holding } = await supabase
      .from('portfolio_holdings')
      .select(`
        id,
        symbol,
        portfolio:portfolios!inner(
          id,
          user_id
        )
      `)
      .eq('id', holdingId)
      .eq('portfolio.user_id', profile.id)
      .eq('portfolio_id', portfolioId)
      .single()

    if (!holding) {
      return NextResponse.json({ error: 'Holding not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('portfolio_holdings')
      .delete()
      .eq('id', holdingId)

    if (error) {
      console.error('Holding deletion error:', error)
      return NextResponse.json({ error: 'Failed to delete holding' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `${holding.symbol.toUpperCase()} holding removed successfully`
    })

  } catch (error) {
    console.error('Delete holding API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}