import { adminClient } from '@/lib/supabase/admin';
import { generatePredictions } from './predictions';
import { generateInsights } from './insights';
import { generateAlerts } from './alerts';
import type { StockPrediction, SalesInsight, SmartAlert } from '@/types';

export interface AIAnalysis {
  predictions: StockPrediction[];
  insights: SalesInsight[];
  alerts: SmartAlert[];
  generatedAt: string;
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
    (salesData || []).map((s: {
      product_id: string;
      total_qty_sold: number;
      total_revenue: number;
      transaction_count: number;
    }) => [
      s.product_id,
      {
        totalQtySold: Number(s.total_qty_sold),
        totalRevenue: s.total_revenue,
        transactionCount: Number(s.transaction_count),
      },
    ])
  );

  const dailySalesByProduct: Record<string, Record<string, number>> = {};
  (dailyData || []).forEach((row: {
    product_id: string;
    sale_date: string;
    daily_qty: number;
  }) => {
    if (!dailySalesByProduct[row.product_id])
      dailySalesByProduct[row.product_id] = {};
    dailySalesByProduct[row.product_id][row.sale_date] = Number(row.daily_qty);
  });

  const mappedProducts = (products || []).map((p: Record<string, unknown>) => ({
    id:         p.id as string,
    name:       p.name as string,
    price:      p.price as number,
    quantity:   p.quantity as number,
    minStock:   p.min_stock as number,
    expiryDate: p.expiry_date as Date | null,
  }));

  const predictions = generatePredictions(mappedProducts, salesMap);
  const insights    = generateInsights(mappedProducts, salesMap, dailySalesByProduct);
  const alerts      = generateAlerts(mappedProducts, salesMap, predictions);

  return { predictions, insights, alerts, generatedAt: new Date().toISOString() };
}
