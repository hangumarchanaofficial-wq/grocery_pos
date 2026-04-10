// ============================================================
// Cart Hook — Convenience wrapper around the Zustand store
// Adds billing submission logic
// ============================================================

'use client';

import { useCallback } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from './useAuth';

export function useCart() {
    const cart = useCartStore();
    const { apiFetch } = useAuth();

    const submitBill = useCallback(async (paymentMethod: string, paidAmount: number, discount: number = 0) => {
        const items = cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            costPrice: item.costPrice,
        }));

        const res = await apiFetch('/api/billing', {
            method: 'POST',
            body: JSON.stringify({
                items,
                customerId: cart.customerId,
                paymentMethod,
                discount,
                paidAmount,
            }),
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Billing failed');
        }

        const bill = await res.json();
        cart.clearCart();
        return bill;
    }, [cart, apiFetch]);

    return { ...cart, submitBill };
}
