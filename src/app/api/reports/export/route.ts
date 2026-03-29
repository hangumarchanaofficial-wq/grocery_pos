// ============================================================
// GET /api/reports/export — Export sales report as CSV
// ============================================================

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { errorResponse } from '@/lib/utils';

export async function GET(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user || !hasRole(user, ['OWNER', 'MANAGER'])) {
            return errorResponse('Insufficient permissions', 403);
        }

        const { searchParams } = new URL(req.url);
        const fromDate = searchParams.get('from');
        const toDate = searchParams.get('to');

        const from = fromDate ? new Date(fromDate) : new Date(Date.now() - 30 * 86400000);
        const to = toDate ? new Date(toDate) : new Date();
        to.setHours(23, 59, 59, 999);

        const bills = await prisma.bill.findMany({
            where: { createdAt: { gte: from, lte: to } },
            include: {
                items: {
                    include: { product: { select: { name: true } } },
                },
                customer: { select: { name: true, phone: true } },
                user: { select: { name: true } },
            },
            orderBy: { createdAt: 'asc' },
        });

        // Build CSV
        const headers = [
            'Bill Number',
            'Date',
            'Customer',
            'Items',
            'Subtotal',
            'Tax',
            'Discount',
            'Total',
            'Payment Method',
            'Cashier',
        ];

        const rows = bills.map((bill) => [
            bill.billNumber,
            bill.createdAt.toISOString().slice(0, 19).replace('T', ' '),
            bill.customer?.name || 'Walk-in',
            bill.items.map((i) => `${i.product.name} x${i.quantity}`).join('; '),
            bill.subtotal.toFixed(2),
            bill.tax.toFixed(2),
            bill.discount.toFixed(2),
            bill.total.toFixed(2),
            bill.paymentMethod,
            bill.user.name,
        ]);

        const csv = [
            headers.join(','),
            ...rows.map((row) =>
                row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
            ),
        ].join('\n');

        return new Response(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="sales-report-${from.toISOString().slice(0, 10)}-to-${to.toISOString().slice(0, 10)}.csv"`,
            },
        });
    } catch (error) {
        console.error('CSV export error:', error);
        return errorResponse('Internal server error', 500);
    }
}
