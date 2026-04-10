// ============================================================
// Product Table - Premium dark-themed product grid
// ============================================================

'use client';

import { useEffect, useMemo, useState } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CATEGORIES } from '@/lib/constants';

interface Product {
  id: string;
  name: string;
  barcode: string | null;
  category: string;
  price: number;
  costPrice: number;
  quantity: number;
  unit: string;
  minStock: number;
  expiryDate: string | null;
}

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  userRole: string;
}

const ITEMS_PER_PAGE = 10;

export default function ProductTable({ products, onEdit, onDelete, userRole }: ProductTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const getCategoryEmoji = (cat: string) =>
    CATEGORIES.find((c) => c.value === cat)?.emoji || '📦';

  const getStockBadge = (product: Product) => {
    if (product.quantity === 0) return <Badge variant="danger">Out of Stock</Badge>;
    if (product.quantity <= product.minStock) return <Badge variant="warning">Low Stock</Badge>;
    return <Badge variant="success">In Stock</Badge>;
  };

  const getExpiryBadge = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    const days = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000);
    if (days <= 0) return <Badge variant="danger">Expired</Badge>;
    if (days <= 3) return <Badge variant="warning">{days}d left</Badge>;
    return null;
  };

  const totalPages = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage(1);
  }, [products]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const visibleProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return products.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, products]);

  if (products.length === 0) {
    return (
      <div className="glass-panel flex h-48 items-center justify-center rounded-[28px] text-slate-500">
        No products found. Try adjusting your filters.
      </div>
    );
  }

  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, products.length);

  return (
    <div className="glass-panel overflow-hidden rounded-[28px]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8">
              <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Product
              </th>
              <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Category
              </th>
              <th className="px-5 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Price
              </th>
              <th className="hidden px-5 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 md:table-cell">
                Cost
              </th>
              <th className="px-5 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Stock
              </th>
              <th className="px-5 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Status
              </th>
              <th className="px-5 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {visibleProducts.map((product) => (
              <tr key={product.id} className="transition-colors hover:bg-white/[0.02]">
                <td className="px-5 py-4">
                  <div>
                    <p className="font-medium text-slate-100">{product.name}</p>
                    {product.barcode && (
                      <p className="mt-0.5 font-mono text-xs text-slate-500">{product.barcode}</p>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-slate-300">
                    {getCategoryEmoji(product.category)} {product.category}
                  </span>
                </td>
                <td className="px-5 py-4 text-right font-medium text-slate-100">
                  {formatCurrency(product.price)}
                </td>
                <td className="hidden px-5 py-4 text-right text-slate-400 md:table-cell">
                  {formatCurrency(product.costPrice)}
                </td>
                <td className="px-5 py-4 text-center">
                  <span className="font-mono font-medium text-slate-200">
                    {product.quantity} <span className="text-slate-500">{product.unit}</span>
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  <div className="flex flex-col items-center gap-1.5">
                    {getStockBadge(product)}
                    {getExpiryBadge(product.expiryDate)}
                  </div>
                </td>
                <td className="px-5 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(product)}>
                      <Edit size={15} />
                    </Button>
                    {userRole === 'OWNER' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(product.id)}
                        className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      >
                        <Trash2 size={15} />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-white/8 px-5 py-4">
        <p className="text-xs text-slate-500">
          Showing {startItem}-{endItem} of {products.length} products
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-slate-300 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="min-w-16 text-center text-sm font-medium text-slate-300">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-slate-300 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
