// ============================================================
// Receipt — Printable/Digital bill receipt
// ============================================================

'use client';

import { forwardRef } from 'react';
import { formatCurrency } from '@/lib/utils';

export interface ReceiptBill {
    billNumber: string;
    createdAt: string;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    paymentMethod: string;
    paidAmount: number;
    changeAmount: number;
    customer?: { name: string; phone: string } | null;
    user: { name: string };
    items: {
        quantity: number;
        price: number;
        total: number;
        product: { name: string };
    }[];
}

interface ReceiptProps {
    bill: ReceiptBill;
}

const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(({ bill }, ref) => {
    return (
        <div ref={ref} className="max-w-xs mx-auto bg-white p-6 font-mono text-xs">
            {/* Header */}
            <div className="text-center mb-4">
                <h2 className="text-lg font-bold">GroceryPOS</h2>
                <p className="text-gray-500">Smart Grocery Store</p>
                <p className="text-gray-400 mt-1">{'─'.repeat(40)}</p>
            </div>

            {/* Bill Info */}
            <div className="mb-3 space-y-1">
                <div className="flex justify-between">
                    <span>Bill No:</span>
                    <span className="font-bold">{bill.billNumber}</span>
                </div>
                <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date(bill.createdAt).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                    <span>Cashier:</span>
                    <span>{bill.user.name}</span>
                </div>
                {bill.customer && (
                    <div className="flex justify-between">
                        <span>Customer:</span>
                        <span>{bill.customer.name}</span>
                    </div>
                )}
            </div>

            <p className="text-gray-400">{'─'.repeat(40)}</p>

            {/* Items */}
            <div className="my-3">
                <div className="flex justify-between font-bold mb-1">
                    <span className="flex-1">Item</span>
                    <span className="w-8 text-center">Qty</span>
                    <span className="w-16 text-right">Price</span>
                    <span className="w-16 text-right">Total</span>
                </div>
                {bill.items.map((item, i) => (
                    <div key={i} className="flex justify-between py-0.5">
                        <span className="flex-1 truncate">{item.product.name}</span>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <span className="w-16 text-right">{item.price.toFixed(2)}</span>
                        <span className="w-16 text-right">{item.total.toFixed(2)}</span>
                    </div>
                ))}
            </div>

            <p className="text-gray-400">{'─'.repeat(40)}</p>

            {/* Totals */}
            <div className="my-3 space-y-1">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(bill.subtotal)}</span>
                </div>
                {bill.discount > 0 && (
                    <div className="flex justify-between text-red-600">
                        <span>Discount:</span>
                        <span>-{formatCurrency(bill.discount)}</span>
                    </div>
                )}
                <div className="flex justify-between">
                    <span>Tax (5%):</span>
                    <span>{formatCurrency(bill.tax)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm mt-1 pt-1 border-t border-dashed">
                    <span>TOTAL:</span>
                    <span>{formatCurrency(bill.total)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Paid ({bill.paymentMethod}):</span>
                    <span>{formatCurrency(bill.paidAmount)}</span>
                </div>
                {bill.changeAmount > 0 && (
                    <div className="flex justify-between">
                        <span>Change:</span>
                        <span>{formatCurrency(bill.changeAmount)}</span>
                    </div>
                )}
            </div>

            <p className="text-gray-400">{'─'.repeat(40)}</p>

            {/* Footer */}
            <div className="text-center mt-4 text-gray-500">
                <p>Thank you for shopping!</p>
                <p>Visit again</p>
            </div>
        </div>
    );
});

Receipt.displayName = 'Receipt';
export default Receipt;
