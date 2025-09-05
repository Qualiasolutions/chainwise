import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    // Build query
    let query = supabase
      .from('premium_features')
      .select('*')
      .eq('is_active', true)
    
    if (category) {
      query = query.eq('category', category)
    }
    
    const { data: features, error } = await query.order('name')
    
    if (error) {
      console.error('Error fetching premium features:', error)
      return NextResponse.json(
        { error: 'Failed to fetch premium features' },
        { status: 500 }
      )
    }

    // Group features by category
    const categorized = features?.reduce((acc, feature) => {
      const cat = feature.category
      if (!acc[cat]) {
        acc[cat] = []
      }
      acc[cat].push(feature)
      return acc
    }, {} as Record<string, typeof features>) || {}

    return NextResponse.json({
      features: features || [],
      categorized,
      success: true
    })
  } catch (error) {
    console.error('Error in premium features API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}