// ============================================================
// GET /api/dashboard — Dashboard summary statistics
// Returns today's sales, profit, low stock, expiry alerts
// ============================================================

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return errorResponse('Unauthorized', 401);

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // Run all queries in parallel for speed
        const [
            todayBills,
            totalProducts,
            lowStockProducts,
            expiringProducts,
            recentBills,
            last7DaysSales,
        ] = await Promise.all([
            // Today's bills with items (for profit calculation)
            prisma.bill.findMany({
                where: { createdAt: { gte: todayStart, lte: todayEnd } },
                include: { items: true },
            }),

            // Total active products
            prisma.product.count({ where: { active: true } }),

            // Low stock products (quantity <= minStock)
            prisma.product.findMany({
                where: {
                    active: true,
                    quantity: { lte: 10 }, // We'll filter precisely in code
                },
                select: { id: true, name: true, quantity: true, minStock: true, category: true },
            }),

            // Products expiring within 3 days
            prisma.product.findMany({
                where: {
                    active: true,
                    expiryDate: {
                        lte: new Date(Date.now() + 3 * 86400000), // 3 days from now
                        gte: new Date(),
                    },
                },
                select: { id: true, name: true, expiryDate: true, quantity: true, category: true },
            }),

            // Last 5 bills for activity feed
            prisma.bill.findMany({
                include: {
                    customer: { select: { name: true } },
                    user: { select: { name: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),

            // Last 7 days sales for chart
            prisma.bill.findMany({
                where: {
                    createdAt: { gte: new Date(Date.now() - 7 * 86400000) },
                },
                select: { total: true, createdAt: true, items: { select: { costPrice: true, quantity: true, total: true } } },
            }),
        ]);

        // Calculate today's stats
        const todaySales = todayBills.reduce((sum, bill) => sum + bill.total, 0);
        const todayProfit = todayBills.reduce((sum, bill) => {
            const revenue = bill.items.reduce((s, item) => s + item.total, 0);
            const cost = bill.items.reduce((s, item) => s + item.costPrice * item.quantity, 0);
            return sum + (revenue - cost);
        }, 0);

        // Filter low stock accurately (quantity <= minStock)
        const actualLowStock = lowStockProducts.filter((p) => p.quantity <= p.minStock);

        // Build 7-day chart data
        const salesByDay: Record<string, { sales: number; profit: number; bills: number }> = {};
        for (let i = 6; i >= 0; i--) {
            const date = new Date(Date.now() - i * 86400000);
            const key = date.toISOString().slice(0, 10);
            salesByDay[key] = { sales: 0, profit: 0, bills: 0 };
        }

        last7DaysSales.forEach((bill) => {
            const key = bill.createdAt.toISOString().slice(0, 10);
            if (salesByDay[key]) {
                salesByDay[key].sales += bill.total;
                salesByDay[key].bills += 1;
                const cost = bill.items.reduce((s, item) => s + item.costPrice * item.quantity, 0);
                const revenue = bill.items.reduce((s, item) => s + item.total, 0);
                salesByDay[key].profit += revenue - cost;
            }
        });

        const chartData = Object.entries(salesByDay).map(([date, data]) => ({
            date,
            label: new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
            ...data,
        }));

        return successResponse({
            stats: {
                todaySales: Math.round(todaySales * 100) / 100,
                todayBills: todayBills.length,
                todayProfit: Math.round(todayProfit * 100) / 100,
                totalProducts,
                lowStockCount: actualLowStock.length,
                expiringCount: expiringProducts.length,
            },
            lowStockProducts: actualLowStock,
            expiringProducts,
            recentBills,
            chartData,
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        return errorResponse('Internal server error', 500);
    }
}
