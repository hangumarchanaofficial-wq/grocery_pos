import { adminClient } from '@/lib/supabase/admin';
import { getSessionUserId, errorResponse, successResponse } from '@/lib/auth';
import { sanitizeIlikePattern } from '@/lib/sanitizeSearch';
import { transformRows } from '@/lib/utils';

/** Enough for POS table pagination (10/page); keeps ilike scans smaller. */
const SEARCH_RESULT_LIMIT = 40;

const PRODUCT_SEARCH_COLUMNS =
  'id, name, barcode, price, cost_price, quantity, unit, category';

export async function GET(req: Request) {
  const uid = await getSessionUserId();
  if (!uid) return errorResponse('Unauthorized', 401);

  const raw = new URL(req.url).searchParams.get('q') || '';
  const q = sanitizeIlikePattern(raw);
  if (q.length < 1) return successResponse([]);

  // Fast path: full barcode / numeric SKU — btree on barcode beats leading-% ilike.
  if (/^\d+$/.test(q) && q.length >= 6) {
    const { data: exact, error: exactErr } = await adminClient
      .from('products')
      .select(PRODUCT_SEARCH_COLUMNS)
      .eq('active', true)
      .gt('quantity', 0)
      .eq('barcode', q)
      .maybeSingle();
    if (!exactErr && exact) {
      return successResponse(transformRows([exact]));
    }
  }

  const { data, error } = await adminClient
    .from('products')
    .select(PRODUCT_SEARCH_COLUMNS)
    .eq('active', true)
    .gt('quantity', 0)
    .or(`name.ilike.%${q}%,barcode.ilike.%${q}%`)
    .order('name')
    .limit(SEARCH_RESULT_LIMIT);

  if (error) return errorResponse(error.message);
  return successResponse(transformRows(data || []));
}
