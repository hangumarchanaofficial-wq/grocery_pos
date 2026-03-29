// ============================================================
// Products Hook — Fetch and search products
// ============================================================

'use client';

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

interface Product {
    id: string;
    name: string;
    barcode: string | null;
    price: number;
    costPrice: number;
    quantity: number;
    unit: string;
    category: string;
    minStock: number;
    expiryDate: string | null;
    active: boolean;
}

export function useProducts() {
    const { apiFetch } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchProducts = useCallback(async (params?: Record<string, string>) => {
        setLoading(true);
        try {
            const query = params ? '?' + new URLSearchParams(params).toString() : '';
            const res = await apiFetch(`/api/products${query}`);
            const data = await res.json();
            setProducts(data.products || []);
            return data;
        } finally {
            setLoading(false);
        }
    }, [apiFetch]);

    const searchProducts = useCallback(async (query: string) => {
        if (!query) return [];
        const res = await apiFetch(`/api/products/search?q=${encodeURIComponent(query)}`);
        return res.json();
    }, [apiFetch]);

    return { products, loading, fetchProducts, searchProducts };
}
