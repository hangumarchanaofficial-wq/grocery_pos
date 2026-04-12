'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { CATEGORIES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import {
  ChevronLeft, ChevronRight, AlertTriangle,
  XCircle, ShieldCheck, Pencil, Trash2
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  barcode?: string;
  category: string;
  price: number;
  costPrice?: number;
  quantity: number;
  unit: string;
  minimumStock?: number;
  expiryDate?: string;
}

interface Props {
  products: Product[];
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
}

export default function ProductTable({ products, onEdit, onDelete }: Props) {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const perPage = 10;
  const totalPages = Math.max(1, Math.ceil(products.length / perPage));
  const maxPage = Math.max(0, totalPages - 1);
  const activePage = Math.min(page, maxPage);
  const slice = useMemo(
    () => products.slice(activePage * perPage, (activePage + 1) * perPage),
    [products, activePage, perPage]
  );
  const canManage = user?.role === 'OWNER' || user?.role === 'MANAGER';

  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] backdrop-blur-sm overflow-hidden">
      <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
        <table className="w-full table-fixed border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-left">
              <th className="w-[46%] px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider sm:w-[min(36%,280px)] sm:px-4">
                Product
              </th>
              <th className="w-[24%] px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider sm:w-[14%] sm:min-w-[100px] sm:px-4">
                Category
              </th>
              <th className="w-[30%] px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right sm:w-auto sm:px-4">Price</th>
              <th className="hidden px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right sm:table-cell">Cost</th>
              <th className="hidden px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center sm:table-cell">Stock</th>
              <th className="hidden px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center sm:table-cell">Status</th>
              {canManage && (
                <th className="hidden px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right sm:table-cell">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {slice.map(p => {
              const isLow = p.minimumStock && p.quantity <= p.minimumStock && p.quantity > 0;
              const isOut = p.quantity === 0;
              const catObj = CATEGORIES.find((c) => c.value === p.category);
              const categoryLabel = catObj?.label
                ?? p.category.charAt(0) + p.category.slice(1).toLowerCase();
              const icon = catObj?.emoji ?? '📦';

              return (
                <tr key={p.id} className="group align-top hover:bg-white/[0.02] transition-colors">
                  <td className="min-w-0 px-3 py-3 sm:px-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-lg leading-none"
                        aria-hidden
                      >
                        {icon}
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <p className="line-clamp-2 break-words text-sm font-medium text-white">{p.name}</p>
                        {p.barcode && (
                          <p className="mt-0.5 truncate text-xs text-slate-500 tabular-nums">{p.barcode}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="min-w-0 px-3 py-3 sm:px-4">
                    <span className="inline-block max-w-full truncate text-xs capitalize text-slate-300 bg-white/[0.04] px-2 py-1 rounded-md">
                      {categoryLabel}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right sm:px-4">
                    <span className="text-sm font-semibold text-emerald-400 tabular-nums">{formatCurrency(p.price)}</span>
                  </td>
                  <td className="hidden px-4 py-3 text-right sm:table-cell">
                    <span className="text-sm text-slate-400 tabular-nums">{p.costPrice ? formatCurrency(p.costPrice) : '—'}</span>
                  </td>
                  <td className="hidden px-4 py-3 text-center sm:table-cell">
                    <span className={`text-sm font-semibold tabular-nums ${isOut ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-white'}`}>
                      {p.quantity}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">{p.unit}</span>
                  </td>
                  <td className="hidden px-4 py-3 text-center sm:table-cell">
                    {isOut ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20">
                        <XCircle className="w-3 h-3" /> Out
                      </span>
                    ) : isLow ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
                        <AlertTriangle className="w-3 h-3" /> Low
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                        <ShieldCheck className="w-3 h-3" /> OK
                      </span>
                    )}
                  </td>
                  {canManage && (
                    <td className="hidden px-4 py-3 text-right sm:table-cell">
                      <div className="flex items-center justify-end gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                        <button
                          onClick={() => onEdit(p)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {user?.role === 'OWNER' && (
                          <button
                            onClick={() => onDelete(p.id)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col gap-2 border-t border-white/[0.04] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
          <p className="text-center text-[11px] text-slate-500 sm:text-left sm:text-xs">
            {activePage * perPage + 1}–{Math.min((activePage + 1) * perPage, products.length)} of {products.length}
          </p>
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={activePage <= 0}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="min-w-[3rem] text-center text-[11px] text-slate-400 tabular-nums sm:text-xs">
              {activePage + 1}/{totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage(p => Math.min(maxPage, p + 1))}
              disabled={activePage >= maxPage}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

