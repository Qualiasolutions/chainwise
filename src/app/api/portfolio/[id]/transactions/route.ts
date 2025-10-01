import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const portfolioId = params.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // buy, sell, or all
    const symbol = searchParams.get('symbol');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Fetch portfolio holdings as transactions
    // In a full implementation, we'd have a separate transactions table
    let query = supabase
      .from('portfolio_holdings')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (symbol) {
      query = query.eq('symbol', symbol.toLowerCase());
    }

    const { data: holdings, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform holdings into transaction format
    const transactions = (holdings || []).map(h => ({
      id: h.id,
      type: 'buy', // All current holdings are buys
      symbol: h.symbol.toUpperCase(),
      name: h.name,
      amount: h.amount,
      price: h.purchase_price,
      totalValue: h.amount * h.purchase_price,
      currentPrice: h.current_price,
      currentValue: h.amount * h.current_price,
      pnl: (h.amount * h.current_price) - (h.amount * h.purchase_price),
      pnlPercentage: ((h.current_price - h.purchase_price) / h.purchase_price) * 100,
      date: h.purchase_date || h.created_at,
      notes: h.notes || null
    }));

    // Filter by type if specified
    const filteredTransactions = type && type !== 'all'
      ? transactions.filter(t => t.type === type)
      : transactions;

    // Calculate summary statistics
    const summary = {
      totalTransactions: filteredTransactions.length,
      totalBuys: filteredTransactions.filter(t => t.type === 'buy').length,
      totalSells: filteredTransactions.filter(t => t.type === 'sell').length,
      totalInvested: filteredTransactions.reduce((sum, t) => sum + t.totalValue, 0),
      currentValue: filteredTransactions.reduce((sum, t) => sum + t.currentValue, 0),
      totalPnL: filteredTransactions.reduce((sum, t) => sum + t.pnl, 0)
    };

    return NextResponse.json({
      transactions: filteredTransactions,
      summary
    });
  } catch (error: any) {
    console.error('Portfolio transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
