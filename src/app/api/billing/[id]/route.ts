// ============================================================
// GET /api/billing/:id — Get single bill with full details
// ============================================================

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return errorResponse('Unauthorized', 401);

        const { id } = await params;

        const bill = await prisma.bill.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: {
                            select: { name: true, barcode: true, category: true, unit: true },
                        },
                    },
                },
                customer: true,
                user: { select: { name: true, email: true } },
            },
        });

        if (!bill) return errorResponse('Bill not found', 404);

        return successResponse(bill);
    } catch (error) {
        console.error('Bill GET error:', error);
        return errorResponse('Internal server error', 500);
    }
}
