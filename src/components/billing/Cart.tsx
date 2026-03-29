// ============================================================
// Shopping Cart - Line items with quantity controls
// ============================================================

'use client';

import { useCartStore } from '@/store/cartStore';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function Cart() {
    const { items, updateQuantity, removeItem, getSubtotal, getTax, getTotal } = useCartStore();

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 py-16 text-slate-500">
                <ShoppingBag size={48} strokeWidth={1} />
                <p className="mt-3 text-sm">Cart is empty</p>
                <p className="text-xs">Search or scan products to begin a transaction.</p>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {items.map((item, index) => (
                    <div
                        key={item.productId}
                        className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4"
                    >
                        <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-white/[0.05] text-xs font-bold text-slate-400">
                                {index + 1}
                            </span>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-slate-100">{item.name}</p>
                                <p className="text-xs text-slate-500">{formatCurrency(item.price)} each</p>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:bg-white/[0.08] disabled:opacity-40"
                                >
                                    <Minus size={14} />
                                </button>
                                <span className="w-8 text-center text-sm font-bold text-slate-100">{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                    disabled={item.quantity >= item.maxQuantity}
                                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:bg-white/[0.08] disabled:opacity-40"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>

                            <p className="w-20 text-right text-sm font-semibold text-slate-100">
                                {formatCurrency(item.total)}
                            </p>

                            <button
                                onClick={() => removeItem(item.productId)}
                                className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-300"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-5 space-y-3 border-t border-white/8 pt-5">
                <div className="flex justify-between text-sm text-slate-400">
                    <span>Subtotal</span>
                    <span>{formatCurrency(getSubtotal())}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                    <span>Tax (5% GST)</span>
                    <span>{formatCurrency(getTax())}</span>
                </div>
                <div className="flex justify-between rounded-[20px] border border-brand-400/14 bg-brand-500/8 px-4 py-3 text-lg font-semibold text-slate-50">
                    <span>Total</span>
                    <span className="text-brand-300">{formatCurrency(getTotal())}</span>
                </div>
            </div>
        </div>
    );
}
