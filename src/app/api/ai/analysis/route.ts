import { getCachedFullAnalysis } from '@/lib/ai/cachedFullAnalysis';
import { getUserFromRequest, errorResponse, successResponse } from '@/lib/auth';
import { missingSupabaseServerEnvResponse } from '@/lib/supabase/serverEnv';

export async function GET() {
  const envErr = missingSupabaseServerEnvResponse();
  if (envErr) return envErr;

  const user = await getUserFromRequest();
  if (!user) return errorResponse('Unauthorized', 401);

  const analysis = await getCachedFullAnalysis('dashboard');
  return successResponse(analysis);
}
