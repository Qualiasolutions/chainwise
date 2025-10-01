import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/supabase/types';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, tier, email')
      .eq('auth_id', session.user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (userData.tier !== 'elite') {
      return NextResponse.json(
        { error: 'Whale alerts require Elite tier subscription' },
        { status: 403 }
      );
    }

    // Check if user has whale alerts enabled
    const { data: subscription, error: subError } = await supabase
      .rpc('get_whale_alert_subscription', { p_user_id: userData.id })
      .single();

    if (subError || !subscription.is_active) {
      return NextResponse.json(
        { error: 'Whale alerts not enabled' },
        { status: 400 }
      );
    }

    // Create test notification
    const testNotification = {
      user_id: userData.id,
      type: 'whale_alert' as const,
      title: '🐋 Test Whale Alert',
      message: 'This is a test notification. Your whale alerts are working correctly!',
      data: {
        test: true,
        transaction: {
          hash: '0x1234...5678',
          blockchain: 'ethereum',
          symbol: 'ETH',
          amount: 1500,
          amount_usd: 5250000,
          from_owner: 'Unknown',
          to_owner: 'Binance',
          timestamp: new Date().toISOString()
        }
      }
    };

    const { data: notification, error: notifError } = await supabase
      .from('notifications')
      .insert([testNotification])
      .select()
      .single();

    if (notifError) {
      console.error('Notification creation error:', notifError);
      return NextResponse.json(
        { error: 'Failed to create test notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test notification sent successfully',
      notification: {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        created_at: notification.created_at
      }
    });

  } catch (error) {
    console.error('Test notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
