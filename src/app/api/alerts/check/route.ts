import { NextRequest, NextResponse } from 'next/server'
import { AlertService, AlertCheckResult } from '@/lib/alert-service'
import { z } from 'zod'

// Request validation schema
const checkAlertsSchema = z.object({
  userId: z.string().optional(), // Optional: check alerts for specific user
  force: z.string().optional().transform(val => val === 'true') // Optional: force check even if recently checked
})

// POST /api/alerts/check - Check and process alerts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, force } = checkAlertsSchema.parse(body)

    // For now, we'll allow anyone to trigger alert checks
    // In production, you might want to restrict this to cron jobs or admin users

    let result: AlertCheckResult

    if (userId) {
      // Check alerts for specific user
      result = await checkUserAlerts(userId)
    } else {
      // Check all alerts
      result = await AlertService.checkAllAlerts()
    }

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date()
    })

  } catch (error) {
    console.error('Error checking alerts:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Failed to check alerts'
    }, { status: 500 })
  }
}

// Helper function to check alerts for a specific user
async function checkUserAlerts(userId: string): Promise<AlertCheckResult> {
  const result: AlertCheckResult = {
    triggered: [],
    checked: 0,
    errors: []
  }

  try {
    // Get user's active alerts
    const userAlerts = await AlertService.getUserAlerts(userId, true)
    result.checked = userAlerts.length

    if (userAlerts.length === 0) {
      return result
    }

    // Get unique crypto IDs
    const cryptoIdsSet = new Set(userAlerts.map(alert => alert.cryptoId))
    const cryptoIds = Array.from(cryptoIdsSet)

    // Get current prices and crypto info
    const priceUrl = `${process.env.NEXT_PUBLIC_COINGECKO_API_URL || 'https://api.coingecko.com/api/v3'}/simple/price?ids=${cryptoIds.join(',')}&vs_currencies=usd&include_24hr_change=true`
    const cryptoInfoUrl = `${process.env.NEXT_PUBLIC_COINGECKO_API_URL || 'https://api.coingecko.com/api/v3'}/coins/markets?ids=${cryptoIds.join(',')}&vs_currency=usd`
    
    const [priceData, cryptoInfoData] = await Promise.all([
      fetch(priceUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.COINGECKO_API_KEY && {
            'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
          })
        }
      }),
      fetch(cryptoInfoUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.COINGECKO_API_KEY && {
            'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
          })
        }
      })
    ])

    if (!priceData.ok) {
      result.errors.push('Failed to fetch current prices')
      return result
    }

    if (!cryptoInfoData.ok) {
      result.errors.push('Failed to fetch crypto information')
      return result
    }

    const prices = await priceData.json()
    const cryptoInfo = await cryptoInfoData.json()
    
    // Create a map of crypto ID to symbol
    const cryptoSymbols: Record<string, string> = {}
    cryptoInfo.forEach((crypto: any) => {
      cryptoSymbols[crypto.id] = crypto.symbol?.toUpperCase() || crypto.id.toUpperCase()
    })

    // Check each alert
    for (const alert of userAlerts) {
      try {
        const currentPrice = prices[alert.cryptoId]?.usd

        if (!currentPrice) {
          result.errors.push(`No price data for ${alert.cryptoId}`)
          continue
        }

        const shouldTrigger = shouldTriggerAlert(alert, currentPrice)

        if (shouldTrigger && alert.targetValue) {
          result.triggered.push({
            alertId: alert.id,
            userId: alert.userId,
            cryptoId: alert.cryptoId,
            symbol: cryptoSymbols[alert.cryptoId] || alert.cryptoId.toUpperCase(),
            alertType: alert.alertType,
            targetValue: alert.targetValue.toNumber(),
            currentValue: currentPrice,
            message: generateDefaultMessage(alert, currentPrice, cryptoSymbols[alert.cryptoId]),
            triggeredAt: new Date()
          })
        }
      } catch (error) {
        console.error(`Error checking alert ${alert.id}:`, error)
        result.errors.push(`Error checking alert ${alert.id}: ${error}`)
      }
    }

  } catch (error) {
    console.error('Error checking user alerts:', error)
    result.errors.push(`User alert checking error: ${error}`)
  }

  return result
}

// Helper function to determine if alert should trigger
function shouldTriggerAlert(alert: any, currentPrice: number): boolean {
  if (!alert.targetValue) return false
  
  const targetValue = alert.targetValue.toNumber()

  switch (alert.alertType) {
    case 'price_above':
      return currentPrice >= targetValue

    case 'price_below':
      return currentPrice <= targetValue

    case 'percentage_change':
      return Math.abs(currentPrice - targetValue) / targetValue >= 0.05 // 5% change

    case 'volume_spike':
      return false // Not implemented yet

    case 'market_cap_change':
      return false // Not implemented yet

    default:
      return false
  }
}

// Helper function to generate default alert message
function generateDefaultMessage(alert: any, currentPrice: number, symbol?: string): string {
  const cryptoSymbol = symbol || alert.cryptoId.toUpperCase()
  
  if (!alert.targetValue) {
    return `${cryptoSymbol} alert triggered: Current price $${currentPrice.toFixed(2)}`
  }
  
  const targetValue = alert.targetValue.toNumber()

  switch (alert.alertType) {
    case 'price_above':
      return `${cryptoSymbol} has reached $${currentPrice.toFixed(2)}, above your target of $${targetValue.toFixed(2)}`

    case 'price_below':
      return `${cryptoSymbol} has dropped to $${currentPrice.toFixed(2)}, below your target of $${targetValue.toFixed(2)}`

    case 'percentage_change':
      const changePercent = ((currentPrice - targetValue) / targetValue * 100)
      const direction = changePercent > 0 ? 'increased' : 'decreased'
      return `${cryptoSymbol} has ${direction} by ${Math.abs(changePercent).toFixed(2)}% to $${currentPrice.toFixed(2)}`

    default:
      return `${cryptoSymbol} alert triggered: Current price $${currentPrice.toFixed(2)}`
  }
}

// GET /api/alerts/check - Get alert checking status (for debugging)
export async function GET() {
  try {
    // Get some basic stats about alerts
    const totalAlerts = await fetch(`${process.env.NEXTAUTH_URL}/api/alerts?limit=1`).then(res => res.json())

    return NextResponse.json({
      status: 'Alert checking endpoint is available',
      totalAlerts: totalAlerts.pagination?.total || 0,
      timestamp: new Date()
    })

  } catch (error) {
    console.error('Error getting alert status:', error)
    return NextResponse.json({
      error: 'Failed to get alert status'
    }, { status: 500 })
  }
}
