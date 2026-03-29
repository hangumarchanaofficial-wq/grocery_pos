// ============================================================
// Single Product Edit Page — Dark-themed
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import ProductForm from '@/components/inventory/ProductForm';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { apiFetch } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch(`/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }
    load();
  }, [id, apiFetch]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-400/30 border-t-brand-400" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-center">
        <p className="text-lg font-semibold text-slate-300">Product not found</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.back()}>
          <ArrowLeft size={16} className="mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft size={16} />
        </Button>
        <div>
          <Badge variant="info" className="mb-1">Editing</Badge>
          <h2 className="section-title text-2xl font-semibold">Edit Product</h2>
        </div>
      </div>

      <Card className="glass-panel-strong">
        <ProductForm
          product={product}
          onSuccess={() => router.push('/dashboard/inventory')}
          onCancel={() => router.back()}
        />
      </Card>
    </div>
  );
}
