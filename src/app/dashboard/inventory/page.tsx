// ============================================================
// Inventory Page — Premium dark-themed product management
// ============================================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ProductTable from '@/components/inventory/ProductTable';
import ProductForm from '@/components/inventory/ProductForm';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { Plus, Search, Package, Layers } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';
import toast from 'react-hot-toast';

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

export default function InventoryPage() {
  const { apiFetch, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | undefined>(undefined);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      params.set('limit', '100');
      const res = await apiFetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [apiFetch, search, category]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      const res = await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Product deleted');
        loadProducts();
      }
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <Card className="glass-panel-strong overflow-hidden p-0">
        <div className="px-6 py-6 lg:px-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge variant="info" className="mb-4">Stock Control</Badge>
              <h2 className="section-title text-3xl font-semibold">Inventory Management</h2>
              <p className="section-subtitle mt-2 max-w-xl text-sm leading-6">
                Track products across categories, monitor stock levels, and manage pricing from one surface.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {user && ['OWNER', 'MANAGER'].includes(user.role) && (
                <Button onClick={() => { setEditProduct(undefined); setShowForm(true); }}>
                  <Plus size={16} className="mr-2" /> Add Product
                </Button>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-500">
                <Package size={14} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Total</span>
              </div>
              <p className="text-xl font-semibold text-slate-100">{products.length}</p>
            </div>
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-500">
                <Layers size={14} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Low Stock</span>
              </div>
              <p className="text-xl font-semibold text-amber-300">
                {products.filter(p => p.quantity <= p.minStock && p.quantity > 0).length}
              </p>
            </div>
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-500">
                <Package size={14} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Out</span>
              </div>
              <p className="text-xl font-semibold text-red-300">
                {products.filter(p => p.quantity === 0).length}
              </p>
            </div>
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-500">
                <Layers size={14} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Categories</span>
              </div>
              <p className="text-xl font-semibold text-slate-100">
                {new Set(products.map(p => p.category)).size}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder="Search products by name or barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search size={18} />}
            />
          </div>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: '', label: 'All Categories' },
              ...CATEGORIES.map((c) => ({ value: c.value, label: `${c.emoji} ${c.label}` })),
            ]}
          />
        </div>
      </Card>

      {/* Table */}
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-400/30 border-t-brand-400" />
        </div>
      ) : (
        <ProductTable
          products={products}
          onEdit={(p) => { setEditProduct(p); setShowForm(true); }}
          onDelete={handleDelete}
          userRole={user?.role || ''}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editProduct ? 'Edit Product' : 'Add Product'}
        size="lg"
      >
        <ProductForm
          product={editProduct}
          onSuccess={() => { setShowForm(false); loadProducts(); }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
}
