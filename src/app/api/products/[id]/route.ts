// ============================================================
// Single Product API
// GET    /api/products/:id — Get one product
// PUT    /api/products/:id — Update product
// DELETE /api/products/:id — Soft-delete product
// ============================================================

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return errorResponse('Unauthorized', 401);

        const { id } = await params;
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) return errorResponse('Product not found', 404);

        return successResponse(product);
    } catch (error) {
        console.error('Product GET error:', error);
        return errorResponse('Internal server error', 500);
    }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
    try {
        const user = getUserFromRequest(req);
        if (!user || !hasRole(user, ['OWNER', 'MANAGER'])) {
            return errorResponse('Insufficient permissions', 403);
        }

        const { id } = await params;
        const data = await req.json();

        // Clean the update data — only include provided fields
        const updateData: Record<string, unknown> = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.barcode !== undefined) updateData.barcode = data.barcode || null;
        if (data.category !== undefined) updateData.category = data.category;
        if (data.price !== undefined) updateData.price = parseFloat(data.price);
        if (data.costPrice !== undefined) updateData.costPrice = parseFloat(data.costPrice);
        if (data.quantity !== undefined) updateData.quantity = parseInt(data.quantity);
        if (data.unit !== undefined) updateData.unit = data.unit;
        if (data.minStock !== undefined) updateData.minStock = parseInt(data.minStock);
        if (data.expiryDate !== undefined) updateData.expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;

        const product = await prisma.product.update({
            where: { id },
            data: updateData,
        });

        return successResponse(product);
    } catch (error) {
        console.error('Product PUT error:', error);
        return errorResponse('Internal server error', 500);
    }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
    try {
        const user = getUserFromRequest(req);
        if (!user || !hasRole(user, ['OWNER'])) {
            return errorResponse('Only owners can delete products', 403);
        }

        const { id } = await params;

        // Soft delete — mark as inactive
        await prisma.product.update({
            where: { id },
            data: { active: false },
        });

        return successResponse({ message: 'Product deleted' });
    } catch (error) {
        console.error('Product DELETE error:', error);
        return errorResponse('Internal server error', 500);
    }
}
