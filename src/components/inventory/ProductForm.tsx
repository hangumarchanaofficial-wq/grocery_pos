'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { CATEGORIES, UNITS } from '@/lib/constants';
import toast from 'react-hot-toast';

interface Product {
  id?: string;
  name?: string;
  barcode?: string;
  category?: string;
  price?: number;
  costPrice?: number;
  quantity?: number;
  unit?: string;
  minimumStock?: number;
  expiryDate?: string;
}

interface Props {
  product?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductForm({ product, onSuccess, onCancel }: Props) {
  const { apiFetch } = useAuth();
  const isEdit = !!product?.id;

  const [name, setName] = useState(product?.name || '');
  const [barcode, setBarcode] = useState(product?.barcode || '');
  const [category, setCategory] = useState(product?.category || 'GROCERIES');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [costPrice, setCostPrice] = useState(product?.costPrice?.toString() || '');
  const [quantity, setQuantity] = useState(product?.quantity?.toString() || '');
  const [unit, setUnit] = useState(product?.unit || 'pcs');
  const [minimumStock, setMinimumStock] = useState(product?.minimumStock?.toString() || '5');
  const [expiryDate, setExpiryDate] = useState(product?.expiryDate ? product.expiryDate.split('T')[0] : '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      toast.error('Name and price are required');
      return;
    }
    try {
      setLoading(true);
      const body = {
        name: name.trim(),
        barcode: barcode.trim() || undefined,
        category,
        price: parseFloat(price),
        costPrice: costPrice ? parseFloat(costPrice) : undefined,
        quantity: quantity ? parseInt(quantity) : 0,
        unit,
        minimumStock: minimumStock ? parseInt(minimumStock) : 5,
        expiryDate: expiryDate || undefined,
      };

      const url = isEdit ? `/api/products/${product!.id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed');
      }
      toast.success(isEdit ? 'Product updated' : 'Product added');
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      {/* Row 1: Name + Barcode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Input label="Product Name *" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Basmati Rice" />
        <Input label="Barcode" value={barcode} onChange={e => setBarcode(e.target.value)} placeholder="Optional" />
      </div>

      {/* Row 2: Category + Unit */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Select
          label="Category"
          value={category}
          onChange={e => setCategory(e.target.value)}
          options={CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
        />
        <Select
          label="Unit"
          value={unit}
          onChange={e => setUnit(e.target.value)}
          options={UNITS.map(u => ({ value: u, label: u }))}
        />
      </div>

      {/* Row 3: Price + Cost */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Input label="Selling Price *" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
        <Input label="Cost Price" type="number" step="0.01" value={costPrice} onChange={e => setCostPrice(e.target.value)} placeholder="0.00" />
      </div>

      {/* Row 4: Quantity + Min Stock */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Input label="Quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" />
        <Input label="Min Stock Alert" type="number" value={minimumStock} onChange={e => setMinimumStock(e.target.value)} placeholder="5" />
      </div>

      {/* Row 5: Expiry */}
      <Input label="Expiry Date" type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-2 border-t border-white/[0.04]">
        <Button type="button" variant="ghost" onClick={onCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" loading={loading} className="w-full sm:w-auto">
          {isEdit ? 'Update Product' : 'Add Product'}
        </Button>
      </div>
    </form>
  );
}
