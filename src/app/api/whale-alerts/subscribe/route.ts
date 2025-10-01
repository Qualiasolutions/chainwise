import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/supabase/types';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    // Get authenticated user
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database to check tier
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, tier')
      .eq('auth_id', session.user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has elite tier
    if (userData.tier !== 'elite') {
      return NextResponse.json(
        { error: 'Whale alerts require Elite tier subscription' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { is_active, notification_preferences } = body;

    // Validate preferences
    if (notification_preferences) {
      const { min_usd_value, blockchains, notification_channels, quiet_hours } = notification_preferences;

      if (min_usd_value && (min_usd_value < 100000 || min_usd_value > 10000000)) {
        return NextResponse.json(
          { error: 'Min USD value must be between $100,000 and $10,000,000' },
          { status: 400 }
        );
      }

      const validBlockchains = ['bitcoin', 'ethereum', 'tron'];
      if (blockchains && !Array.isArray(blockchains)) {
        return NextResponse.json(
          { error: 'Blockchains must be an array' },
          { status: 400 }
        );
      }

      if (blockchains && !blockchains.every((b: string) => validBlockchains.includes(b))) {
        return NextResponse.json(
          { error: 'Invalid blockchain specified' },
          { status: 400 }
        );
      }

      const validChannels = ['in_app', 'email'];
      if (notification_channels && !notification_channels.every((c: string) => validChannels.includes(c))) {
        return NextResponse.json(
          { error: 'Invalid notification channel specified' },
          { status: 400 }
        );
      }
    }

    // Call upsert function
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .rpc('upsert_whale_alert_subscription', {
        p_user_id: userData.id,
        p_is_active: is_active ?? true,
        p_preferences: notification_preferences ?? {
          min_usd_value: 100000,
          blockchains: ['bitcoin', 'ethereum'],
          notification_channels: ['in_app'],
          transaction_types: ['transfer'],
          quiet_hours: {
            enabled: false,
            start: '22:00',
            end: '08:00'
          }
        }
      });

    if (subscriptionError) {
      console.error('Subscription error:', subscriptionError);
      return NextResponse.json(
        { error: 'Failed to create subscription' },
        { status: 500 }
      );
    }

    // Get the created/updated subscription
    const { data: subscription, error: fetchError } = await supabase
      .rpc('get_whale_alert_subscription', { p_user_id: userData.id })
      .single();

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        is_active: subscription.is_active,
        notification_preferences: subscription.notification_preferences,
        has_access: subscription.has_access,
        created_at: subscription.created_at
      }
    });

  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    // Get authenticated user
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, tier')
      .eq('auth_id', session.user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get subscription status
    const { data: subscription, error: subscriptionError } = await supabase
      .rpc('get_whale_alert_subscription', { p_user_id: userData.id })
      .single();

    if (subscriptionError) {
      console.error('Subscription fetch error:', subscriptionError);
      return NextResponse.json(
        { error: 'Failed to fetch subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        is_active: subscription.is_active,
        notification_preferences: subscription.notification_preferences,
        has_access: subscription.has_access,
        created_at: subscription.created_at,
        user_tier: userData.tier
      }
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
