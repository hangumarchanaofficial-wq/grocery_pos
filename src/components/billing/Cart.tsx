'use client';

import { useMemo, useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag, ShieldCheck, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const PAGE_SIZE = 10;

function formatCategoryLabel(cat: string | undefined) {
  if (!cat) return '';
  const lower = cat.toLowerCase().replace(/_/g, ' ');
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export default function Cart() {
  const { items, updateQuantity, removeItem } = useCartStore();
  const [page, setPage] = useState(0);

  const maxPage = Math.max(0, Math.ceil(items.length / PAGE_SIZE) - 1);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  /** Clamp when cart shrinks so we never show an empty “page”. */
  const activePage = Math.min(page, maxPage);

  const pageItems = useMemo(() => {
    const start = activePage * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, activePage]);

  const rangeStart = items.length === 0 ? 0 : activePage * PAGE_SIZE + 1;
  const rangeEnd = Math.min((activePage + 1) * PAGE_SIZE, items.length);

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
    <div className="flex flex-col gap-3">
      {/* Mobile / tablet: card rows — matches POS line-item hierarchy */}
      <div className="space-y-2 lg:hidden">
        {pageItems.map((item) => {
          const cat = formatCategoryLabel(item.category);
          const metaParts = [cat, item.productCode].filter(Boolean);
          const meta = metaParts.length > 0 ? metaParts.join(' · ') : '—';
          const unit = item.unit?.trim() || 'pcs';

          return (
            <div
              key={item.productId}
              className="rounded-[14px] border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] leading-snug text-slate-100">
                    {cat ? (
                      <>
                        <span className="font-normal text-slate-400">{cat} </span>
                        <span className="font-semibold text-white">{item.name}</span>
                      </>
                    ) : (
                      <span className="font-semibold text-white">{item.name}</span>
                    )}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{meta}</p>
                </div>
                <p className="shrink-0 pt-0.5 text-right text-[13px] font-semibold tabular-nums text-emerald-400">
                  {formatCurrency(item.price)}
                </p>
              </div>

              <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-white/[0.06] pt-2.5">
                <span className="inline-flex min-w-0 items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2 py-1 text-[11px] font-medium tabular-nums text-emerald-400 ring-1 ring-emerald-500/20">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span className="truncate">
                    {item.maxQuantity} {unit}
                  </span>
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-300 transition-all hover:bg-white/[0.08] disabled:opacity-30 active:scale-95"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="min-w-[1.75rem] text-center text-[13px] font-bold tabular-nums text-slate-100">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    disabled={item.quantity >= item.maxQuantity}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-300 transition-all hover:bg-white/[0.08] disabled:opacity-30 active:scale-95"
                    aria-label="Increase quantity"
                  >
                    <Plus size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="ml-0.5 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-300"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: dense table */}
      <div className="-mx-1 hidden overflow-x-auto rounded-[14px] border border-white/[0.06] sm:mx-0 lg:block">
        <table className="w-full min-w-[520px] border-collapse text-left text-[12px] sm:text-[13px]">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.03] text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
              <th className="whitespace-nowrap px-2 py-2.5 sm:px-3 sm:py-3">#</th>
              <th className="min-w-[140px] px-2 py-2.5 sm:px-3 sm:py-3">Product</th>
              <th className="whitespace-nowrap px-2 py-2.5 text-right sm:px-3 sm:py-3">Unit</th>
              <th className="whitespace-nowrap px-2 py-2.5 text-center sm:px-3 sm:py-3">Qty</th>
              <th className="whitespace-nowrap px-2 py-2.5 text-right sm:px-3 sm:py-3">Total</th>
              <th className="w-10 px-1 py-2.5 sm:w-12 sm:px-2 sm:py-3" aria-label="Remove" />
            </tr>
          </thead>
          <tbody>
            {pageItems.map((item, rowIdx) => {
              const n = activePage * PAGE_SIZE + rowIdx + 1;
              return (
                <tr
                  key={item.productId}
                  className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02] last:border-0"
                >
                  <td className="align-top px-2 py-2.5 tabular-nums text-slate-500 sm:px-3 sm:py-3">{n}</td>
                  <td className="align-top px-2 py-2.5 sm:px-3 sm:py-3">
                    <p className="font-medium text-slate-100">{item.name}</p>
                    {item.productCode && (
                      <p className="mt-0.5 text-[10px] text-slate-500">{item.productCode}</p>
                    )}
                  </td>
                  <td className="align-top px-2 py-2.5 text-right tabular-nums text-slate-300 sm:px-3 sm:py-3">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="align-top px-2 py-2.5 sm:px-3 sm:py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-300 transition-all hover:bg-white/[0.08] disabled:opacity-30 active:scale-95"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="min-w-[1.75rem] text-center text-sm font-bold tabular-nums text-slate-100">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.maxQuantity}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-300 transition-all hover:bg-white/[0.08] disabled:opacity-30 active:scale-95"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="align-top px-2 py-2.5 text-right font-semibold tabular-nums text-emerald-400 sm:px-3 sm:py-3">
                    {formatCurrency(item.total)}
                  </td>
                  <td className="align-top px-1 py-2.5 sm:px-2 sm:py-3">
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-red-500/10 hover:text-red-300"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {items.length > PAGE_SIZE && (
        <div className="flex flex-col gap-2 border-t border-white/[0.06] pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-[11px] text-slate-500 sm:text-left">
            <span className="tabular-nums text-slate-400">{rangeStart}</span>
            {'–'}
            <span className="tabular-nums text-slate-400">{rangeEnd}</span>
            <span className="text-slate-600"> of </span>
            <span className="tabular-nums text-slate-400">{items.length}</span>
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, Math.min(maxPage, p) - 1))}
              disabled={activePage <= 0}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-slate-300 transition-all hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="min-w-[3.5rem] text-center text-[11px] tabular-nums text-slate-500">
              {activePage + 1}/{totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(maxPage, Math.max(0, p) + 1))}
              disabled={activePage >= maxPage}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-slate-300 transition-all hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
