import { generateCustomerInsights } from "@/ai/customerInsights";
import { getUserFromRequest, errorResponse, successResponse } from "@/lib/auth";
export async function GET() {
  const user = await getUserFromRequest();
  if (!user) return errorResponse("Unauthorized", 401);
  const data = await generateCustomerInsights();
  return successResponse(data);
}
