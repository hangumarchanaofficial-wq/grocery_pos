/** Build report rows from SQL daily aggregates; mirrors legacy /api/reports grouping. */

export interface DailySalesRow {
  sale_date: string;
  total_sales: number;
  total_profit: number;
  bill_count: number;
  top_product: string | null;
}

export interface ReportRowOut {
  date: string;
  totalSales: number;
  totalProfit: number;
  totalBills: number;
  topProduct: string;
}

function weekKeyFromDateString(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  const day = d.getDay();
  const mon = new Date(d);
  mon.setDate(d.getDate() - ((day + 6) % 7));
  return `Week of ${mon.toISOString().slice(0, 10)}`;
}

function monthKeyFromDateString(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function aggregateDailySalesReport(
  daily: DailySalesRow[],
  period: 'daily' | 'weekly' | 'monthly'
): ReportRowOut[] {
  if (period === 'daily') {
    return daily.map((r) => ({
      date: r.sale_date,
      totalSales: Number(r.total_sales),
      totalProfit: Number(r.total_profit),
      totalBills: Number(r.bill_count),
      topProduct: r.top_product ?? 'N/A',
    }));
  }

  type Bucket = {
    sales: number;
    profit: number;
    bills: number;
    maxDaySales: number;
    topOnMaxDay: string;
  };

  const map = new Map<string, Bucket>();

  for (const r of daily) {
    const key =
      period === 'monthly' ? monthKeyFromDateString(r.sale_date) : weekKeyFromDateString(r.sale_date);
    const sales = Number(r.total_sales);
    const profit = Number(r.total_profit);
    const bills = Number(r.bill_count);
    const prev = map.get(key);
    if (!prev) {
      map.set(key, {
        sales,
        profit,
        bills,
        maxDaySales: sales,
        topOnMaxDay: r.top_product ?? 'N/A',
      });
    } else {
      prev.sales += sales;
      prev.profit += profit;
      prev.bills += bills;
      if (sales >= prev.maxDaySales) {
        prev.maxDaySales = sales;
        prev.topOnMaxDay = r.top_product ?? 'N/A';
      }
    }
  }

  return Array.from(map.entries()).map(([date, b]) => ({
    date,
    totalSales: Math.round(b.sales * 100) / 100,
    totalProfit: Math.round(b.profit * 100) / 100,
    totalBills: b.bills,
    topProduct: b.topOnMaxDay,
  }));
}
