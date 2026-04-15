import { adminClient } from '@/lib/supabase/admin';
import { getUserFromRequest, errorResponse, successResponse } from '@/lib/auth';
import { calculateBillTotals } from '@/lib/billing';
import { transformRow } from '@/lib/utils';

type ProcessBillResult = { bill_id: string; bill_number: string };

export async function POST(req: Request) {
  const user = await getUserFromRequest();
  if (!user) return errorResponse('Unauthorized', 401);

  const { items, customerId, paymentMethod, paidAmount, discount, taxRate } = await req.json();
  if (!items || !Array.isArray(items) || items.length === 0)
    return errorResponse('Cart is empty', 400);

  const totals = calculateBillTotals({
    subtotal: items.reduce((s: number, i: any) => s + i.price * i.quantity, 0),
    discount: discount || 0,
    taxRatePercent: typeof taxRate === 'number' ? taxRate : 5,
  });

  const pItems = items.map((item: any) => ({
    product_id: item.productId,
    quantity: item.quantity,
    price: item.price,
    cost_price: item.costPrice ?? 0,
    total: item.price * item.quantity,
  }));

  const { data: rpcData, error: rpcError } = await adminClient.rpc('process_bill', {
    p_items: pItems,
    p_subtotal: totals.subtotal,
    p_tax: totals.tax,
    p_discount: totals.discount,
    p_total: totals.total,
    p_payment_method: paymentMethod,
    p_paid_amount: paidAmount,
    p_change_amount: Math.max(0, paidAmount - totals.total),
    p_customer_id: customerId || null,
    p_user_id: user.id,
  });

  if (rpcError) return errorResponse(rpcError.message);

  const rid = rpcData as ProcessBillResult | null;
  if (!rid?.bill_id) return errorResponse('Billing failed', 500);

  const { data: bill, error: billError } = await adminClient
    .from('bills')
    .select()
    .eq('id', rid.bill_id)
    .single();

  if (billError || !bill) return errorResponse(billError?.message ?? 'Bill not found', 500);

  const normalizedBill = transformRow<Record<string, any>>(bill as Record<string, unknown>);

  return successResponse({
    ...normalizedBill,
    user: { name: user.name },
    customer: customerId ? { id: customerId } : null,
    items: items.map((item: any, index: number) => ({
      quantity: item.quantity,
      price: item.price,
      unitPrice: item.costPrice,
      total: item.price * item.quantity,
      product: {
        name: item.name || `Item ${index + 1}`,
        productCode: item.productCode || item.barcode || undefined,
      },
    })),
  }, 201);
}
