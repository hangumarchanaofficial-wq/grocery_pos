import { adminClient } from '@/lib/supabase/admin';
import { getUserFromRequest, hasRole, errorResponse, successResponse } from '@/lib/auth';
import { transformRows, transformRow } from '@/lib/utils';

export async function GET(req: Request) {
  const user = await getUserFromRequest();
  if (!user) return errorResponse('Unauthorized', 401);

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');

  let query = adminClient
    .from('products')
    .select('*', { count: 'exact' })
    .eq('active', true)
    .order('name')
    .range((page - 1) * limit, page * limit - 1);

  if (search) query = query.ilike('name', '%' + search + '%');
  if (category) query = query.eq('category', category);

  const { data, count, error } = await query;
  if (error) return errorResponse(error.message);

  return successResponse({
    products: transformRows(data || []),
    pagination: { page, limit, total: count, totalPages: Math.ceil((count || 0) / limit) },
  });
}

export async function POST(req: Request) {
  const user = await getUserFromRequest();
  if (!user || !hasRole(user, 'OWNER', 'MANAGER'))
    return errorResponse('Insufficient permissions', 403);

  const body = await req.json();
  if (!body.name || !body.category || body.price === undefined)
    return errorResponse('Name, category and price are required');

  const { data, error } = await adminClient
    .from('products')
    .insert({
      name: body.name,
      barcode: body.barcode || null,
      category: body.category,
      price: parseFloat(body.price),
      cost_price: parseFloat(body.costPrice || 0),
      quantity: parseInt(body.quantity || 0),
      unit: body.unit || 'pcs',
      min_stock: parseInt(body.minStock || 5),
      expiry_date: body.expiryDate || null,
    })
    .select()
    .single();

  if (error) return errorResponse(
    error.code === '23505' ? 'A product with this barcode already exists' : error.message,
    error.code === '23505' ? 409 : 400
  );
  return successResponse(transformRow(data as Record<string, unknown>), 201);
}
