'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/Badge';
import { CATEGORIES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import {
  ChevronLeft, ChevronRight, Package, AlertTriangle,
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
  const perPage = 12;
  const totalPages = Math.ceil(products.length / perPage);
  const slice = products.slice(page * perPage, (page + 1) * perPage);
  const canManage = user?.role === 'OWNER' || user?.role === 'MANAGER';

  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] backdrop-blur-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-left">
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Product</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Price</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Cost</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Stock</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Status</th>
              {canManage && (
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {slice.map(p => {
              const isLow = p.minimumStock && p.quantity <= p.minimumStock && p.quantity > 0;
              const isOut = p.quantity === 0;
              const catObj = CATEGORIES.find(c => c.value === p.category);
              const emoji = catObj?.label?.split(' ')[0] || '📦';

              return (
                <tr key={p.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-sm shrink-0">
                        {emoji}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate max-w-[200px]">{p.name}</p>
                        {p.barcode && <p className="text-xs text-slate-500">{p.barcode}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-300 bg-white/[0.04] px-2 py-0.5 rounded-md">
                      {p.category.charAt(0) + p.category.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-semibold text-emerald-400 tabular-nums">{formatCurrency(p.price)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-slate-400 tabular-nums">{p.costPrice ? formatCurrency(p.costPrice) : '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm font-semibold tabular-nums ${isOut ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-white'}`}>
                      {p.quantity}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">{p.unit}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
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
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.04]">
          <p className="text-xs text-slate-500">
            {page * perPage + 1}–{Math.min((page + 1) * perPage, products.length)} of {products.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-400 px-2 tabular-nums">{page + 1}/{totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
