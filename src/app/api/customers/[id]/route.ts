// ============================================================
// Single Customer API
// GET    /api/customers/:id — Get customer with purchase history
// PUT    /api/customers/:id — Update customer
// DELETE /api/customers/:id — Remove customer
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

        const customer = await prisma.customer.findUnique({
            where: { id },
            include: {
                bills: {
                    include: {
                        items: {
                            include: { product: { select: { name: true, category: true } } },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
            },
        });

        if (!customer) return errorResponse('Customer not found', 404);

        // Calculate customer stats
        const totalSpent = customer.bills.reduce((sum, bill) => sum + bill.total, 0);
        const visitCount = customer.bills.length;

        // Find favorite products
        const productCounts: Record<string, { name: string; count: number }> = {};
        customer.bills.forEach((bill) => {
            bill.items.forEach((item) => {
                const name = item.product.name;
                if (!productCounts[name]) productCounts[name] = { name, count: 0 };
                productCounts[name].count += item.quantity;
            });
        });

        const favoriteProducts = Object.values(productCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
            .map((p) => p.name);

        return successResponse({
            ...customer,
            stats: { totalSpent, visitCount, favoriteProducts },
        });
    } catch (error) {
        console.error('Customer GET error:', error);
        return errorResponse('Internal server error', 500);
    }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return errorResponse('Unauthorized', 401);

        const { id } = await params;
        const data = await req.json();

        const updateData: Record<string, unknown> = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.email !== undefined) updateData.email = data.email || null;
        if (data.address !== undefined) updateData.address = data.address || null;

        const customer = await prisma.customer.update({
            where: { id },
            data: updateData,
        });

        return successResponse(customer);
    } catch (error) {
        console.error('Customer PUT error:', error);
        return errorResponse('Internal server error', 500);
    }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
    try {
        const user = getUserFromRequest(req);
        if (!user || !hasRole(user, ['OWNER', 'MANAGER'])) {
            return errorResponse('Insufficient permissions', 403);
        }

        const { id } = await params;
        await prisma.customer.delete({ where: { id } });

        return successResponse({ message: 'Customer deleted' });
    } catch (error) {
        console.error('Customer DELETE error:', error);
        return errorResponse('Internal server error', 500);
    }
}
