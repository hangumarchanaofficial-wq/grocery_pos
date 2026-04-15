import { adminClient } from '@/lib/supabase/admin';
import { getUserFromRequest, errorResponse, successResponse } from '@/lib/auth';

type LowStockRow = {
  id: string;
  name: string;
  quantity: number;
  min_stock: number;
  category: string | null;
};

async function lowStockFallback(): Promise<{ count: number; rows: LowStockRow[] }> {
  const { data: allProducts } = await adminClient
    .from('products')
    .select('id, name, quantity, min_stock, category')
    .eq('active', true);
  const rows = (allProducts || []).filter(
    (p: { quantity: number; min_stock: number }) => p.quantity <= p.min_stock
  ) as LowStockRow[];
  return { count: rows.length, rows };
}

async function loadLowStockFromRpc(): Promise<{ count: number; rows: LowStockRow[] }> {
  const [{ data: cnt, error: cntErr }, { data: list, error: listErr }] = await Promise.all([
    adminClient.rpc('count_low_stock_products'),
    adminClient.rpc('get_low_stock_products'),
  ]);
  if (!cntErr && (typeof cnt === 'number' || typeof cnt === 'bigint') && !listErr && Array.isArray(list)) {
    return { count: Number(cnt), rows: list as LowStockRow[] };
  }
  return lowStockFallback();
}

export async function GET() {
  const user = await getUserFromRequest();
  if (!user) return errorResponse('Unauthorized', 401);

  const now          = new Date();
  const todayStart   = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const todayEnd     = new Date(now); todayEnd.setHours(23, 59, 59, 999);
  const sevenAgo     = new Date(Date.now() - 7  * 86400000);
  const threeAhead   = new Date(Date.now() + 3  * 86400000);

  const [
    { data: todayBills },
    { count: totalProducts },
    lowStockRpc,
    { data: expiringProducts },
    { data: recentBills },
    { data: last7Days },
  ] = await Promise.all([
    adminClient.from('bills')
      .select('total, bill_items(total, cost_price, quantity)')
      .gte('created_at', todayStart.toISOString())
      .lte('created_at', todayEnd.toISOString()),
    adminClient.from('products')
      .select('*', { count: 'exact', head: true }).eq('active', true),
    loadLowStockFromRpc(),
    adminClient.from('products')
      .select('id, name, expiry_date, quantity, category')
      .eq('active', true)
      .lte('expiry_date', threeAhead.toISOString())
      .gte('expiry_date', now.toISOString()),
    adminClient.from('bills')
      .select('id, bill_number, total, created_at, customers(name), users(name)')
      .order('created_at', { ascending: false }).limit(5),
    adminClient.from('bills')
      .select('total, created_at, bill_items(cost_price, quantity, total)')
      .gte('created_at', sevenAgo.toISOString()),
  ]);

  const bills       = todayBills || [];
  const todaySales  = bills.reduce((s: number, b: { total: number }) => s + b.total, 0);
  const todayProfit = bills.reduce((s: number, b: { bill_items: { total: number; cost_price: number; quantity: number }[] }) => {
    const rev  = b.bill_items.reduce((a, i) => a + i.total, 0);
    const cost = b.bill_items.reduce((a, i) => a + i.cost_price * i.quantity, 0);
    return s + rev - cost;
  }, 0);

  const salesByDay: Record<string, { sales: number; profit: number; bills: number }> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    salesByDay[d.toISOString().slice(0, 10)] = { sales: 0, profit: 0, bills: 0 };
  }
  (last7Days || []).forEach((b: { total: number; created_at: string; bill_items: { total: number; cost_price: number; quantity: number }[] }) => {
    const key = b.created_at.slice(0, 10);
    if (!salesByDay[key]) return;
    salesByDay[key].sales  += b.total;
    salesByDay[key].bills  += 1;
    salesByDay[key].profit += b.total - b.bill_items.reduce((s, i) => s + i.cost_price * i.quantity, 0);
  });

  const chartData = Object.entries(salesByDay).map(([date, d]) => ({
    date,
    label: new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
    ...d,
  }));

  return successResponse({
    stats: {
      todaySales:    Math.round(todaySales   * 100) / 100,
      todayBills:    bills.length,
      todayProfit:   Math.round(todayProfit  * 100) / 100,
      totalProducts: totalProducts || 0,
      lowStockCount: lowStockRpc.count,
      expiringCount: (expiringProducts || []).length,
    },
    lowStockProducts:  lowStockRpc.rows,
    expiringProducts:  expiringProducts  || [],
    recentBills:       recentBills       || [],
    chartData,
  });
}
