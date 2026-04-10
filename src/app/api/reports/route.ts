import { adminClient } from '@/lib/supabase/admin';
import { getUserFromRequest, hasRole, errorResponse, successResponse } from '@/lib/auth';

export async function GET(req: Request) {
  const user = await getUserFromRequest();
  if (!user || !hasRole(user, ['OWNER', 'MANAGER']))
    return errorResponse('Insufficient permissions', 403);

  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') || 'daily';
  const from   = searchParams.get('from') ? new Date(searchParams.get('from')!) : new Date(Date.now() - 30 * 86400000);
  const to     = searchParams.get('to')   ? new Date(searchParams.get('to')!)   : new Date();
  to.setHours(23, 59, 59, 999);

  const { data: bills, error } = await adminClient
    .from('bills')
    .select('total, created_at, bill_items(total, cost_price, quantity, products(name))')
    .gte('created_at', from.toISOString())
    .lte('created_at', to.toISOString())
    .order('created_at', { ascending: true });

  if (error) return errorResponse(error.message);

  const grouped: Record<string, { sales: number; profit: number; bills: number; productSales: Record<string, number> }> = {};
  (bills || []).forEach((b: any) => {
    const d = new Date(b.created_at);
    let key: string;
    if      (period === 'monthly') key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    else if (period === 'weekly')  { const day = d.getDay(); const mon = new Date(d); mon.setDate(d.getDate() - ((day + 6) % 7)); key = 'Week of ' + mon.toISOString().slice(0, 10); }
    else                            key = d.toISOString().slice(0, 10);

    grouped[key] = grouped[key] || { sales: 0, profit: 0, bills: 0, productSales: {} };
    grouped[key].sales  += b.total;
    grouped[key].bills  += 1;
    (b.bill_items || []).forEach((item: any) => {
      grouped[key].profit += item.total - item.cost_price * item.quantity;
      const n = Array.isArray(item.products) ? item.products[0]?.name : item.products?.name;
      if (n) grouped[key].productSales[n] = (grouped[key].productSales[n] || 0) + item.quantity;
    });
  });

  const report = Object.entries(grouped).map(([date, data]) => {
    const top = Object.entries(data.productSales).sort((a, b) => b[1] - a[1])[0];
    return { date, totalSales: Math.round(data.sales * 100) / 100, totalBills: data.bills, totalProfit: Math.round(data.profit * 100) / 100, topProduct: top ? top[0] : 'N/A' };
  });

  const totalSales  = (bills || []).reduce((s: number, b: any) => s + b.total, 0);
  const totalProfit = (bills || []).reduce((s: number, b: any) =>
    s + (b.bill_items || []).reduce((a: number, i: any) => a + i.total - i.cost_price * i.quantity, 0), 0);

  return successResponse({
    report,
    summary: {
      totalSales: Math.round(totalSales * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      totalBills: (bills || []).length,
      period, from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10),
    },
  });
}

