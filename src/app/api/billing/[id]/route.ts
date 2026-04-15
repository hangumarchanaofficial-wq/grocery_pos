import { adminClient } from '@/lib/supabase/admin';
import { getUserFromRequest, errorResponse, successResponse } from '@/lib/auth';
import { transformRow } from '@/lib/utils';

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: RouteParams) {
  const user = await getUserFromRequest();
  if (!user) return errorResponse('Unauthorized', 401);
  const { id } = await params;

  const { data: bill, error: billError } = await adminClient
    .from('bills')
    .select('*, customers(*), users(name)')
    .eq('id', id)
    .single();

  if (billError || !bill) return errorResponse('Bill not found', 404);

  const { data: billItems, error: itemsError } = await adminClient
    .from('bill_items')
    .select('*, products(name, barcode, category, unit)')
    .eq('bill_id', id);

  if (itemsError) return errorResponse(itemsError.message, 500);

  const normalizedBill = transformRow<Record<string, unknown>>(bill as Record<string, unknown>);
  return successResponse({
    ...normalizedBill,
    billItems: (billItems || []).map((item) => transformRow(item as Record<string, unknown>)),
  });
}
