import { adminClient } from '@/lib/supabase/admin';
import { getUserFromRequest, hasRole, errorResponse, successResponse } from '@/lib/auth';
import { transformRow } from '@/lib/utils';

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: RouteParams) {
  const user = await getUserFromRequest();
  if (!user) return errorResponse('Unauthorized', 401);
  const { id } = await params;
  const { data, error } = await adminClient.from('products').select('*').eq('id', id).single();
  if (error || !data) return errorResponse('Product not found', 404);
  return successResponse(transformRow(data as Record<string, unknown>));
}

export async function PUT(req: Request, { params }: RouteParams) {
  const user = await getUserFromRequest();
  if (!user || !hasRole(user, 'OWNER', 'MANAGER'))
    return errorResponse('Insufficient permissions', 403);
  const { id } = await params;
  const body = await req.json();

  const update: Record<string, unknown> = {};
  if (body.name       !== undefined) update.name        = body.name;
  if (body.barcode    !== undefined) update.barcode      = body.barcode    || null;
  if (body.category   !== undefined) update.category     = body.category;
  if (body.price      !== undefined) update.price        = parseFloat(body.price);
  if (body.costPrice  !== undefined) update.cost_price   = parseFloat(body.costPrice);
  if (body.quantity   !== undefined) update.quantity     = parseInt(body.quantity);
  if (body.unit       !== undefined) update.unit         = body.unit;
  if (body.minStock   !== undefined) update.min_stock    = parseInt(body.minStock);
  if (body.expiryDate !== undefined) update.expiry_date  = body.expiryDate || null;

  const { data, error } = await adminClient
    .from('products').update(update).eq('id', id).select().single();
  if (error) return errorResponse(error.message);
  return successResponse(transformRow(data as Record<string, unknown>));
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const user = await getUserFromRequest();
  if (!user || !hasRole(user, 'OWNER'))
    return errorResponse('Only owners can delete products', 403);
  const { id } = await params;
  const { error } = await adminClient
    .from('products').update({ active: false }).eq('id', id);
  if (error) return errorResponse(error.message);
  return successResponse({ message: 'Product deleted' });
}
