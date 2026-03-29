import { createClient } from './supabase/server';
import { adminClient } from './supabase/admin';

export interface AuthUser {
  id: string;
  name: string;
  role: 'OWNER' | 'MANAGER' | 'CASHIER';
  active: boolean;
}

export async function getUserFromRequest(): Promise<AuthUser | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const { data: profile } = await adminClient
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

export function hasRole(user: AuthUser | null, ...roles: string[]): boolean {
  return !!user && roles.includes(user.role);
}

export function errorResponse(message: string, status = 400): Response {
  return Response.json({ error: message }, { status });
}

export function successResponse(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}
