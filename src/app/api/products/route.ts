// ============================================================
// Products API
// GET  /api/products       — List all products (with filtering)
// POST /api/products       — Create new product
// ============================================================

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return errorResponse('Unauthorized', 401);

        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const lowStock = searchParams.get('lowStock');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');

        // Build dynamic where clause
        const where: Record<string, unknown> = { active: true };
        if (category) where.category = category;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { barcode: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (lowStock === 'true') {
            // Products where quantity <= minStock
            where.quantity = { lte: prisma.product.fields?.minStock ?? 5 };
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy: { name: 'asc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.product.count({ where }),
        ]);

        return successResponse({
            products,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('Products GET error:', error);
        return errorResponse('Internal server error', 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user || !hasRole(user, ['OWNER', 'MANAGER'])) {
            return errorResponse('Insufficient permissions', 403);
        }

        const data = await req.json();
        const { name, barcode, category, price, costPrice, quantity, unit, minStock, expiryDate } = data;

        if (!name || !category || price === undefined) {
            return errorResponse('Name, category and price are required', 400);
        }

        const product = await prisma.product.create({
            data: {
                name,
                barcode: barcode || null,
                category,
                price: parseFloat(price),
                costPrice: parseFloat(costPrice || '0'),
                quantity: parseInt(quantity || '0'),
                unit: unit || 'pcs',
                minStock: parseInt(minStock || '5'),
                expiryDate: expiryDate ? new Date(expiryDate) : null,
            },
        });

        return successResponse(product, 201);
    } catch (error: unknown) {
        if ((error as { code?: string }).code === 'P2002') {
            return errorResponse('A product with this barcode already exists', 409);
        }
        console.error('Products POST error:', error);
        return errorResponse('Internal server error', 500);
    }
}
