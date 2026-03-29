// ============================================================
// Smart Alerts Module
// Generates actionable alerts for the shop owner:
//   - Stockout warnings ("Onions will run out in 2 days")
//   - Expiry warnings ("Spinach expires tomorrow")
//   - Reorder suggestions
//   - Slow-moving stock flags
// ============================================================

import type { StockPrediction, SmartAlert } from '@/types';
import { daysBetween } from '@/lib/utils';

interface ProductData {
    id: string;
    name: string;
    quantity: number;
    minStock: number;
    expiryDate: Date | null;
}

interface SalesInfo {
    totalQtySold: number;
    totalRevenue: number;
    transactionCount: number;
}

export function generateAlerts(
    products: ProductData[],
    salesMap: Map<string, SalesInfo>,
    predictions: StockPrediction[]
): SmartAlert[] {
    const alerts: SmartAlert[] = [];
    const now = new Date();
    let alertId = 0;

    for (const product of products) {
        const prediction = predictions.find((p) => p.productId === product.id);
        const sales = salesMap.get(product.id);

        // ── 1. Stock-out alert ──
        if (prediction && prediction.daysUntilStockout <= 7 && prediction.avgDailySales > 0) {
            const days = prediction.daysUntilStockout;
            alerts.push({
                id: `alert-${++alertId}`,
                type: 'stockout',
                severity: days <= 2 ? 'critical' : 'warning',
                title: days <= 0
                    ? `${product.name} is OUT OF STOCK!`
                    : `${product.name} will run out in ${days} day${days === 1 ? '' : 's'}`,
                message: `Current stock: ${product.quantity}. Average daily sales: ${prediction.avgDailySales}. Reorder immediately.`,
                productId: product.id,
                productName: product.name,
            });
        }

        // ── 2. Low stock alert (below minimum) ──
        if (product.quantity <= product.minStock && product.quantity > 0) {
            alerts.push({
                id: `alert-${++alertId}`,
                type: 'reorder',
                severity: product.quantity <= Math.floor(product.minStock / 2) ? 'critical' : 'warning',
                title: `Low stock: ${product.name}`,
                message: `Only ${product.quantity} left (minimum: ${product.minStock}). Place a reorder.`,
                productId: product.id,
                productName: product.name,
            });
        }

        // ── 3. Expiry alert (perishable items) ──
        if (product.expiryDate) {
            const daysToExpiry = daysBetween(now, product.expiryDate);

            if (daysToExpiry <= 0) {
                alerts.push({
                    id: `alert-${++alertId}`,
                    type: 'expiry',
                    severity: 'critical',
                    title: `${product.name} has EXPIRED!`,
                    message: `${product.quantity} units expired. Remove from shelf immediately to avoid wastage issues.`,
                    productId: product.id,
                    productName: product.name,
                });
            } else if (daysToExpiry <= 3) {
                alerts.push({
                    id: `alert-${++alertId}`,
                    type: 'expiry',
                    severity: daysToExpiry <= 1 ? 'critical' : 'warning',
                    title: `${product.name} expires in ${daysToExpiry} day${daysToExpiry === 1 ? '' : 's'}`,
                    message: `${product.quantity} units remaining. Consider a discount to reduce wastage.`,
                    productId: product.id,
                    productName: product.name,
                });
            }
        }

        // ── 4. Not selling well ──
        const totalSold = sales?.totalQtySold || 0;
        if (totalSold === 0 && product.quantity > 10) {
            alerts.push({
                id: `alert-${++alertId}`,
                type: 'low_selling',
                severity: 'info',
                title: `${product.name} is not selling`,
                message: `Zero sales in 30 days with ${product.quantity} in stock. Consider a promotion or discontinue.`,
                productId: product.id,
                productName: product.name,
            });
        }
    }

    // Sort by severity: critical → warning → info
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}
