import { runFullAnalysis } from '@/ai/engine';
import { getUserFromRequest, errorResponse, successResponse } from '@/lib/auth';

export async function GET() {
  const user = await getUserFromRequest();
  if (!user) return errorResponse('Unauthorized', 401);
  const { alerts } = await runFullAnalysis();
  return successResponse(alerts);
}
