import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data: subscription, error: subscriptionError } = await supabase
      .rpc('get_whale_alert_subscription', { p_user_id: userData.id })
      .single();

    if (subscriptionError) {
      console.error('Fetch preferences error:', subscriptionError);
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      preferences: subscription.notification_preferences,
      is_active: subscription.is_active,
      has_access: subscription.has_access
    });

  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, tier')
      .eq('auth_id', user.id)
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

    const body = await request.json();

    // Get current preferences
    const { data: currentSub, error: fetchError } = await supabase
      .rpc('get_whale_alert_subscription', { p_user_id: userData.id })
      .single();

    if (fetchError) {
      console.error('Fetch current preferences error:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch current preferences' }, { status: 500 });
    }

    // Merge with new preferences
    const updatedPreferences = {
      ...currentSub.notification_preferences,
      ...body
    };

    // Validate
    if (updatedPreferences.min_usd_value &&
        (updatedPreferences.min_usd_value < 100000 || updatedPreferences.min_usd_value > 10000000)) {
      return NextResponse.json(
        { error: 'Min USD value must be between $100,000 and $10,000,000' },
        { status: 400 }
      );
    }

    const validBlockchains = ['bitcoin', 'ethereum', 'tron'];
    if (updatedPreferences.blockchains &&
        !updatedPreferences.blockchains.every((b: string) => validBlockchains.includes(b))) {
      return NextResponse.json(
        { error: 'Invalid blockchain specified' },
        { status: 400 }
      );
    }

    const validChannels = ['in_app', 'email'];
    if (updatedPreferences.notification_channels &&
        !updatedPreferences.notification_channels.every((c: string) => validChannels.includes(c))) {
      return NextResponse.json(
        { error: 'Invalid notification channel specified' },
        { status: 400 }
      );
    }

    // Update subscription
    const { data: subscriptionId, error: updateError } = await supabase
      .rpc('upsert_whale_alert_subscription', {
        p_user_id: userData.id,
        p_is_active: currentSub.is_active,
        p_preferences: updatedPreferences
      });

    if (updateError) {
      console.error('Update preferences error:', updateError);
      return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      preferences: updatedPreferences
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
