import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createClient()
    
    // Fetch active credit packs
    const { data: packs, error } = await supabase
      .from('credit_purchase_packs')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    
    if (error) {
      console.error('Error fetching credit packs:', error)
      return NextResponse.json(
        { error: 'Failed to fetch credit packs' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      packs: packs || [],
      success: true
    })
  } catch (error) {
    console.error('Error in credit packs API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}