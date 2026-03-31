import { adminClient } from '@/lib/supabase/admin';
import { getUserFromRequest, errorResponse, successResponse } from '@/lib/auth';
import { transformRows, transformRow } from '@/lib/utils';

export async function GET(req: Request) {
  const user = await getUserFromRequest();
  if (!user) return errorResponse('Unauthorized', 401);

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const page   = parseInt(searchParams.get('page')  || '1');
  const limit  = parseInt(searchParams.get('limit') || '50');

  let query = adminClient
    .from('customers')
    .select('id, name, phone, email, address, created_at, bills(id)', { count: 'exact' })
    .order('name')
    .range((page - 1) * limit, page * limit - 1);

  if (search) query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);

  const { data, count, error } = await query;
  if (error) return errorResponse(error.message);

  const customers = (data || []).map((c: Record<string, unknown>) => ({
    ...transformRow(c),
    _count: { bills: Array.isArray(c.bills) ? (c.bills as unknown[]).length : 0 },
  }));

  return successResponse(customers);
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