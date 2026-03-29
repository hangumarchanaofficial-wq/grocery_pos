import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/auth';

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) return errorResponse('Email and password required');

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return errorResponse('Invalid email or password', 401);

  const { data: profile } = await adminClient
    .from('users')
    .select('id, name, role, active')
    .eq('id', data.user.id)
    .single();

  if (!profile?.active) return errorResponse('Account is disabled', 403);
  return successResponse({ user: profile });
}
