import { NextRequest, NextResponse } from 'next/server'
// REMOVED: import { auth } from '@/auth-stub'
import { PortfolioService } from '@/lib/portfolio-service'

// POST /api/portfolio/[id]/update-values - Update portfolio with latest prices
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update portfolio values and get stats
    const portfolioStats = await PortfolioService.updatePortfolioValues(params.id)

    return NextResponse.json({
      success: true,
      portfolioStats
    })

  } catch (error) {
    console.error('Error updating portfolio values:', error)

    if (error instanceof Error && error.message === 'Portfolio not found') {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    return NextResponse.json({
      error: 'Failed to update portfolio values'
    }, { status: 500 })
  }
}