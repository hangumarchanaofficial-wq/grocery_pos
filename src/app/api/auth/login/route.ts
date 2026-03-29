// ============================================================
// POST /api/auth/login — Authenticate user and return JWT
// ============================================================

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signToken } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        // Validate input
        if (!email || !password) {
            return errorResponse('Email and password are required', 400);
        }

        // Find user by email
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.active) {
            return errorResponse('Invalid credentials', 401);
        }

        // Verify password
        const isValid = await comparePassword(password, user.password);
        if (!isValid) {
            return errorResponse('Invalid credentials', 401);
        }

        // Generate JWT
        const token = signToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        return successResponse({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return errorResponse('Internal server error', 500);
    }
}
