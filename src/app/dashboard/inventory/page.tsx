'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ProductTable from '@/components/inventory/ProductTable';
import ProductForm from '@/components/inventory/ProductForm';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { CATEGORIES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import {
  Package, Search, Plus, Filter, AlertTriangle,
  XCircle, LayoutGrid, Layers, TrendingDown,
  ShieldCheck, ArrowUpDown, Box, Warehouse
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
          {/* Mobile Card Grid */}
          <div className="block lg:hidden space-y-2">
            {products.map(p => {
              const isLow = p.minimumStock && p.quantity <= p.minimumStock && p.quantity > 0;
              const isOut = p.quantity === 0;
              const catEmoji = CATEGORIES.find(c => c.value === p.category)?.label?.split(' ')[0] || '📦';
              return (
                <div
                  key={p.id}
                  className="rounded-xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-sm p-3 active:bg-white/[0.04] transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{catEmoji}</span>
                        <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {p.category.charAt(0) + p.category.slice(1).toLowerCase()}
                        {p.barcode && ` · ${p.barcode}`}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-emerald-400 shrink-0 tabular-nums">
                      {formatCurrency(p.price)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md ${
                        isOut ? 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20' :
                        isLow ? 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                      }`}>
                        {isOut ? <XCircle className="w-3 h-3" /> : isLow ? <AlertTriangle className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                        {p.quantity} {p.unit}
                      </span>
                      {isOut && <span className="text-[10px] text-rose-400">OUT</span>}
                      {isLow && !isOut && <span className="text-[10px] text-amber-400">LOW</span>}
                    </div>
                    {canManage && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
                        >
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        </button>
                        {user?.role === 'OWNER' && (
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table */}
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


