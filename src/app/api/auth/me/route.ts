// ============================================================
// GET /api/auth/me — Get current authenticated user
// ============================================================

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';

export async function GET(req: NextRequest) {
    const tokenUser = getUserFromRequest(req);
    if (!tokenUser) {
        return errorResponse('Unauthorized', 401);
    }

    const user = await prisma.user.findUnique({
        where: { id: tokenUser.userId },
        select: { id: true, name: true, email: true, role: true, active: true },
    });

    if (!user || !user.active) {
        return errorResponse('User not found', 404);
    }

    return successResponse(user);
}
