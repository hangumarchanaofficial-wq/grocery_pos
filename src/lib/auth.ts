// ============================================================
// JWT Authentication Helpers
// Handles token creation, verification, and middleware
// ============================================================

import jwt, { type SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];
export const DEV_AUTH_BYPASS_ENABLED =
    process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEV_SKIP_AUTH !== 'false';
export const DEV_AUTH_BYPASS_TOKEN = 'dev-bypass-token';

// Token payload shape
export interface TokenPayload {
    userId: string;
    email: string;
    role: Role;
}

export const DEV_AUTH_BYPASS_USER: TokenPayload & { name: string } = {
    userId: 'dev-owner',
    name: 'Dev Owner',
    email: 'owner@grocerypos.com',
    role: 'OWNER',
};

export const DEV_AUTH_BYPASS_CLIENT_USER = {
    id: DEV_AUTH_BYPASS_USER.userId,
    name: DEV_AUTH_BYPASS_USER.name,
    email: DEV_AUTH_BYPASS_USER.email,
    role: DEV_AUTH_BYPASS_USER.role,
} as const;

/** Create a signed JWT token */
export function signToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/** Verify and decode a JWT token */
export function verifyToken(token: string): TokenPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
        return null;
    }
}

/** Hash a plain-text password */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

/** Compare plain-text password with hash */
export async function comparePassword(
    password: string,
    hash: string
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Extract and verify user from the Authorization header.
 * Returns the user payload or null if unauthorized.
 */
export function getUserFromRequest(req: NextRequest): TokenPayload | null {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return DEV_AUTH_BYPASS_ENABLED ? DEV_AUTH_BYPASS_USER : null;
    }

    const token = authHeader.split(' ')[1];
    if (DEV_AUTH_BYPASS_ENABLED && token === DEV_AUTH_BYPASS_TOKEN) {
        return DEV_AUTH_BYPASS_USER;
    }
    return verifyToken(token);
}

/**
 * Role-based access check.
 * Pass allowed roles; returns true if user's role is included.
 */
export function hasRole(user: TokenPayload, allowedRoles: Role[]): boolean {
    return allowedRoles.includes(user.role);
}
