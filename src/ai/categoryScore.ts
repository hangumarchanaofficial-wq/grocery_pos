// ============================================================
// Category Performance Scoring — A/B/C grade per category
// Based on: profit margin, sales velocity, stock turnover
// ============================================================
import { adminClient } from '@/lib/supabase/admin';

export interface CategoryScore {
  category: string;
  label: string;
  totalRevenue: number;
  totalProfit: number;
  avgMargin: number;       // %
  salesVelocity: number;   // units/day
  stockTurnover: number;   // times per 30 days
  score: number;           // 0-100
  grade: 'A' | 'B' | 'C' | 'D';
  recommendation: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  VEGETABLES: '🥦 Vegetables',
  FRUITS:     '🍎 Fruits',
  GROCERIES:  '🛒 Grocery Items',
  FOODS:      '🍱 Foods',
  COSMETIC:   '💄 Cosmetic',
  CLOTHES:    '👕 Clothes',
  OTHERS:     '📦 Others',
};

export async function generateCategoryScores(): Promise<CategoryScore[]> {
  const { data: billItems } = await adminClient
    .from('bill_items')
    .select('quantity, price, cost_price, total, products(category, quantity)')
    .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString());

  const { data: products } = await adminClient
    .from('products')
    .select('category, quantity, price, cost_price')
    .eq('active', true);

  if (!billItems || !products) return [];

  // Aggregate sold data by category
  const catSales = new Map<string, {
    revenue: number; profit: number; unitsSold: number;
  }>();

  for (const item of billItems as any[]) {
    const cat = item.products?.category ?? 'OTHERS';
    const existing = catSales.get(cat) ?? { revenue: 0, profit: 0, unitsSold: 0 };
    const revenue = item.total;
    const profit  = (item.price - item.cost_price) * item.quantity;
    catSales.set(cat, {
      revenue:   existing.revenue + revenue,
      profit:    existing.profit + profit,
      unitsSold: existing.unitsSold + item.quantity,
    });
  }

  // Aggregate current stock by category
  const catStock = new Map<string, number>();
  for (const p of products as any[]) {
    const cat = p.category ?? 'OTHERS';
    catStock.set(cat, (catStock.get(cat) ?? 0) + p.quantity);
  }

  const results: CategoryScore[] = [];
  const allCategories = new Set([...catSales.keys(), ...catStock.keys()]);

  for (const cat of allCategories) {
    const sold = catSales.get(cat) ?? { revenue: 0, profit: 0, unitsSold: 0 };
    const stock = catStock.get(cat) ?? 0;

    const avgMargin    = sold.revenue > 0 ? (sold.profit / sold.revenue) * 100 : 0;
    const salesVelocity = sold.unitsSold / 30;
    const stockTurnover = stock > 0 ? sold.unitsSold / stock : 0;

    // Weighted score
    const marginScore   = Math.min(100, avgMargin * 2);
    const velocityScore = Math.min(100, salesVelocity * 10);
    const turnoverScore = Math.min(100, stockTurnover * 20);
    const score = Math.round(marginScore * 0.4 + velocityScore * 0.35 + turnoverScore * 0.25);

    const grade: 'A' | 'B' | 'C' | 'D' =
      score >= 70 ? 'A' : score >= 50 ? 'B' : score >= 30 ? 'C' : 'D';

    let recommendation: string;
    if (grade === 'A') recommendation = 'Top performer. Maintain stock levels and pricing.';
    else if (grade === 'B') recommendation = 'Good performance. Minor margin improvements possible.';
    else if (grade === 'C') recommendation = 'Needs attention. Consider promotions or price revision.';
    else recommendation = 'Underperforming. Review product range and consider discontinuing slow movers.';

    results.push({
      category: cat,
      label: CATEGORY_LABELS[cat] ?? cat,
      totalRevenue:  Math.round(sold.revenue * 100) / 100,
      totalProfit:   Math.round(sold.profit  * 100) / 100,
      avgMargin:     Math.round(avgMargin    * 10)  / 10,
      salesVelocity: Math.round(salesVelocity * 100) / 100,
      stockTurnover: Math.round(stockTurnover * 100) / 100,
      score,
      grade,
      recommendation,
    });
  }

  return results.sort((a, b) => b.score - a.score);
}
