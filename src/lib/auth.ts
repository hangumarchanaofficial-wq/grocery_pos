import { createClient } from './supabase/server';
import { getAdminClient } from './supabase/admin';

export interface AuthUser {
  id: string;
  name: string;
  role: 'OWNER' | 'MANAGER' | 'CASHIER';
  active: boolean;
}

function authUserFromMetadata(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
}): AuthUser | null {
  const m = user.user_metadata;
  if (!m) return null;
  const role = m.role;
  if (role !== 'OWNER' && role !== 'MANAGER' && role !== 'CASHIER') return null;
  const name = typeof m.name === 'string' && m.name.trim() ? m.name : (user.email ?? 'User');
  const active = m.active !== false;
  if (!active) return null;
  return { id: user.id, name, role, active: true };
}

/**
 * Fast “is someone logged in?” check for hot read routes (e.g. POS product search).
 * Uses the session from cookies — no extra round trip to Supabase Auth.
 * `/api/*` is still protected by middleware; this avoids duplicating `getUser()` + DB profile work per request.
 */
export async function getSessionUserId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function getUserFromRequest(): Promise<AuthUser | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const fromMeta = authUserFromMetadata(user);
    if (fromMeta) return fromMeta;

    const admin = getAdminClient();
    if (!admin) return null;

    const { data: profile } = await admin
      .from('users')
      .select('id, name, role, active')
      .eq('id', user.id)
      .single();

    if (!profile || !profile.active) return null;
    return profile as AuthUser;
  } catch {
    return null;
  }
}

export function hasRole(user: AuthUser | null, roles: string | string[]): boolean {
  if (!user) return false;
  const arr = Array.isArray(roles) ? roles : [roles];
  return arr.includes(user.role);
}

export function errorResponse(message: string, status = 400): Response {
  return Response.json({ error: message }, { status });
}

export function successResponse(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}
