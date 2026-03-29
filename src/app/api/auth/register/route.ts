import { adminClient } from '@/lib/supabase/admin';
import { getUserFromRequest, hasRole, errorResponse, successResponse } from '@/lib/auth';

export async function POST(req: Request) {
  const caller = await getUserFromRequest();
  if (!caller || !hasRole(caller, 'OWNER'))
    return errorResponse('Only owners can create users', 403);

  const { name, email, password, role = 'CASHIER' } = await req.json();
  if (!name || !email || !password)
    return errorResponse('Name, email and password are required');

  const { data: authData, error: authErr } =
    await adminClient.auth.admin.createUser({ email, password, email_confirm: true });
  if (authErr) return errorResponse(authErr.message, 400);

  const { data: profile, error: profileErr } = await adminClient
    .from('users')
    .insert({ id: authData.user.id, name, role })
    .select()
    .single();

  if (profileErr) return errorResponse(profileErr.message);
  return successResponse(profile, 201);
}
