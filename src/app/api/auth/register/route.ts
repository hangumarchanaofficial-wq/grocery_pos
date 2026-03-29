// ============================================================
// POST /api/auth/register — Create new user (Owner only)
// ============================================================

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasRole, hashPassword } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';

export async function POST(req: NextRequest) {
    try {
        const currentUser = getUserFromRequest(req);
        if (!currentUser || !hasRole(currentUser, ['OWNER'])) {
            return errorResponse('Only owners can create users', 403);
        }

        const { name, email, password, role } = await req.json();

        if (!name || !email || !password) {
            return errorResponse('Name, email and password are required', 400);
        }

        // Check if email already exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return errorResponse('Email already in use', 409);
        }

        const hashed = await hashPassword(password);
        const user = await prisma.user.create({
            data: { name, email, password: hashed, role: role || 'CASHIER' },
            select: { id: true, name: true, email: true, role: true },
        });

        return successResponse(user, 201);
    } catch (error) {
        console.error('Register error:', error);
        return errorResponse('Internal server error', 500);
    }
}
