// ============================================================
// Customers API
// GET  /api/customers  — List all customers
// POST /api/customers  — Create new customer
// ============================================================

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return errorResponse('Unauthorized', 401);

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');

        const where: Record<string, unknown> = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
            ];
        }

        const customers = await prisma.customer.findMany({
            where,
            include: {
                _count: { select: { bills: true } },
            },
            orderBy: { name: 'asc' },
        });

        return successResponse(customers);
    } catch (error) {
        console.error('Customers GET error:', error);
        return errorResponse('Internal server error', 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return errorResponse('Unauthorized', 401);

        const { name, phone, email, address } = await req.json();

        if (!name || !phone) {
            return errorResponse('Name and phone are required', 400);
        }

        // Check if phone already exists
        const existing = await prisma.customer.findUnique({ where: { phone } });
        if (existing) {
            return errorResponse('Customer with this phone already exists', 409);
        }

        const customer = await prisma.customer.create({
            data: { name, phone, email: email || null, address: address || null },
        });

        return successResponse(customer, 201);
    } catch (error) {
        console.error('Customer POST error:', error);
        return errorResponse('Internal server error', 500);
    }
}
