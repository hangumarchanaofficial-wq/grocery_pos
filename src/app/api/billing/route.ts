import { adminClient } from '@/lib/supabase/admin';
import { getUserFromRequest, hasRole, errorResponse, successResponse } from '@/lib/auth';
import { calculateBillTotals } from '@/lib/billing';
import { transformRow, transformRows } from '@/lib/utils';

type ProcessBillResult = { bill_id: string; bill_number: string };
type BillingItem = {
  productId: string;
  quantity: number;
  price: number;
  costPrice?: number;
};

export async function GET(req: Request) {
  const user = await getUserFromRequest();
  if (!user || !hasRole(user, ['OWNER'])) {
    return errorResponse('Insufficient permissions', 403);
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25', 10)));

  const { data, count, error } = await adminClient
    .from('bills')
    .select('id, bill_number, total, payment_method, paid_amount, change_amount, created_at, customers(name), users(name)', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) return errorResponse(error.message);

  return successResponse({
    bills: transformRows(data || []),
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.max(1, Math.ceil((count || 0) / limit)),
    },
  });
}

function isMissingProcessBillFunction(message?: string): boolean {
  if (!message) return false;
  return (
    message.includes('Could not find the function public.process_bill') ||
    message.includes('function public.process_bill') ||
    message.includes('process_bill(')
  );
}

async function processBillFallback(args: {
  items: BillingItem[];
  customerId: string | null;
  paymentMethod: string;
  paidAmount: number;
  totals: { subtotal: number; tax: number; discount: number; total: number };
  userId: string;
}): Promise<{ billId: string }> {
  const { items, customerId, paymentMethod, paidAmount, totals, userId } = args;

  for (const item of items) {
    const { data: product, error: productErr } = await adminClient
      .from('products')
      .select('id, name, quantity, active')
      .eq('id', item.productId)
      .single();
    if (productErr || !product) {
      throw new Error('Product not found');
    }
    if (!product.active) {
      throw new Error('One or more products are unavailable');
    }
    if (Number(product.quantity || 0) < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name ?? 'a product'}`);
    }
  }

  const billNumber = `BILL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now()
    .toString()
    .slice(-6)}`;

  const { data: billRow, error: billErr } = await adminClient
    .from('bills')
    .insert({
      bill_number: billNumber,
      subtotal: totals.subtotal,
      tax: totals.tax,
      discount: totals.discount,
      total: totals.total,
      payment_method: paymentMethod,
      paid_amount: paidAmount,
      change_amount: Math.max(0, paidAmount - totals.total),
      customer_id: customerId,
      user_id: userId,
    })
    .select('id')
    .single();
  if (billErr || !billRow?.id) {
    throw new Error(billErr?.message || 'Billing failed');
  }

  for (const item of items) {
    const { data: freshProduct, error: freshErr } = await adminClient
      .from('products')
      .select('quantity')
      .eq('id', item.productId)
      .single();
    if (freshErr || !freshProduct) throw new Error(freshErr?.message || 'Billing failed');
    const nextQty = Math.max(0, Number(freshProduct.quantity || 0) - item.quantity);
    const { error: setQtyErr } = await adminClient
      .from('products')
      .update({ quantity: nextQty })
      .eq('id', item.productId);
    if (setQtyErr) throw new Error(setQtyErr.message);
  }

  const billItems = items.map((item) => ({
    bill_id: billRow.id,
    product_id: item.productId,
    quantity: item.quantity,
    price: item.price,
    cost_price: item.costPrice ?? 0,
    total: item.price * item.quantity,
  }));
  const { error: itemsErr } = await adminClient.from('bill_items').insert(billItems);
  if (itemsErr) throw new Error(itemsErr.message);

  return { billId: billRow.id as string };
}

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

  let billId: string | null = null;
  if (rpcError) {
    if (!isMissingProcessBillFunction(rpcError.message)) {
      return errorResponse(rpcError.message);
    }
    try {
      const fallback = await processBillFallback({
        items: items as BillingItem[],
        customerId: customerId || null,
        paymentMethod,
        paidAmount,
        totals,
        userId: user.id,
      });
      billId = fallback.billId;
    } catch (fallbackErr: any) {
      return errorResponse(fallbackErr?.message || 'Billing failed');
    }
  } else {
    const rid = rpcData as ProcessBillResult | null;
    if (!rid?.bill_id) return errorResponse('Billing failed', 500);
    billId = rid.bill_id;
  }

  const { data: bill, error: billError } = await adminClient
    .from('bills')
    .select()
    .eq('id', billId)
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
