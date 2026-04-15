import { getCachedFullAnalysis } from '@/lib/ai/cachedFullAnalysis';
import { getUserFromRequest, errorResponse, successResponse } from '@/lib/auth';

export async function GET() {
  const user = await getUserFromRequest();
  if (!user) return errorResponse('Unauthorized', 401);
  const { predictions } = await getCachedFullAnalysis('dashboard');
  return successResponse(predictions);
}
