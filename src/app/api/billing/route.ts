import { adminClient } from '@/lib/supabase/admin';
import { getUserFromRequest, errorResponse, successResponse } from '@/lib/auth';

export async function POST(req: Request) {
  const user = await getUserFromRequest();
  if (!user) return errorResponse('Unauthorized', 401);

  const { items, customerId, paymentMethod, paidAmount, discount } = await req.json();
  if (!items || !Array.isArray(items) || items.length === 0)
    return errorResponse('Cart is empty', 400);

  // Calculate totals
  const subtotal = items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
  const tax      = Math.round(subtotal * 0.05 * 100) / 100;
  const disc     = discount || 0;
  const total    = subtotal + tax - disc;

  const billNumber = `BILL-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Date.now().toString().slice(-4)}`;

  // ── Insert bill ──
  const { data: bill, error: billError } = await adminClient
    .from('bills')
    .insert({
      bill_number:    billNumber,
      subtotal,
      tax,
      discount:       disc,
      total,
      payment_method: paymentMethod,
      paid_amount:    paidAmount,
      change_amount:  Math.max(0, paidAmount - total),
      customer_id:    customerId || null,
      user_id:        user.id,
    })
    .select()
    .single();

  if (billError) return errorResponse(billError.message);

  // ── Insert bill items ──
  const billItems = items.map((item: any) => ({
    bill_id:    bill.id,
    product_id: item.productId,
    quantity:   item.quantity,
    price:      item.price,
    cost_price: item.costPrice || 0,
    total:      item.price * item.quantity,
  }));

  const { error: itemsError } = await adminClient
    .from('bill_items')
    .insert(billItems);

  if (itemsError) return errorResponse(itemsError.message);

  // ── Decrement stock ──
  for (const item of items) {
    await adminClient.rpc('decrement_stock', {
      p_product_id: item.productId,
      p_quantity:   item.quantity,
    });
  }

  return successResponse({ ...bill, items: billItems }, 201);
}
