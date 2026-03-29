import { adminClient } from '@/lib/supabase/admin';
import { getUserFromRequest, errorResponse, successResponse } from '@/lib/auth';
import { transformRow } from '@/lib/utils';

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: RouteParams) {
  const user = await getUserFromRequest();
  if (!user) return errorResponse('Unauthorized', 401);
  const { id } = await params;

  const { data, error } = await adminClient
    .from('bills')
    .select('*, bill_items(*, products(name, barcode, category, unit)), customers(*), users(name, email)')
    .eq('id', id)
    .single();

  if (error || !data) return errorResponse('Bill not found', 404);
  return successResponse(transformRow(data as Record<string, unknown>));
}
