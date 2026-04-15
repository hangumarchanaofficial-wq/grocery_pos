import { adminClient } from '@/lib/supabase/admin';
import { getUserFromRequest, errorResponse, successResponse } from '@/lib/auth';
import { sanitizeIlikePattern } from '@/lib/sanitizeSearch';
import { transformRows } from '@/lib/utils';

export async function GET(req: Request) {
  const user = await getUserFromRequest();
  if (!user) return errorResponse('Unauthorized', 401);

  const raw = new URL(req.url).searchParams.get('q') || '';
  const q = sanitizeIlikePattern(raw);
  if (q.length < 1) return successResponse([]);

  const { data, error } = await adminClient
    .from('products')
    .select('id, name, barcode, price, cost_price, quantity, unit, category')
    .eq('active', true)
    .gt('quantity', 0)
    .or(`name.ilike.%${q}%,barcode.ilike.%${q}%`)
    .order('name')
    .limit(100);

  if (error) return errorResponse(error.message);
  return successResponse(transformRows(data || []));
}
