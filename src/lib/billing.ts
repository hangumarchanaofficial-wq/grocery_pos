export interface BillTotalsInput {
  subtotal: number;
  discount?: number;
  taxRatePercent?: number;
}

export interface BillTotals {
  subtotal: number;
  discount: number;
  discountedSubtotal: number;
  taxRatePercent: number;
  tax: number;
  total: number;
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateBillTotals({
  subtotal,
  discount = 0,
  taxRatePercent = 0,
}: BillTotalsInput): BillTotals {
  const safeSubtotal = roundCurrency(Math.max(0, subtotal));
  const safeDiscount = roundCurrency(Math.max(0, Math.min(discount, safeSubtotal)));
  const discountedSubtotal = roundCurrency(safeSubtotal - safeDiscount);
  const tax = roundCurrency(discountedSubtotal * (taxRatePercent / 100));
  const total = roundCurrency(discountedSubtotal + tax);

  return {
    subtotal: safeSubtotal,
    discount: safeDiscount,
    discountedSubtotal,
    taxRatePercent,
    tax,
    total,
  };
}
