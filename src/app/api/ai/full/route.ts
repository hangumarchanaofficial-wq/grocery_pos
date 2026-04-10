import { runFullAnalysis } from "@/ai/engine";
import { getUserFromRequest, hasRole, errorResponse, successResponse } from "@/lib/auth";
export async function GET() {
  const user = await getUserFromRequest();
  if (!user) return errorResponse("Unauthorized", 401);
  if (!hasRole(user, "OWNER", "MANAGER")) return errorResponse("Forbidden", 403);
  const data = await runFullAnalysis();
  return successResponse(data);
}
