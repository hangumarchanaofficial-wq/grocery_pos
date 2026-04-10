import { adminClient } from '@/lib/supabase/admin';
import { getUserFromRequest, hasRole, errorResponse, successResponse } from '@/lib/auth';
import { transformRow } from '@/lib/utils';

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: RouteParams) {
  const user = await getUserFromRequest();
  if (!user) return errorResponse('Unauthorized', 401);
  const { id } = await params;

  const { data, error } = await adminClient
    .from('customers')
    .select('*, bills(id, bill_number, total, created_at, bill_items(quantity, price, products(name, category)))')
    .eq('id', id)
    .order('created_at', { referencedTable: 'bills', ascending: false })
    .single();

  if (error || !data) return errorResponse('Customer not found', 404);

  const bills = (data as Record<string, unknown[]>).bills || [];
  const totalSpent = (bills as { total: number }[]).reduce((s, b) => s + b.total, 0);

  const prodCounts: Record<string, { name: string; count: number }> = {};
  (bills as { bill_items: { quantity: number; products: { name: string } }[] }[]).forEach((b) =>
    b.bill_items?.forEach((item) => {
      const n = item.products?.name;
      if (!n) return;
      prodCounts[n] = prodCounts[n] || { name: n, count: 0 };
      prodCounts[n].count += item.quantity;
    })
  );
  const favoriteProducts = Object.values(prodCounts)
    .sort((a, b) => b.count - a.count).slice(0, 5).map((p) => p.name);

  return successResponse({
    ...(transformRow<Record<string, unknown>>(data as Record<string, unknown>)),
    stats: { totalSpent, visitCount: bills.length, favoriteProducts },
  });
}

export async function PUT(req: Request, { params }: RouteParams) {
  const user = await getUserFromRequest();
  if (!user) return errorResponse('Unauthorized', 401);
  const { id } = await params;
  const body = await req.json();

  const update: Record<string, unknown> = {};
  if (body.name    !== undefined) update.name    = body.name;
  if (body.phone   !== undefined) update.phone   = body.phone;
  if (body.email   !== undefined) update.email   = body.email   || null;
  if (body.address !== undefined) update.address = body.address || null;

  const { data, error } = await adminClient
    .from('customers').update(update).eq('id', id).select().single();
  if (error) return errorResponse(error.message);
  return successResponse(transformRow(data as Record<string, unknown>));
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const user = await getUserFromRequest();
  if (!user || !hasRole(user, 'OWNER', 'MANAGER'))
    return errorResponse('Insufficient permissions', 403);
  const { id } = await params;
  const { error } = await adminClient.from('customers').delete().eq('id', id);
  if (error) return errorResponse(error.message);
  return successResponse({ message: 'Customer deleted' });
}
