import { NextRequest, NextResponse } from 'next/server';
import { whaleAlertPolling } from '@/lib/whale-alert-polling';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max

/**
 * Cron endpoint to poll Whale Alert API for new transactions
 * Should be triggered every 5 minutes via Vercel Cron or external service
 *
 * Vercel Cron configuration in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/whale-alert-poll",
 *     "schedule": "* /5 * * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron authorization (Vercel Cron or manual trigger with secret)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Whale Alert Polling] Starting polling cycle...');

    const result = await whaleAlertPolling.pollTransactions();

    console.log('[Whale Alert Polling] Polling completed:', {
      success: result.success,
      processed: result.processed,
      errors: result.errors
    });

    return NextResponse.json({
      success: result.success,
      processed: result.processed,
      errors: result.errors.length > 0 ? result.errors : undefined,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[Whale Alert Polling] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Allow POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}
