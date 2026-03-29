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

/** Format currency (Indian Rupees) */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
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
