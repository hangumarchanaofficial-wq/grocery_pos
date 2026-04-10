import { generatePricingSuggestions } from "@/ai/pricingSuggestions";
import { getUserFromRequest, errorResponse, successResponse } from "@/lib/auth";
export async function GET() {
  const user = await getUserFromRequest();
  if (!user) return errorResponse("Unauthorized", 401);
  const data = await generatePricingSuggestions();
  return successResponse(data);
}
