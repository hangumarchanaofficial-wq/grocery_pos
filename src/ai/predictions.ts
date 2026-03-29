// ============================================================
// Stock Prediction Module
// Uses moving average of daily sales to estimate stockout dates.
// Formula: daysUntilStockout = currentStock / avgDailySales
// ============================================================

import type { StockPrediction } from '@/types';

interface ProductData {
    id: string;
    name: string;
    quantity: number;
    minStock: number;
}

interface SalesInfo {
    totalQtySold: number;
    totalRevenue: number;
    transactionCount: number;
}

/**
 * For each product, predict when stock will run out.
 * Uses 30-day average daily sales as the velocity metric.
 */
export function generatePredictions(
    products: ProductData[],
    salesMap: Map<string, SalesInfo>
): StockPrediction[] {
    const ANALYSIS_DAYS = 30;
    const predictions: StockPrediction[] = [];

    for (const product of products) {
        const sales = salesMap.get(product.id);
        const totalSold = sales?.totalQtySold || 0;
        const avgDailySales = totalSold / ANALYSIS_DAYS;

        let daysUntilStockout: number;
        let urgency: 'critical' | 'warning' | 'ok';

        if (avgDailySales === 0) {
            // Product not selling — infinite stock life, but flag differently
            daysUntilStockout = 999;
            urgency = 'ok';
        } else {
            daysUntilStockout = Math.round(product.quantity / avgDailySales);

            if (daysUntilStockout <= 2) {
                urgency = 'critical';
            } else if (daysUntilStockout <= 7) {
                urgency = 'warning';
            } else {
                urgency = 'ok';
            }
        }

        const stockoutDate = new Date(
            Date.now() + daysUntilStockout * 86400000
        );

        predictions.push({
            productId: product.id,
            productName: product.name,
            currentStock: product.quantity,
            avgDailySales: Math.round(avgDailySales * 100) / 100,
            daysUntilStockout,
            predictedStockoutDate: stockoutDate.toISOString().slice(0, 10),
            urgency,
        });
    }

    // Sort: most urgent first
    return predictions.sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);
}
