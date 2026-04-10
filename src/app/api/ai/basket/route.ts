import { generateBasketAnalysis } from "@/ai/basket";
import { getUserFromRequest, errorResponse, successResponse } from "@/lib/auth";
export async function GET() {
  const user = await getUserFromRequest();
  if (!user) return errorResponse("Unauthorized", 401);
  const data = await generateBasketAnalysis();
  return successResponse(data);
}
