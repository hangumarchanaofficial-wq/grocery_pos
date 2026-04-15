// ============================================================
// Cart Hook — Convenience wrapper around the Zustand store
// Adds billing submission logic
// ============================================================

'use client';

import { useCallback } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuth } from './useAuth';

export function useCart() {
    const cart = useCartStore();
    const { settings } = useSettingsStore();
    const { apiFetch } = useAuth();

    const submitBill = useCallback(async (paymentMethod: string, paidAmount: number, discount: number = 0) => {
        const items = cart.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            productCode: (item as any).productCode ?? (item as any).barcode ?? undefined,
            quantity: item.quantity,
            price: item.price,
            costPrice: item.costPrice,
        }));

        const res = await apiFetch('/api/billing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items,
                customerId: cart.customerId,
                paymentMethod,
                discount,
                paidAmount,
                taxRate: settings.taxRate,
            }),
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Billing failed');
        }

        const bill = await res.json();
        cart.clearCart();
        return bill;
    }, [cart, apiFetch, settings.taxRate]);

    return { ...cart, submitBill };
}
