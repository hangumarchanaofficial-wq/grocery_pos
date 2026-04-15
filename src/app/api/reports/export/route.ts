import { adminClient } from '@/lib/supabase/admin';
import { getUserFromRequest, hasRole, errorResponse } from '@/lib/auth';
import { sanitizeCsvCell } from '@/lib/csv';

export async function GET(req: Request) {
  const user = await getUserFromRequest();
  if (!user || !hasRole(user, ['OWNER', 'MANAGER']))
    return errorResponse('Insufficient permissions', 403);

  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from') ? new Date(searchParams.get('from')!) : new Date(Date.now() - 30 * 86400000);
  const to   = searchParams.get('to')   ? new Date(searchParams.get('to')!)   : new Date();
  to.setHours(23, 59, 59, 999);

  const { data: bills } = await adminClient
    .from('bills')
    .select('bill_number, created_at, total, subtotal, tax, discount, payment_method, bill_items(quantity, products(name)), customers(name), users(name)')
    .gte('created_at', from.toISOString())
    .lte('created_at', to.toISOString())
    .order('created_at', { ascending: true });

  const headers = 'Bill Number,Date,Customer,Items,Subtotal,Tax,Discount,Total,Payment Method,Cashier\n';
  const rows = (bills || []).map((b: Record<string, unknown>) =>
    [
      b.bill_number,
      String(b.created_at).slice(0, 19).replace('T', ' '),
      (b.customers as { name?: string } | null)?.name || 'Walk-in',
      (b.bill_items as { quantity: number; products: { name: string } }[])?.map((i) => i.products?.name + ' x' + i.quantity).join('; '),
      b.subtotal, b.tax, b.discount, b.total, b.payment_method,
      (b.users as { name?: string } | null)?.name,
    ].map((c) => '"' + sanitizeCsvCell(String(c ?? '')).replace(/"/g, '""') + '"').join(',')
  );

  return new Response(headers + rows.join('\n'), {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="sales-' + from.toISOString().slice(0, 10) + '-' + to.toISOString().slice(0, 10) + '.csv"',
    },
  });
}

