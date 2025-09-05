import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PortfolioUpdateService } from '@/lib/portfolio-update-service'

// POST /api/portfolio/update-all - Update all portfolios with latest prices
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`Starting portfolio update for user: ${user.id}`)

    // Update user's portfolios
    const results = await PortfolioUpdateService.updateUserPortfolios(user.id)

    return NextResponse.json({
      success: true,
      message: `Updated ${results.success} portfolios successfully`,
      details: results
    })

  } catch (error) {
    console.error('Error updating portfolios:', error)
    return NextResponse.json({ 
      error: 'Failed to update portfolios',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET /api/portfolio/update-all - Get update system health check
export async function GET() {
  try {
    const healthCheck = await PortfolioUpdateService.healthCheck()
    
    const statusCode = healthCheck.status === 'error' ? 503 : 200
    
    return NextResponse.json({
      ...healthCheck,
      timestamp: new Date()
    }, { status: statusCode })

  } catch (error) {
    console.error('Error checking portfolio update health:', error)
    return NextResponse.json({ 
      status: 'error',
      error: 'Health check failed',
      timestamp: new Date()
    }, { status: 500 })
  }
}