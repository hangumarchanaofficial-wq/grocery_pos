// ============================================================
// Cart Store (Zustand) — Manages the billing cart state
// Separated from components for clean state management.
// ============================================================

import { create } from 'zustand';
import { calculateBillTotals } from '@/lib/billing';
import { useSettingsStore } from '@/store/settingsStore';
import type { CartItem } from '@/types';

interface CartStore {
    items: CartItem[];
    customerId: string | null;
    customerName: string | null;

    // Actions
    addItem: (product: {
        id: string;
        name: string;
        productCode?: string;
        category?: string;
        unit?: string;
        price: number;
        costPrice: number;
        quantity: number; // available stock
    }) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    setCustomer: (id: string | null, name: string | null) => void;
    clearCart: () => void;

    // Computed
    getSubtotal: () => number;
    getTax: () => number;
    getTotal: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
    items: [],
    customerId: null,
    customerName: null,

    addItem: (product) => {
        set((state) => {
            const existing = state.items.find((i) => i.productId === product.id);

            if (existing) {
                // Increase quantity (up to available stock)
                if (existing.quantity >= product.quantity) return state;
                return {
                    items: state.items.map((i) =>
                        i.productId === product.id
                            ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price }
                            : i
                    ),
                };
            }

            // Add new item
            return {
                items: [
                    ...state.items,
                    {
                        productId: product.id,
                        name: product.name,
                        productCode: product.productCode,
                        category: product.category,
                        unit: product.unit,
                        price: product.price,
                        costPrice: product.costPrice,
                        quantity: 1,
                        maxQuantity: product.quantity,
                        total: product.price,
                    },
                ],
            };
        });
    },

    removeItem: (productId) => {
        set((state) => ({
            items: state.items.filter((i) => i.productId !== productId),
        }));
    },

    updateQuantity: (productId, quantity) => {
        set((state) => ({
            items: state.items.map((i) =>
                i.productId === productId
                    ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxQuantity)), total: Math.max(1, Math.min(quantity, i.maxQuantity)) * i.price }
                    : i
            ),
        }));
    },

    setCustomer: (id, name) => set({ customerId: id, customerName: name }),

    clearCart: () => set({ items: [], customerId: null, customerName: null }),

    getSubtotal: () => get().items.reduce((sum, item) => sum + item.total, 0),
    getTax: () => {
        const subtotal = get().getSubtotal();
        const taxRate = useSettingsStore.getState().settings.taxRate;
        return calculateBillTotals({ subtotal, taxRatePercent: taxRate }).tax;
    },
    getTotal: () => {
        const subtotal = get().getSubtotal();
        const taxRate = useSettingsStore.getState().settings.taxRate;
        return calculateBillTotals({ subtotal, taxRatePercent: taxRate }).total;
    },
    getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
}));
