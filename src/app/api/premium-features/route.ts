import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user's current tier
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('subscription_tier, credits_balance')
      .eq('id', user.id)
      .single()
    
    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get all active premium features
    const { data: features, error: featuresError } = await supabase
      .from('premium_features')
      .select('*')
      .eq('is_active', true)
      .order('category')
      .order('credit_cost')

    if (featuresError) {
      console.error('Error fetching premium features:', featuresError)
      return NextResponse.json(
        { error: 'Failed to fetch features' },
        { status: 500 }
      )
    }

    // Group features by category
    const categorizedFeatures = features?.reduce((acc: any, feature) => {
      const category = feature.category || 'other'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(feature)
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      user: {
        tier: userData.subscription_tier,
        credits: userData.credits_balance
      },
      features: categorizedFeatures,
      totalFeatures: features?.length || 0
    })
  } catch (error) {
    console.error('Error fetching premium features:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}