import { adminClient } from '@/lib/supabase/admin';
import { getUserFromRequest, errorResponse, successResponse } from '@/lib/auth';
import { sanitizeIlikePattern } from '@/lib/sanitizeSearch';
import { transformRows, transformRow } from '@/lib/utils';

function billCountFromRow(c: Record<string, unknown>): number {
  const bills = c.bills as { count?: number }[] | undefined;
  if (Array.isArray(bills) && bills[0] && typeof bills[0].count === 'number') {
    return Number(bills[0].count);
  }
  return 0;
}

export async function GET(req: Request) {
  const user = await getUserFromRequest();
  if (!user) return errorResponse('Unauthorized', 401);

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const page   = parseInt(searchParams.get('page')  || '1');
  const limit  = parseInt(searchParams.get('limit') || '50');

  let query = adminClient
    .from('customers')
    .select('id, name, phone, email, address, created_at, bills(count)', { count: 'exact' })
    .order('name')
    .range((page - 1) * limit, page * limit - 1);

  if (search) {
    const q = sanitizeIlikePattern(search);
    if (q) query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%`);
  }

  const { data, count, error } = await query;
  if (error) return errorResponse(error.message);

  const customers = (data || []).map((c: Record<string, unknown>) => {
    const { bills: _b, ...rest } = c;
    return {
      ...(transformRow<Record<string, unknown>>(rest)),
      _count: { bills: billCountFromRow(c) },
    };
  });

  return successResponse({
    customers,
    total: count ?? 0,
    page,
    limit,
  });
}

export async function POST(req: Request) {
  const user = await getUserFromRequest();
  if (!user) return errorResponse('Unauthorized', 401);

  const { name, phone, email, address } = await req.json();
  if (!name || !phone) return errorResponse('Name and phone are required', 400);

  const { data, error } = await adminClient
    .from('customers')
    .insert({ name, phone, email: email || null, address: address || null })
    .select()
    .single();

  if (error) return errorResponse(
    error.code === '23505' ? 'Customer with this phone already exists' : error.message,
    error.code === '23505' ? 409 : 400
  );

  return successResponse(transformRow(data as Record<string, unknown>), 201);
}
