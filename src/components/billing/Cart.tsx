'use client';

import { useCartStore } from '@/store/cartStore';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function Cart() {
  const { items, updateQuantity, removeItem } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-white/10 py-12 sm:py-16 text-slate-500">
        <ShoppingBag size={40} strokeWidth={1} />
        <p className="mt-3 text-[13px] sm:text-sm">Cart is empty</p>
        <p className="text-[11px] sm:text-xs">Search or scan products to begin.</p>
      </div>
    );
  }

  return (
    <div className="stagger-children space-y-2 sm:space-y-2.5">
      {items.map((item, index) => (
        <div
          key={item.productId}
          className="group rounded-[14px] sm:rounded-[18px] border border-white/[0.06] bg-white/[0.025] p-3 sm:p-3.5 transition-all duration-200 hover:bg-white/[0.04] hover:border-white/[0.09]"
        >
          {/* Mobile: stacked layout | Desktop: row layout */}
          <div className="flex items-start gap-2.5 sm:gap-3">
            {/* Index */}
            <span className="flex h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-white/[0.05] text-[10px] sm:text-xs font-bold text-slate-400 ring-1 ring-white/[0.06]">
              {index + 1}
            </span>

            {/* Name + Price per unit */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] sm:text-sm font-medium text-slate-100">{item.name}</p>
              <p className="text-[10px] sm:text-xs text-slate-500">{formatCurrency(item.price)} each</p>
            </div>

            {/* Line total — visible on sm+ */}
            <p className="hidden sm:block w-20 text-right text-[13px] font-semibold text-slate-100 flex-shrink-0">
              {formatCurrency(item.total)}
            </p>

            {/* Delete */}
            <button
              onClick={() => removeItem(item.productId)}
              className="flex-shrink-0 rounded-lg sm:rounded-xl p-1.5 sm:p-2 text-slate-600 transition-colors hover:bg-red-500/10 hover:text-red-300"
            >
              <Trash2 size={13} className="sm:[&]:w-[15px] sm:[&]:h-[15px]" />
            </button>
          </div>

          {/* Qty controls + mobile total */}
          <div className="mt-2 flex items-center justify-between pl-[34px] sm:pl-[40px]">
            <div className="flex items-center gap-1">
              <button
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-300 transition-all hover:bg-white/[0.08] disabled:opacity-30 active:scale-95"
              >
                <Minus size={12} />
              </button>
              <span className="w-8 text-center text-[12px] sm:text-sm font-bold tabular-nums text-slate-100">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                disabled={item.quantity >= item.maxQuantity}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-300 transition-all hover:bg-white/[0.08] disabled:opacity-30 active:scale-95"
              >
                <Plus size={12} />
              </button>
            </div>
            {/* Mobile line total */}
            <p className="sm:hidden text-[12px] font-semibold text-emerald-400">
              {formatCurrency(item.total)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
