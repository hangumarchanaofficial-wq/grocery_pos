// ============================================================
// Customer Insights — loyalty scoring, churn detection, top spenders
// Pure SQL aggregation, no LLM needed
// ============================================================
import { adminClient } from '@/lib/supabase/admin';

export interface CustomerScore {
  customerId: string;
  name: string;
  phone: string;
  totalSpent: number;
  visitCount: number;
  avgBasket: number;
  lastVisitDaysAgo: number;
  loyaltyScore: number;   // 0-100
  churnRisk: 'low' | 'medium' | 'high';
  tag: string;            // "VIP", "Regular", "At Risk", "New", "Dormant"
}

export async function generateCustomerInsights(): Promise<CustomerScore[]> {
  const { data: bills } = await adminClient
    .from('bills')
    .select('total, created_at, customer_id, customers(id, name, phone)')
    .not('customer_id', 'is', null)
    .order('created_at', { ascending: false });

  if (!bills || bills.length === 0) return [];

  const customerMap = new Map<string, {
    name: string; phone: string;
    totalSpent: number; visits: number; lastVisit: Date;
  }>();

  for (const bill of bills as any[]) {
    if (!bill.customer_id) continue;
    const existing = customerMap.get(bill.customer_id);
    const visitDate = new Date(bill.created_at);
    if (existing) {
      existing.totalSpent += bill.total;
      existing.visits += 1;
      if (visitDate > existing.lastVisit) existing.lastVisit = visitDate;
    } else {
      customerMap.set(bill.customer_id, {
        name: bill.customers?.name ?? 'Unknown',
        phone: bill.customers?.phone ?? '',
        totalSpent: bill.total,
        visits: 1,
        lastVisit: visitDate,
      });
    }
  }

  const now = new Date();
  const results: CustomerScore[] = [];

  for (const [id, c] of customerMap.entries()) {
    const lastVisitDaysAgo = Math.floor(
      (now.getTime() - c.lastVisit.getTime()) / 86400000
    );
    const avgBasket = c.totalSpent / c.visits;

    // Loyalty score: weighted combination of recency, frequency, monetary
    const recencyScore   = Math.max(0, 100 - lastVisitDaysAgo * 2);
    const frequencyScore = Math.min(100, c.visits * 10);
    const monetaryScore  = Math.min(100, c.totalSpent / 100);
    const loyaltyScore   = Math.round(
      recencyScore * 0.4 + frequencyScore * 0.35 + monetaryScore * 0.25
    );

    // Churn risk
    let churnRisk: 'low' | 'medium' | 'high';
    if (lastVisitDaysAgo <= 14) churnRisk = 'low';
    else if (lastVisitDaysAgo <= 30) churnRisk = 'medium';
    else churnRisk = 'high';

    // Tag
    let tag: string;
    if (loyaltyScore >= 75) tag = 'VIP';
    else if (loyaltyScore >= 50 && lastVisitDaysAgo <= 21) tag = 'Regular';
    else if (c.visits === 1) tag = 'New';
    else if (lastVisitDaysAgo > 45) tag = 'Dormant';
    else tag = 'At Risk';

    results.push({
      customerId: id,
      name: c.name,
      phone: c.phone,
      totalSpent: Math.round(c.totalSpent * 100) / 100,
      visitCount: c.visits,
      avgBasket: Math.round(avgBasket * 100) / 100,
      lastVisitDaysAgo,
      loyaltyScore,
      churnRisk,
      tag,
    });
  }

  return results.sort((a, b) => b.loyaltyScore - a.loyaltyScore);
}
