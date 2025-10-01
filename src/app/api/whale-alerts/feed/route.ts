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
      .select('id, tier')
      .eq('auth_id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const blockchain = searchParams.get('blockchain');
    const minUsdValue = parseInt(searchParams.get('min_usd_value') || '100000');

    // Validate limits
    if (limit > 200) {
      return NextResponse.json(
        { error: 'Limit cannot exceed 200' },
        { status: 400 }
      );
    }

    // Get whale transactions feed
    const { data: transactions, error: feedError } = await supabase
      .rpc('get_whale_transactions_feed', {
        p_limit: limit,
        p_offset: offset,
        p_blockchain: blockchain,
        p_min_usd_value: minUsdValue
      });

    if (feedError) {
      console.error('Feed fetch error:', feedError);
      return NextResponse.json(
        { error: 'Failed to fetch whale transactions' },
        { status: 500 }
      );
    }

    // Format response
    const formattedTransactions = (transactions || []).map((tx: any) => ({
      id: tx.id,
      hash: tx.transaction_hash,
      blockchain: tx.blockchain,
      symbol: tx.symbol,
      amount: parseFloat(tx.amount),
      amount_usd: parseFloat(tx.amount_usd),
      from: {
        address: tx.from_address,
        owner: tx.from_owner,
        owner_type: tx.from_owner_type
      },
      to: {
        address: tx.to_address,
        owner: tx.to_owner,
        owner_type: tx.to_owner_type
      },
      type: tx.transaction_type,
      timestamp: tx.transaction_timestamp,
      minutes_ago: tx.minutes_ago
    }));

    return NextResponse.json({
      success: true,
      transactions: formattedTransactions,
      pagination: {
        limit,
        offset,
        count: formattedTransactions.length,
        has_more: formattedTransactions.length === limit
      },
      filters: {
        blockchain: blockchain || 'all',
        min_usd_value: minUsdValue
      }
    });

  } catch (error) {
    console.error('Feed error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
