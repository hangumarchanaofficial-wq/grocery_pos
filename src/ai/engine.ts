// ============================================================
// AI Engine — Central orchestrator
// Combines predictions, insights, and alerts into a unified
// intelligence layer. Uses statistical methods (no heavy ML).
// ============================================================

import { prisma } from '@/lib/prisma';
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

/**
 * Run the full AI analysis pipeline.
 * This pulls sales data from the last 30 days and computes:
 *   1. Stock depletion predictions
 *   2. Sales insights (top/low sellers, trends)
 *   3. Smart alerts (expiry, reorder, wastage)
 */
export async function runFullAnalysis(): Promise<AIAnalysis> {
    // Fetch the last 30 days of sales data with product details
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

    const [salesData, products, allBillItems] = await Promise.all([
        // Bills grouped by product for sales velocity
        prisma.billItem.groupBy({
            by: ['productId'],
            where: { bill: { createdAt: { gte: thirtyDaysAgo } } },
            _sum: { quantity: true, total: true },
            _count: true,
        }),

        // All active products
        prisma.product.findMany({ where: { active: true } }),

        // Daily sales for trend detection
        prisma.billItem.findMany({
            where: { bill: { createdAt: { gte: thirtyDaysAgo } } },
            include: {
                bill: { select: { createdAt: true } },
                product: { select: { name: true } },
            },
        }),
    ]);

    // Build lookup maps
    const productMap = new Map(products.map((p) => [p.id, p]));
    const salesMap = new Map(
        salesData.map((s) => [
            s.productId,
            {
                totalQtySold: s._sum.quantity || 0,
                totalRevenue: s._sum.total || 0,
                transactionCount: s._count,
            },
        ])
    );

    // Build daily sales per product (for trend analysis)
    const dailySalesByProduct: Record<string, Record<string, number>> = {};
    allBillItems.forEach((item) => {
        const dateKey = item.bill.createdAt.toISOString().slice(0, 10);
        const prodId = item.productId;
        if (!dailySalesByProduct[prodId]) dailySalesByProduct[prodId] = {};
        dailySalesByProduct[prodId][dateKey] =
            (dailySalesByProduct[prodId][dateKey] || 0) + item.quantity;
    });

    // Run all AI modules
    const predictions = generatePredictions(products, salesMap);
    const insights = generateInsights(products, salesMap, dailySalesByProduct);
    const alerts = generateAlerts(products, salesMap, predictions);

    return {
        predictions,
        insights,
        alerts,
        generatedAt: new Date().toISOString(),
    };
}
