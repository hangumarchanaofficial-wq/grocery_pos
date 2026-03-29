// ============================================================
// GET /api/products/search?q=... — Fast product search
// Used by the billing screen for quick lookup
// ============================================================

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return errorResponse('Unauthorized', 401);

        const q = new URL(req.url).searchParams.get('q') || '';
        if (q.length < 1) return successResponse([]);

        // Search by name OR barcode, only active products with stock
        const products = await prisma.product.findMany({
            where: {
                active: true,
                quantity: { gt: 0 },
                OR: [
                    { name: { contains: q, mode: 'insensitive' } },
                    { barcode: { contains: q, mode: 'insensitive' } },
                ],
            },
            take: 10,
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                barcode: true,
                price: true,
                costPrice: true,
                quantity: true,
                unit: true,
                category: true,
            },
        });

        return successResponse(products);
    } catch (error) {
        console.error('Product search error:', error);
        return errorResponse('Internal server error', 500);
    }
}
