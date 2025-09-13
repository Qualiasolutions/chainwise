import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Request validation schemas
const updatePortfolioSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  isDefault: z.boolean().optional()
})

// GET /api/portfolio/[id] - Get specific portfolio with holdings
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

    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .select(`
        *,
        portfolio_holdings(*)
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (error || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Sort holdings by current_value_usd descending
    if (portfolio.portfolio_holdings) {
      portfolio.portfolio_holdings.sort((a: any, b: any) => (b.current_value_usd || 0) - (a.current_value_usd || 0))
    }

    return NextResponse.json(portfolio)

  } catch (error) {
    console.error('Error fetching portfolio:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch portfolio' 
    }, { status: 500 })
  }
}

// PUT /api/portfolio/[id] - Update portfolio
export async function PUT(
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
    const validatedData = updatePortfolioSchema.parse(body)

    // Check if portfolio exists and belongs to user
    const { data: existingPortfolio, error: checkError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (checkError || !existingPortfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // If setting as default, unset other defaults first
    if (validatedData.isDefault) {
      await supabase
        .from('portfolios')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('is_default', true)
        .is('deleted_at', null)
        .neq('id', params.id)
    }

    // Update the portfolio
    const updateData: any = {
      ...validatedData,
      updated_at: new Date().toISOString()
    }

    // Convert camelCase to snake_case for database
    if (validatedData.isDefault !== undefined) {
      updateData.is_default = validatedData.isDefault
      delete updateData.isDefault
    }

    const { data: updatedPortfolio, error: updateError } = await supabase
      .from('portfolios')
      .update(updateData)
      .eq('id', params.id)
      .select(`
        *,
        portfolio_holdings(*)
      `)
      .single()

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update portfolio' }, { status: 500 })
    }

    // Sort holdings by current_value_usd descending
    if (updatedPortfolio.portfolio_holdings) {
      updatedPortfolio.portfolio_holdings.sort((a: any, b: any) => (b.current_value_usd || 0) - (a.current_value_usd || 0))
    }

    // Log activity
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: user.id,
        action: 'portfolio_updated',
        entity_type: 'portfolio',
        entity_id: params.id,
        metadata: {
          changes: validatedData,
          portfolioName: updatedPortfolio.name
        }
      })

    return NextResponse.json(updatedPortfolio)

  } catch (error) {
    console.error('Error updating portfolio:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid portfolio data',
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'Failed to update portfolio' 
    }, { status: 500 })
  }
}

// DELETE /api/portfolio/[id] - Soft delete portfolio
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if portfolio exists and belongs to user
    const { data: existingPortfolio, error: checkError } = await supabase
      .from('portfolios')
      .select(`
        *,
        portfolio_holdings(*)
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (checkError || !existingPortfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Prevent deletion of default portfolio if it's the only one
    if (existingPortfolio.is_default) {
      const { count: portfolioCount } = await supabase
        .from('portfolios')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('deleted_at', null)

      if (portfolioCount === 1) {
        return NextResponse.json({ 
          error: 'Cannot delete the only portfolio' 
        }, { status: 400 })
      }
    }

    // Delete all holdings first (hard delete)
    await supabase
      .from('portfolio_holdings')
      .delete()
      .eq('portfolio_id', params.id)

    // Soft delete portfolio
    await supabase
      .from('portfolios')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id)

    // If this was the default portfolio, set another as default
    if (existingPortfolio.is_default) {
      const { data: nextPortfolio } = await supabase
        .from('portfolios')
        .select('id')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .neq('id', params.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

      if (nextPortfolio) {
        await supabase
          .from('portfolios')
          .update({ is_default: true })
          .eq('id', nextPortfolio.id)
      }
    }

    // Log activity
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: user.id,
        action: 'portfolio_deleted',
        entity_type: 'portfolio',
        entity_id: params.id,
        metadata: {
          portfolioName: existingPortfolio.name,
          holdingsCount: existingPortfolio.portfolio_holdings?.length || 0
        }
      })

    return NextResponse.json({ 
      success: true,
      message: 'Portfolio deleted successfully' 
    })

  } catch (error) {
    console.error('Error deleting portfolio:', error)
    return NextResponse.json({ 
      error: 'Failed to delete portfolio' 
    }, { status: 500 })
  }
}