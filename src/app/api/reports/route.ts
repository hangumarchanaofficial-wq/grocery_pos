import { adminClient } from '@/lib/supabase/admin';
import { getUserFromRequest, hasRole, errorResponse, successResponse } from '@/lib/auth';
import {
  aggregateDailySalesReport,
  type DailySalesRow,
} from '@/lib/reports/aggregateDailyReport';

function normalizeRpcDailyRows(raw: unknown[]): DailySalesRow[] {
  return raw.map((row: any) => {
    const sd = row.sale_date;
    const saleDate =
      typeof sd === 'string'
        ? sd.slice(0, 10)
        : sd instanceof Date
          ? sd.toISOString().slice(0, 10)
          : String(sd).slice(0, 10);
    return {
      sale_date: saleDate,
      total_sales: Number(row.total_sales),
      total_profit: Number(row.total_profit),
      bill_count: Number(row.bill_count),
      top_product: row.top_product ?? null,
    };
  });
}

async function buildReportFromRpc(
  period: string,
  from: Date,
  to: Date
): Promise<{ report: ReturnType<typeof aggregateDailySalesReport>; summary: Record<string, unknown> } | null> {
  const { data: rpcRows, error: rpcError } = await adminClient.rpc('get_daily_sales_report', {
    p_from: from.toISOString(),
    p_to: to.toISOString(),
  });

  if (rpcError || !Array.isArray(rpcRows)) return null;

  const daily = normalizeRpcDailyRows(rpcRows);
  const p = (period === 'weekly' || period === 'monthly' ? period : 'daily') as
    | 'daily'
    | 'weekly'
    | 'monthly';
  const report = aggregateDailySalesReport(daily, p).sort((a, b) => a.date.localeCompare(b.date));

  const totalSales = daily.reduce((s, r) => s + Number(r.total_sales), 0);
  const totalProfit = daily.reduce((s, r) => s + Number(r.total_profit), 0);
  const totalBills = daily.reduce((s, r) => s + Number(r.bill_count), 0);

  return {
    report,
    summary: {
      totalSales: Math.round(totalSales * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      totalBills,
      period,
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    },
  };
}

async function buildReportLegacy(
  period: string,
  from: Date,
  to: Date
): Promise<{ report: ReturnType<typeof aggregateDailySalesReport>; summary: Record<string, unknown> }> {
  const { data: bills, error } = await adminClient
    .from('bills')
    .select('total, created_at, bill_items(total, cost_price, quantity, products(name))')
    .gte('created_at', from.toISOString())
    .lte('created_at', to.toISOString())
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  const grouped: Record<string, { sales: number; profit: number; bills: number; productSales: Record<string, number> }> = {};
  (bills || []).forEach((b: any) => {
    const d = new Date(b.created_at);
    let key: string;
    if (period === 'monthly') key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    else if (period === 'weekly') {
      const day = d.getDay();
      const mon = new Date(d);
      mon.setDate(d.getDate() - ((day + 6) % 7));
      key = 'Week of ' + mon.toISOString().slice(0, 10);
    } else {
      key = d.toISOString().slice(0, 10);
    }

    grouped[key] = grouped[key] || { sales: 0, profit: 0, bills: 0, productSales: {} };
    grouped[key].sales += b.total;
    grouped[key].bills += 1;
    (b.bill_items || []).forEach((item: any) => {
      grouped[key].profit += item.total - item.cost_price * item.quantity;
      const n = Array.isArray(item.products) ? item.products[0]?.name : item.products?.name;
      if (n) grouped[key].productSales[n] = (grouped[key].productSales[n] || 0) + item.quantity;
    });
  });

  const report = Object.entries(grouped)
    .map(([date, data]) => {
      const top = Object.entries(data.productSales).sort((a, b) => b[1] - a[1])[0];
      return {
        date,
        totalSales: Math.round(data.sales * 100) / 100,
        totalBills: data.bills,
        totalProfit: Math.round(data.profit * 100) / 100,
        topProduct: top ? top[0] : 'N/A',
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalSales = (bills || []).reduce((s: number, b: any) => s + b.total, 0);
  const totalProfit = (bills || []).reduce(
    (s: number, b: any) =>
      s + (b.bill_items || []).reduce((a: number, i: any) => a + i.total - i.cost_price * i.quantity, 0),
    0
  );

  return {
    report,
    summary: {
      totalSales: Math.round(totalSales * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      totalBills: (bills || []).length,
      period,
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    },
  };
}

export async function GET(req: Request) {
  const user = await getUserFromRequest();
  if (!user || !hasRole(user, ['OWNER', 'MANAGER']))
    return errorResponse('Insufficient permissions', 403);

  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') || 'daily';
  const from = searchParams.get('from') ? new Date(searchParams.get('from')!) : new Date(Date.now() - 30 * 86400000);
  const to = searchParams.get('to') ? new Date(searchParams.get('to')!) : new Date();
  to.setHours(23, 59, 59, 999);

  try {
    const fromRpc = await buildReportFromRpc(period, from, to);
    if (fromRpc) {
      return successResponse({ report: fromRpc.report, summary: fromRpc.summary });
    }
  } catch {
    /* fall through to legacy */
  }

  try {
    const legacy = await buildReportLegacy(period, from, to);
    return successResponse({ report: legacy.report, summary: legacy.summary });
  } catch (e: unknown) {
    return errorResponse(e instanceof Error ? e.message : 'Report failed');
  }
}
