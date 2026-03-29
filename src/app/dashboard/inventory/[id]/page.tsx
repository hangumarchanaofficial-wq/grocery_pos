// ============================================================
// Single Product Edit Page (alternative to modal)
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import ProductForm from '@/components/inventory/ProductForm';
import Card from '@/components/ui/Card';

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

    if (loading) return <div className="text-center py-8">Loading...</div>;
    if (!product) return <div className="text-center py-8">Product not found</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Product</h2>
            <Card>
                <ProductForm
                    product={product}
                    onSuccess={() => router.push('/dashboard/inventory')}
                    onCancel={() => router.back()}
                />
            </Card>
        </div>
    );
}
