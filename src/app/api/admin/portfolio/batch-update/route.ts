import { NextRequest, NextResponse } from 'next/server'
import { PortfolioUpdateService } from '@/lib/portfolio-update-service'

// POST /api/admin/portfolio/batch-update - Batch update all portfolios (for cron jobs)
export async function POST(request: NextRequest) {
  try {
    // Check for admin authorization header (for cron jobs/background services)
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.ADMIN_API_KEY || 'admin-secret-key'
    
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Starting batch portfolio update...')

    // Use batch update for efficiency
    const results = await PortfolioUpdateService.batchUpdatePortfolioPrices()

    console.log(`Batch update completed: ${results.updatedPortfolios} portfolios, ${results.updatedHoldings} holdings updated`)

    if (results.errors.length > 0) {
      console.warn('Batch update completed with errors:', results.errors)
    }

    return NextResponse.json({
      success: true,
      message: 'Batch update completed',
      results,
      timestamp: new Date()
    })

  } catch (error) {
    console.error('Error in batch portfolio update:', error)
    return NextResponse.json({ 
      error: 'Batch update failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 })
  }
}

// GET /api/admin/portfolio/batch-update - Health check for batch update system
export async function GET(request: NextRequest) {
  try {
    // Check for admin authorization header
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.ADMIN_API_KEY || 'admin-secret-key'
    
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const healthCheck = await PortfolioUpdateService.healthCheck()
    
    return NextResponse.json({
      ...healthCheck,
      systemInfo: {
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date(),
        uptime: process.uptime()
      }
    })

  } catch (error) {
    console.error('Error checking batch update health:', error)
    return NextResponse.json({ 
      status: 'error',
      error: 'Health check failed',
      timestamp: new Date()
    }, { status: 500 })
  }
}