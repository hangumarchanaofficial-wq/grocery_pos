import { getUserFromRequest, errorResponse, successResponse } from '@/lib/auth';
import { missingSupabaseServerEnvResponse } from '@/lib/supabase/serverEnv';

export async function GET() {
  const envErr = missingSupabaseServerEnvResponse();
  if (envErr) return envErr;

  try {
    const user = await getUserFromRequest();
    if (!user) return errorResponse('Unauthorized', 401);
    return successResponse(user);
  } catch (e) {
    console.error('[api/auth/me]', e);
    return errorResponse('Server configuration error', 500);
  }
}
