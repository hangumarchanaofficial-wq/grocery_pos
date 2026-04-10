// ============================================================
// AI Engine — orchestrates all analysis modules
// ============================================================
import { adminClient } from '@/lib/supabase/admin';
import { generatePredictions } from './predictions';
import { generateInsights } from './insights';
import { generateAlerts } from './alerts';
import { generateBasketAnalysis } from './basket';
import { generateCustomerInsights } from './customerInsights';
import { detectAnomalies } from './anomaly';
import { generateCategoryScores } from './categoryScore';
import { generateDailySummary } from './dailySummary';
import { generatePricingSuggestions } from './pricingSuggestions';
import type { StockPrediction, SalesInsight, SmartAlert } from '@/types';
import type { BasketPair } from './basket';
import type { CustomerScore } from './customerInsights';
import type { AnomalyFlag } from './anomaly';
import type { CategoryScore } from './categoryScore';
import type { DailySummary } from './dailySummary';
import type { PricingSuggestion } from './pricingSuggestions';

export interface AIAnalysis {
  predictions:        StockPrediction[];
  insights:           SalesInsight[];
  alerts:             SmartAlert[];
  basket:             BasketPair[];
  customerInsights:   CustomerScore[];
  anomalies:          AnomalyFlag[];
  categoryScores:     CategoryScore[];
  dailySummary:       DailySummary;
  pricingSuggestions: PricingSuggestion[];
  generatedAt:        string;
}

export async function runFullAnalysis(): Promise<AIAnalysis> {
  const [
    { data: salesData },
    { data: products },
    { data: dailyData },
  ] = await Promise.all([
    adminClient.rpc('get_product_sales_30days'),
    adminClient.from('products').select('*').eq('active', true),
    adminClient.rpc('get_daily_sales_30days'),
  ]);

  const salesMap = new Map<string, {
    totalQtySold: number;
    totalRevenue: number;
    transactionCount: number;
  }>(
    (salesData || []).map((s: any) => [
      s.product_id,
      {
        totalQtySold:    Number(s.total_qty_sold),
        totalRevenue:    s.total_revenue,
        transactionCount: Number(s.transaction_count),
      },
    ])
  );

  const dailySalesByProduct: Record<string, Record<string, number>> = {};
  (dailyData || []).forEach((row: any) => {
    if (!dailySalesByProduct[row.product_id])
      dailySalesByProduct[row.product_id] = {};
    dailySalesByProduct[row.product_id][row.sale_date] = Number(row.daily_qty);
  });

  const mappedProducts = (products || []).map((p: any) => ({
    id:         p.id as string,
    name:       p.name as string,
    price:      p.price as number,
    quantity:   p.quantity as number,
    minStock:   p.min_stock as number,
    expiryDate: p.expiry_date ? new Date(p.expiry_date) : null,
  }));

  const predictions        = generatePredictions(mappedProducts, salesMap);
  const insights           = generateInsights(mappedProducts, salesMap, dailySalesByProduct);
  const alerts             = generateAlerts(mappedProducts, salesMap, predictions);

  const [basket, customerInsights, anomalies, categoryScores, dailySummary, pricingSuggestions] =
    await Promise.all([
      generateBasketAnalysis(),
      generateCustomerInsights(),
      detectAnomalies(),
      generateCategoryScores(),
      generateDailySummary(),
      generatePricingSuggestions(),
    ]);

  return {
    predictions,
    insights,
    alerts,
    basket,
    customerInsights,
    anomalies,
    categoryScores,
    dailySummary,
    pricingSuggestions,
    generatedAt: new Date().toISOString(),
  };
}
