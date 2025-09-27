// Update Portfolio Recommendations API Route
// POST /api/portfolio/[id]/update-recommendations - Trigger recommendation updates

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'

interface RouteParams {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
    const portfolioId = (await params).id

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Verify portfolio ownership
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('id, user_id')
      .eq('id', portfolioId)
      .eq('user_id', profile.id)
      .single()

    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Call the update_portfolio_recommendations function
    const { error: updateError } = await supabase.rpc('update_portfolio_recommendations', {
      portfolio_uuid: portfolioId
    })

    if (updateError) {
      console.error('Recommendation update error:', updateError)
      return NextResponse.json({ error: 'Failed to update recommendations' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Portfolio recommendations updated successfully'
    })

  } catch (error) {
    console.error('Update recommendations API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}