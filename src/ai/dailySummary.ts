// ============================================================
// Daily Business Summary — plain-English + Sinhala summary
// Template-based, no LLM needed, uses live DB data
// ============================================================
import { adminClient } from '@/lib/supabase/admin';

export interface DailySummary {
  en: string;
  si: string;
  highlights: {
    label: string;
    value: string;
    trend: 'up' | 'down' | 'neutral';
  }[];
  generatedAt: string;
}

export async function generateDailySummary(): Promise<DailySummary> {
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const yesterday  = new Date(Date.now() - 86400000);
  const ydayStart  = new Date(yesterday); ydayStart.setHours(0, 0, 0, 0);
  const ydayEnd    = new Date(yesterday); ydayEnd.setHours(23, 59, 59, 999);

  const [
    { data: todayBills },
    { data: ydayBills },
    { data: topItem },
    { data: lowStock },
  ] = await Promise.all([
    adminClient.from('bills')
      .select('total, bill_items(cost_price, quantity, total, product_id, products(name))')
      .gte('created_at', todayStart.toISOString()),
    adminClient.from('bills')
      .select('total')
      .gte('created_at', ydayStart.toISOString())
      .lte('created_at', ydayEnd.toISOString()),
    adminClient.from('bill_items')
      .select('product_id, quantity, products(name)')
      .gte('created_at', todayStart.toISOString())
      .order('quantity', { ascending: false })
      .limit(1),
    adminClient.from('products')
      .select('name, quantity, min_stock')
      .eq('active', true)
      .filter('quantity', 'lte', 'min_stock')
      .limit(3),
  ]);

  const bills = todayBills ?? [];
  const todaySales  = bills.reduce((s: number, b: any) => s + b.total, 0);
  const todayProfit = bills.reduce((s: number, b: any) => {
    const rev  = (b.bill_items ?? []).reduce((a: number, i: any) => a + i.total, 0);
    const cost = (b.bill_items ?? []).reduce((a: number, i: any) => a + i.cost_price * i.quantity, 0);
    return s + rev - cost;
  }, 0);
  const todayCount  = bills.length;

  const ydaySales = (ydayBills ?? []).reduce((s: number, b: any) => s + b.total, 0);
  const salesDiff = ydaySales > 0
    ? ((todaySales - ydaySales) / ydaySales) * 100
    : 0;
  const trendWord = salesDiff >= 0 ? 'up' : 'down';
  const trendSi   = salesDiff >= 0 ? 'ඉහළ' : 'පහළ';

  const topProductName = (topItem as any)?.[0]?.products?.name ?? 'N/A';
  const lowStockNames  = (lowStock as any[])?.map(p => p.name).join(', ') ?? 'None';
  const hasLowStock    = (lowStock?.length ?? 0) > 0;

  const hour = new Date().getHours();
  const greetEn = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const greetSi = hour < 12 ? 'සුභ උදෑසනක්' : hour < 17 ? 'සුභ දවසක්' : 'සුභ සන්ධ්‍යාවක්';

  const en = [
    `${greetEn}. Today you've made ${todayCount} sale${todayCount !== 1 ? 's' : ''} totalling LKR ${todaySales.toFixed(2)}.`,
    ydaySales > 0 ? `That's ${Math.abs(salesDiff).toFixed(1)}% ${trendWord} compared to yesterday.` : '',
    `Gross profit so far: LKR ${todayProfit.toFixed(2)}.`,
    topProductName !== 'N/A' ? `Top product today: ${topProductName}.` : '',
    hasLowStock ? `⚠️ Low stock warning: ${lowStockNames}. Reorder soon.` : 'All stock levels look healthy.',
  ].filter(Boolean).join(' ');

  const si = [
    `${greetSi}. අද ඔබ ${todayCount} විකුණුම් සිදු කර ඇත. මුළු ආදායම LKR ${todaySales.toFixed(2)}.`,
    ydaySales > 0 ? `ඊයේට සාපේක්ෂව ${Math.abs(salesDiff).toFixed(1)}% ${trendSi} ගොස් ඇත.` : '',
    `අද ලාභය: LKR ${todayProfit.toFixed(2)}.`,
    topProductName !== 'N/A' ? `අද වැඩිම අලෙවිය: ${topProductName}.` : '',
    hasLowStock ? `⚠️ අඩු තොගය: ${lowStockNames}. නැවත ඇණවුම් කරන්න.` : 'සියලු තොග ප්‍රමාණවත්.',
  ].filter(Boolean).join(' ');

  const highlights = [
    { label: "Today's Sales", value: `LKR ${todaySales.toFixed(0)}`, trend: salesDiff >= 0 ? 'up' as const : 'down' as const },
    { label: 'Bills Issued',   value: String(todayCount), trend: 'neutral' as const },
    { label: 'Gross Profit',   value: `LKR ${todayProfit.toFixed(0)}`, trend: todayProfit >= 0 ? 'up' as const : 'down' as const },
    { label: 'Top Product',    value: topProductName, trend: 'neutral' as const },
  ];

  return { en, si, highlights, generatedAt: new Date().toISOString() };
}
