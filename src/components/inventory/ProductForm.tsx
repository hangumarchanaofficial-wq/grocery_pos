// ============================================================
// Product Form — Create or Edit a product
// ============================================================

'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { CATEGORIES, UNITS } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface ProductFormProps {
    product?: {
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
    };
    onSuccess: () => void;
    onCancel: () => void;
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
    const { apiFetch } = useAuth();
    const isEditing = !!product;

    const [form, setForm] = useState({
        name: product?.name || '',
        barcode: product?.barcode || '',
        category: product?.category || 'GROCERIES',
        price: product?.price?.toString() || '',
        costPrice: product?.costPrice?.toString() || '',
        quantity: product?.quantity?.toString() || '',
        unit: product?.unit || 'pcs',
        minStock: product?.minStock?.toString() || '5',
        expiryDate: product?.expiryDate?.slice(0, 10) || '',
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.price) {
            toast.error('Name and price are required');
            return;
        }

        setLoading(true);
        try {
            const url = isEditing ? `/api/products/${product.id}` : '/api/products';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await apiFetch(url, {
                method,
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save product');
            }

            toast.success(isEditing ? 'Product updated!' : 'Product created!');
            onSuccess();
        } catch (error: unknown) {
            toast.error((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Product Name *"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Basmati Rice (5kg)"
                    required
                />
                <Input
                    label="Barcode"
                    value={form.barcode}
                    onChange={(e) => handleChange('barcode', e.target.value)}
                    placeholder="Optional barcode number"
                />
                <Select
                    label="Category *"
                    value={form.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    options={CATEGORIES.map((c) => ({ value: c.value, label: `${c.emoji} ${c.label}` }))}
                />
                <Select
                    label="Unit"
                    value={form.unit}
                    onChange={(e) => handleChange('unit', e.target.value)}
                    options={UNITS.map((u) => ({ value: u, label: u }))}
                />
                <Input
                    label="Selling Price (₹) *"
                    type="number"
                    value={form.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                />
                <Input
                    label="Cost Price (₹)"
                    type="number"
                    value={form.costPrice}
                    onChange={(e) => handleChange('costPrice', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                />
                <Input
                    label="Stock Quantity"
                    type="number"
                    value={form.quantity}
                    onChange={(e) => handleChange('quantity', e.target.value)}
                    placeholder="0"
                    min="0"
                />
                <Input
                    label="Minimum Stock Alert"
                    type="number"
                    value={form.minStock}
                    onChange={(e) => handleChange('minStock', e.target.value)}
                    placeholder="5"
                    min="0"
                />
                <Input
                    label="Expiry Date"
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => handleChange('expiryDate', e.target.value)}
                />
            </div>

            <div className="flex gap-3 pt-4">
                <Button type="submit" loading={loading}>
                    {isEditing ? 'Update Product' : 'Add Product'}
                </Button>
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}
