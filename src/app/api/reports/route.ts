// ============================================================
// GET /api/reports — Sales reports with date range filtering
// Query params: period=daily|weekly|monthly, from, to
// ============================================================

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user || !hasRole(user, ['OWNER', 'MANAGER'])) {
            return errorResponse('Insufficient permissions', 403);
        }

        const { searchParams } = new URL(req.url);
        const period = searchParams.get('period') || 'daily'; // daily | weekly | monthly
        const fromDate = searchParams.get('from');
        const toDate = searchParams.get('to');

        // Default: last 30 days
        const from = fromDate ? new Date(fromDate) : new Date(Date.now() - 30 * 86400000);
        const to = toDate ? new Date(toDate) : new Date();
        to.setHours(23, 59, 59, 999);

        // Fetch all bills in range with items for profit calc
        const bills = await prisma.bill.findMany({
            where: { createdAt: { gte: from, lte: to } },
            include: {
                items: {
                    include: { product: { select: { name: true } } },
                },
            },
            orderBy: { createdAt: 'asc' },
        });

        // Group by period
        const grouped: Record<string, {
            sales: number;
            profit: number;
            bills: number;
            productSales: Record<string, number>;
        }> = {};

        bills.forEach((bill) => {
            let key: string;
            const d = bill.createdAt;

            if (period === 'monthly') {
                key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            } else if (period === 'weekly') {
                // Get Monday of the week
                const day = d.getDay();
                const monday = new Date(d);
                monday.setDate(d.getDate() - ((day + 6) % 7));
                key = `Week of ${monday.toISOString().slice(0, 10)}`;
            } else {
                key = d.toISOString().slice(0, 10);
            }

            if (!grouped[key]) {
                grouped[key] = { sales: 0, profit: 0, bills: 0, productSales: {} };
            }

            grouped[key].sales += bill.total;
            grouped[key].bills += 1;

            bill.items.forEach((item) => {
                const revenue = item.total;
                const cost = item.costPrice * item.quantity;
                grouped[key].profit += revenue - cost;

                const pName = item.product.name;
                grouped[key].productSales[pName] = (grouped[key].productSales[pName] || 0) + item.quantity;
            });
        });

        // Build report array
        const report = Object.entries(grouped).map(([date, data]) => {
            // Find top product in this period
            const topProduct = Object.entries(data.productSales)
                .sort(([, a], [, b]) => b - a)[0];

            return {
                date,
                totalSales: Math.round(data.sales * 100) / 100,
                totalBills: data.bills,
                totalProfit: Math.round(data.profit * 100) / 100,
                topProduct: topProduct ? topProduct[0] : 'N/A',
            };
        });

        // Summary
        const totalSales = bills.reduce((sum, b) => sum + b.total, 0);
        const totalProfit = bills.reduce((sum, b) => {
            return sum + b.items.reduce((s, item) => s + (item.total - item.costPrice * item.quantity), 0);
        }, 0);

        return successResponse({
            report,
            summary: {
                totalSales: Math.round(totalSales * 100) / 100,
                totalProfit: Math.round(totalProfit * 100) / 100,
                totalBills: bills.length,
                period,
                from: from.toISOString().slice(0, 10),
                to: to.toISOString().slice(0, 10),
            },
        });
    } catch (error) {
        console.error('Reports error:', error);
        return errorResponse('Internal server error', 500);
    }
}
