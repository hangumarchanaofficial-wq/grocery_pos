'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ProductTable from '@/components/inventory/ProductTable';
import ProductForm from '@/components/inventory/ProductForm';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { CATEGORIES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import {
  Package, Search, Plus, Filter, AlertTriangle,
  XCircle, LayoutGrid, TrendingDown, ShieldCheck, ArrowUpDown,
  Box, Warehouse, ChevronLeft, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

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

export default function InventoryPage() {
  const { user, apiFetch } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [mobilePage, setMobilePage] = useState(0);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      params.set('limit', '100');
      const res = await apiFetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [search, category, apiFetch]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      const res = await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditProduct(null);
    fetchProducts();
  };

  const totalProducts = products.length;
  const mobilePerPage = 10;
  const mobileTotalPages = Math.max(1, Math.ceil(products.length / mobilePerPage));
  const mobileMaxPage = Math.max(0, mobileTotalPages - 1);
  const activeMobilePage = Math.min(mobilePage, mobileMaxPage);
  const mobileProducts = useMemo(() => {
    const start = activeMobilePage * mobilePerPage;
    return products.slice(start, start + mobilePerPage);
  }, [products, activeMobilePage]);
  const mobileRangeStart = products.length === 0 ? 0 : activeMobilePage * mobilePerPage + 1;
  const mobileRangeEnd = Math.min((activeMobilePage + 1) * mobilePerPage, products.length);

  const lowStock = products.filter(p => p.minimumStock && p.quantity <= p.minimumStock && p.quantity > 0).length;
  const outOfStock = products.filter(p => p.quantity === 0).length;
  const categories = [...new Set(products.map(p => p.category))].length;
  const totalValue = products.reduce((s, p) => s + p.price * p.quantity, 0);
  const canManage = user?.role === 'OWNER' || user?.role === 'MANAGER';

  const stats = [
    { label: 'Total Items', value: totalProducts, icon: Package, color: 'text-emerald-400', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20' },
    { label: 'Low Stock', value: lowStock, icon: TrendingDown, color: lowStock > 0 ? 'text-amber-400' : 'text-slate-400', bg: lowStock > 0 ? 'bg-amber-500/10' : 'bg-slate-500/10', ring: lowStock > 0 ? 'ring-amber-500/20' : 'ring-slate-500/20' },
    { label: 'Out of Stock', value: outOfStock, icon: XCircle, color: outOfStock > 0 ? 'text-rose-400' : 'text-slate-400', bg: outOfStock > 0 ? 'bg-rose-500/10' : 'bg-slate-500/10', ring: outOfStock > 0 ? 'ring-rose-500/20' : 'ring-slate-500/20' },
    { label: 'Categories', value: categories, icon: LayoutGrid, color: 'text-violet-400', bg: 'bg-violet-500/10', ring: 'ring-violet-500/20' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#0a1628] p-4 sm:p-6 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.06),transparent_60%)]" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20">
                  <Warehouse className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                </div>
                <Badge variant="success">Stock Control</Badge>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                Inventory Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {totalProducts} products · {formatCurrency(totalValue)} total value
              </p>
            </div>
            {canManage && (
              <Button
                onClick={() => { setEditProduct(null); setShowForm(true); }}
                className="shrink-0 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Product
              </Button>
            )}
          </div>

          {/* ── Stat Tiles ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-4 sm:mt-5">
            {stats.map(s => (
              <div
                key={s.label}
                className={`flex items-center gap-2.5 sm:gap-3 rounded-lg sm:rounded-xl border border-white/[0.04] bg-white/[0.02] backdrop-blur-sm p-2.5 sm:p-3.5 ring-1 ${s.ring}`}
              >
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${s.bg}`}>
                  <s.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${s.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-base sm:text-xl font-bold text-white leading-none">{s.value}</p>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 truncate">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search products, barcodes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 sm:h-11 pl-9 pr-3 rounded-lg sm:rounded-xl border border-white/[0.06] bg-white/[0.03] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition"
          />
        </div>
        <div className="relative w-full sm:w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full h-10 sm:h-11 pl-9 pr-8 rounded-lg sm:rounded-xl border border-white/[0.06] bg-white/[0.03] text-sm text-white appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Product Table / Grid ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Loading inventory…</p>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-500/10 flex items-center justify-center mb-3">
            <Box className="w-7 h-7 text-slate-500" />
          </div>
          <p className="text-white font-medium">No products found</p>
          <p className="text-sm text-slate-400 mt-1">
            {search || category ? 'Try adjusting your filters' : 'Add your first product to get started'}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile card rows (matches requested content layout) */}
          <div className="space-y-2 lg:hidden">
            {mobileProducts.map((p) => {
              const isLow = p.minimumStock && p.quantity <= p.minimumStock && p.quantity > 0;
              const isOut = p.quantity === 0;
              const catObj = CATEGORIES.find((c) => c.value === p.category);
              const categoryLabel = catObj?.label
                ?? p.category.charAt(0) + p.category.slice(1).toLowerCase();

              return (
                <div
                  key={p.id}
                  className="rounded-[14px] border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] leading-snug text-slate-100">
                        <span className="font-normal text-slate-400">{categoryLabel} </span>
                        <span className="font-semibold text-white">{p.name}</span>
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                        {categoryLabel}
                        {p.barcode ? ` · ${p.barcode}` : ''}
                      </p>
                    </div>
                    <p className="shrink-0 pt-0.5 text-right text-[13px] font-semibold tabular-nums text-emerald-400">
                      {formatCurrency(p.price)}
                    </p>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-white/[0.06] pt-2.5">
                    <span className={`inline-flex min-w-0 items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium tabular-nums ring-1 ${
                      isOut
                        ? 'bg-rose-500/10 text-rose-400 ring-rose-500/20'
                        : isLow
                          ? 'bg-amber-500/10 text-amber-400 ring-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20'
                    }`}>
                      {isOut ? (
                        <XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      ) : isLow ? (
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      ) : (
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      )}
                      <span className="truncate">
                        {p.quantity} {p.unit}
                      </span>
                    </span>

                    {canManage && (
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(p)}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                          aria-label={`Edit ${p.name}`}
                        >
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                        {user?.role === 'OWNER' && (
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id)}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-400"
                            aria-label={`Delete ${p.name}`}
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {products.length > mobilePerPage && (
              <div className="flex flex-col gap-2 border-t border-white/[0.06] pt-3">
                <p className="text-center text-[11px] text-slate-500">
                  <span className="tabular-nums text-slate-400">{mobileRangeStart}</span>
                  {'–'}
                  <span className="tabular-nums text-slate-400">{mobileRangeEnd}</span>
                  <span className="text-slate-600"> of </span>
                  <span className="tabular-nums text-slate-400">{products.length}</span>
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMobilePage((p) => Math.max(0, p - 1))}
                    disabled={activeMobilePage <= 0}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-slate-300 transition-all hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="min-w-[3.5rem] text-center text-[11px] tabular-nums text-slate-500">
                    {activeMobilePage + 1}/{mobileTotalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobilePage((p) => Math.min(mobileMaxPage, p + 1))}
                    disabled={activeMobilePage >= mobileMaxPage}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-slate-300 transition-all hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block">
            <ProductTable
              products={products}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </>
      )}

      {/* ── Add/Edit Modal ── */}
      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditProduct(null); }}
        title={editProduct ? 'Edit Product' : 'Add Product'}
        size="lg"
      >
        <ProductForm
          product={editProduct}
          onSuccess={handleFormSuccess}
          onCancel={() => { setShowForm(false); setEditProduct(null); }}
        />
      </Modal>
    </div>
  );
}


