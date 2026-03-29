// ============================================================
// Inventory Page — Product list + add/edit
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
import { Plus, Search } from 'lucide-react';
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

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this product?')) return;
        try {
            const res = await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Product deleted');
                loadProducts();
            }
        } catch {
            toast.error('Delete failed');
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Inventory</h2>
                {user && ['OWNER', 'MANAGER'].includes(user.role) && (
                    <Button onClick={() => { setEditProduct(undefined); setShowForm(true); }}>
                        <Plus size={16} className="mr-2" /> Add Product
                    </Button>
                )}
            </div>

            {/* Filters */}
            <Card padding="sm">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <Input
                            placeholder="Search products..."
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
                <div className="flex items-center justify-center h-32">
                    <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
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
