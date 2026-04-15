import { getCachedFullAnalysis } from "@/lib/ai/cachedFullAnalysis";
import { getUserFromRequest, hasRole, errorResponse, successResponse } from "@/lib/auth";
import { missingSupabaseServerEnvResponse } from "@/lib/supabase/serverEnv";

export async function GET() {
  const envErr = missingSupabaseServerEnvResponse();
  if (envErr) return envErr;

  const user = await getUserFromRequest();
  if (!user) return errorResponse("Unauthorized", 401);
  if (!hasRole(user, ["OWNER", "MANAGER"])) return errorResponse("Forbidden", 403);

  const data = await getCachedFullAnalysis('full');
  return successResponse(data);
}
