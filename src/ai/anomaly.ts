// ============================================================
// Anomaly Detection — unusual discount patterns, bill spikes,
// product sales drops. Uses standard deviation (simple-statistics)
// ============================================================
import { mean, standardDeviation } from 'simple-statistics';
import { adminClient } from '@/lib/supabase/admin';

export interface AnomalyFlag {
  id: string;
  type: 'high_discount' | 'bill_spike' | 'sales_drop' | 'unusual_return';
  severity: 'warning' | 'critical';
  title: string;
  message: string;
  detectedAt: string;
}

export async function detectAnomalies(): Promise<AnomalyFlag[]> {
  const flags: AnomalyFlag[] = [];
  let flagId = 0;
  const now = new Date().toISOString();

  // ── 1. High discount anomaly per cashier ──
  const { data: recentBills } = await adminClient
    .from('bills')
    .select('id, discount, total, user_id, users(name), created_at')
    .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString());

  if (recentBills && recentBills.length > 5) {
    const discountRatios = (recentBills as any[])
      .filter(b => b.total > 0)
      .map(b => (b.discount ?? 0) / b.total);

    const avg = mean(discountRatios);
    const sd  = standardDeviation(discountRatios);
    const threshold = avg + 2 * sd;

    // Group by cashier and check
    const cashierBills = new Map<string, { name: string; ratios: number[] }>();
    for (const bill of recentBills as any[]) {
      if (!bill.user_id || bill.total <= 0) continue;
      if (!cashierBills.has(bill.user_id)) {
        cashierBills.set(bill.user_id, {
          name: bill.users?.name ?? bill.user_id,
          ratios: [],
        });
      }
      cashierBills.get(bill.user_id)!.ratios.push((bill.discount ?? 0) / bill.total);
    }

    for (const [, cashier] of cashierBills.entries()) {
      const cashierAvg = mean(cashier.ratios);
      if (cashierAvg > threshold && cashierAvg > 0.05) {
        flags.push({
          id: `anomaly-${++flagId}`,
          type: 'high_discount',
          severity: cashierAvg > threshold * 1.5 ? 'critical' : 'warning',
          title: `Unusual discount pattern: ${cashier.name}`,
          message: `Average discount rate ${(cashierAvg * 100).toFixed(1)}% vs store average ${(avg * 100).toFixed(1)}%. Review recent bills.`,
          detectedAt: now,
        });
      }
    }
  }

  // ── 2. Bill total spike (today vs 7-day average) ──
  const { data: todayBills } = await adminClient
    .from('bills')
    .select('total')
    .gte('created_at', new Date().toISOString().slice(0, 10) + 'T00:00:00');

  const { data: weekBills } = await adminClient
    .from('bills')
    .select('total, created_at')
    .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())
    .lt('created_at', new Date().toISOString().slice(0, 10) + 'T00:00:00');

  if (todayBills && weekBills && weekBills.length > 0) {
    const dailyTotals: Record<string, number> = {};
    for (const b of weekBills as any[]) {
      const d = b.created_at.slice(0, 10);
      dailyTotals[d] = (dailyTotals[d] ?? 0) + b.total;
    }
    const dailyAmounts = Object.values(dailyTotals);
    if (dailyAmounts.length >= 3) {
      const weekAvg = mean(dailyAmounts);
      const todayTotal = (todayBills as any[]).reduce((s, b) => s + b.total, 0);
      if (todayTotal > weekAvg * 2.5 && todayTotal > 10000) {
        flags.push({
          id: `anomaly-${++flagId}`,
          type: 'bill_spike',
          severity: 'warning',
          title: 'Unusually high sales today',
          message: `Today's total LKR ${todayTotal.toFixed(0)} is ${(todayTotal / weekAvg).toFixed(1)}x the weekly average. Verify transactions.`,
          detectedAt: now,
        });
      }
    }
  }

  // ── 3. Sales drop — products with sudden zero sales (sold before, not now) ──
  const { data: prevSales } = await adminClient
    .from('bill_items')
    .select('product_id, products(name)')
    .gte('created_at', new Date(Date.now() - 14 * 86400000).toISOString())
    .lt('created_at', new Date(Date.now() - 7 * 86400000).toISOString());

  const { data: recentSales } = await adminClient
    .from('bill_items')
    .select('product_id')
    .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString());

  if (prevSales && recentSales) {
    const prevProductIds = new Set((prevSales as any[]).map(i => i.product_id));
    const recentProductIds = new Set((recentSales as any[]).map(i => i.product_id));
    const dropped = [...prevProductIds].filter(id => !recentProductIds.has(id));

    for (const id of dropped.slice(0, 5)) {
      const item = (prevSales as any[]).find(i => i.product_id === id);
      flags.push({
        id: `anomaly-${++flagId}`,
        type: 'sales_drop',
        severity: 'warning',
        title: `Sales dropped: ${item?.products?.name ?? id}`,
        message: 'Sold in the prior 7 days but zero sales this week. Check stock, pricing, or placement.',
        detectedAt: now,
      });
    }
  }

  return flags.sort((a, b) => (a.severity === 'critical' ? -1 : 1));
}
