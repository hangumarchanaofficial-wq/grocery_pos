// ============================================================
// Smart Pricing Suggestions
// Analyses margin vs sales velocity to suggest price changes
// ============================================================
import { adminClient } from '@/lib/supabase/admin';

export interface PricingSuggestion {
  productId: string;
  productName: string;
  currentMargin: number;
  suggestedMargin: number;
  currentPrice: number;
  suggestedPrice: number;
  reason: string;
  expectedImpact: string;
  priority: 'high' | 'medium' | 'low';
}

export async function generatePricingSuggestions(): Promise<PricingSuggestion[]> {
  const { data: products } = await adminClient
    .from('products')
    .select('id, name, price, cost_price, category')
    .eq('active', true);

  const { data: salesData } = await adminClient
    .from('bill_items')
    .select('product_id, quantity')
    .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString());

  if (!products) return [];

  // Build sales velocity map
  const salesMap = new Map<string, number>();
  for (const item of salesData ?? [] as any[]) {
    salesMap.set(item.product_id, (salesMap.get(item.product_id) ?? 0) + item.quantity);
  }

  const suggestions: PricingSuggestion[] = [];

  for (const p of products as any[]) {
    const costPrice  = p.cost_price ?? 0;
    if (costPrice <= 0) continue;

    const currentMargin   = ((p.price - costPrice) / costPrice) * 100;
    const unitsSold30Days = salesMap.get(p.id) ?? 0;
    const dailyVelocity   = unitsSold30Days / 30;

    let suggestedMargin = currentMargin;
    let reason = '';
    let expectedImpact = '';
    let priority: 'high' | 'medium' | 'low' = 'low';

    // High margin + very low sales → reduce price to move stock
    if (currentMargin > 40 && dailyVelocity < 0.5 && unitsSold30Days < 5) {
      suggestedMargin = Math.max(15, currentMargin - 15);
      reason = `High margin (${currentMargin.toFixed(0)}%) but only ${unitsSold30Days} units sold in 30 days.`;
      expectedImpact = 'Reducing margin should improve sales velocity and reduce wastage risk.';
      priority = 'high';
    }
    // Low margin + high sales → room to increase price
    else if (currentMargin < 10 && dailyVelocity > 2) {
      suggestedMargin = Math.min(currentMargin + 8, 20);
      reason = `Low margin (${currentMargin.toFixed(0)}%) despite strong sales (${dailyVelocity.toFixed(1)} units/day).`;
      expectedImpact = 'Small margin increase unlikely to reduce demand significantly at this velocity.';
      priority = 'medium';
    }
    // Zero sales + any stock → flag for review
    else if (unitsSold30Days === 0) {
      suggestedMargin = Math.max(5, currentMargin - 20);
      reason = 'No sales in 30 days. A price reduction or promotion may help clear stock.';
      expectedImpact = 'Lower price to stimulate demand or consider discontinuing.';
      priority = 'high';
    }
    else {
      continue; // No suggestion needed
    }

    const suggestedPrice = Math.round(costPrice * (1 + suggestedMargin / 100) * 100) / 100;

    suggestions.push({
      productId: p.id,
      productName: p.name,
      currentMargin:   Math.round(currentMargin  * 10) / 10,
      suggestedMargin: Math.round(suggestedMargin * 10) / 10,
      currentPrice:    p.price,
      suggestedPrice,
      reason,
      expectedImpact,
      priority,
    });
  }

  const order = { high: 0, medium: 1, low: 2 };
  return suggestions.sort((a, b) => order[a.priority] - order[b.priority]).slice(0, 15);
}
