import { NextResponse } from 'next/server'
import { creditService } from '@/lib/credit-service'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get credit packs from service (source of truth pricing)
    const packs = creditService.getCreditPacks()

    return NextResponse.json({
      success: true,
      data: {
        packs
      }
    })
  } catch (error: any) {
    console.error('Error fetching credit packs:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch credit packs',
        details: error.message 
      },
      { status: 500 }
    )
  }
}