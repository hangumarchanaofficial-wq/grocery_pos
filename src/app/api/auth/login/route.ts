import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { errorResponse, successResponse } from '@/lib/auth';
import { missingSupabaseServerEnvResponse } from '@/lib/supabase/serverEnv';

export async function POST(req: Request) {
  const envErr = missingSupabaseServerEnvResponse();
  if (envErr) return envErr;

  const { email, password } = await req.json();
  if (!email || !password) return errorResponse('Email and password required');

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return errorResponse('Invalid email or password', 401);

  const admin = getAdminClient();
  if (!admin) return errorResponse('Server configuration error', 503);

  const { data: profile } = await admin
    .from('users')
    .select('id, name, role, active')
    .eq('id', data.user.id)
    .single();

  if (!profile?.active) return errorResponse('Account is disabled', 403);
  return successResponse({ user: profile });
}
