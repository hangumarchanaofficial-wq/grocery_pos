// ============================================================
// Utility Functions
// ============================================================

import { clsx, type ClassValue } from 'clsx';

/** Merge Tailwind class names safely */
export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

/** Generate a unique bill number: BILL-YYYYMMDD-XXX */
export function generateBillNumber(sequenceNum: number): string {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    return `BILL-${dateStr}-${String(sequenceNum).padStart(3, '0')}`;
}

/** Format currency (Sri Lankan Rupees) */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 2,
    }).format(amount);
}

/** Standard JSON error response */
export function errorResponse(message: string, status: number = 400) {
    return Response.json({ error: message }, { status });
}

/** Standard JSON success response */
export function successResponse(data: unknown, status: number = 200) {
    return Response.json(data, { status });
}

/** Calculate days between two dates */
export function daysBetween(date1: Date, date2: Date): number {
    const diff = date2.getTime() - date1.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}


// -- snake_case to camelCase transform ---------------------
function toCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

export function transformRow<T = Record<string, unknown>>(
  obj: Record<string, unknown>
): T {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    const camel = toCamel(key);
    const val = obj[key];
    if (Array.isArray(val)) {
      result[camel] = val.map((item) =>
        item && typeof item === 'object' ? transformRow(item as Record<string, unknown>) : item
      );
    } else if (val && typeof val === 'object' && !(val instanceof Date)) {
      result[camel] = transformRow(val as Record<string, unknown>);
    } else {
      result[camel] = val;
    }
  }
  return result as T;
}

export function transformRows<T = Record<string, unknown>>(
  rows: Record<string, unknown>[]
): T[] {
  return rows.map((r) => transformRow<T>(r));
}
