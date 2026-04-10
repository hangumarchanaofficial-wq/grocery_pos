// ============================================================
// Sales Insights Module
// Identifies top sellers, low sellers, and trend direction
// using simple linear regression on daily sales data.
// ============================================================

import { linearRegression } from 'simple-statistics';
import type { SalesInsight } from '@/types';

interface ProductData {
    id: string;
    name: string;
    price: number;
}

interface SalesInfo {
    totalQtySold: number;
    totalRevenue: number;
    transactionCount: number;
}

/**
 * Generate sales insights:
 * - Top 5 selling products by quantity
 * - Bottom 5 products (not selling well)
 * - Trending up / down using linear regression on daily sales
 */
export function generateInsights(
    products: ProductData[],
    salesMap: Map<string, SalesInfo>,
    dailySalesByProduct: Record<string, Record<string, number>>
): SalesInsight[] {
    const insights: SalesInsight[] = [];

    const productSales = products.map((p) => ({
        ...p,
        totalSold: salesMap.get(p.id)?.totalQtySold || 0,
        revenue: salesMap.get(p.id)?.totalRevenue || 0,
    }));

    const sorted = [...productSales].sort((a, b) => b.totalSold - a.totalSold);

    sorted.slice(0, 5).forEach((p, i) => {
        if (p.totalSold > 0) {
            insights.push({
                type: 'top_selling',
                productName: p.name,
                message: `#${i + 1} best seller - ${p.totalSold} units sold (LKR ${p.revenue.toFixed(0)} revenue)`,
                value: p.totalSold,
            });
        }
    });

    const lowSellers = sorted
        .filter((p) => p.totalSold <= 2)
        .reverse()
        .slice(0, 5);

    lowSellers.forEach((p) => {
        insights.push({
            type: 'low_selling',
            productName: p.name,
            message: p.totalSold === 0
                ? 'No sales in the last 30 days - consider a promotion or discontinue'
                : `Only ${p.totalSold} units sold in 30 days - underperforming`,
            value: p.totalSold,
        });
    });

    for (const product of products) {
        const dailyData = dailySalesByProduct[product.id];
        if (!dailyData) continue;

        const dataPoints: [number, number][] = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
            dataPoints.push([30 - i, dailyData[date] || 0]);
        }

        const nonZeroDays = dataPoints.filter(([, y]) => y > 0).length;
        if (nonZeroDays < 7) continue;

        try {
            const { m: slope } = linearRegression(dataPoints);

            if (slope > 0.3) {
                insights.push({
                    type: 'trending_up',
                    productName: product.name,
                    message: `Sales are increasing - daily sales growing by ~${slope.toFixed(1)} units/day`,
                    value: Math.round(slope * 100) / 100,
                });
            } else if (slope < -0.3) {
                insights.push({
                    type: 'trending_down',
                    productName: product.name,
                    message: `Sales are declining - daily sales dropping by ~${Math.abs(slope).toFixed(1)} units/day`,
                    value: Math.round(slope * 100) / 100,
                });
            }
        } catch {
            continue;
        }
    }

    return insights;
}
