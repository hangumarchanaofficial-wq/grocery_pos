// ============================================================
// Product Search - Search by name or scan barcode
// ============================================================

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Barcode } from 'lucide-react';
import Input from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore } from '@/store/cartStore';
import { formatCurrency } from '@/lib/utils';

interface SearchResult {
    id: string;
    name: string;
    barcode: string | null;
    price: number;
    costPrice: number;
    quantity: number;
    unit: string;
    category: string;
}

export default function ProductSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [barcodeMode, setBarcodeMode] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { apiFetch } = useAuth();
    const addItem = useCartStore((s) => s.addItem);

    const searchProducts = useCallback(async (q: string) => {
        if (q.length < 1) {
            setResults([]);
            return;
        }
        try {
            const res = await apiFetch(`/api/products/search?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            setResults(Array.isArray(data) ? data : []);
            setShowResults(true);
        } catch {
            setResults([]);
        }
    }, [apiFetch]);

    useEffect(() => {
        const timer = setTimeout(() => {
            searchProducts(query);
        }, 300);
        return () => clearTimeout(timer);
    }, [query, searchProducts]);

    const handleSelect = (product: SearchResult) => {
        addItem({
            id: product.id,
            name: product.name,
            productCode: product.barcode ?? undefined,
            price: product.price,
            costPrice: product.costPrice,
            quantity: product.quantity,
        });
        setQuery('');
        setResults([]);
        setShowResults(false);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && results.length > 0) {
            handleSelect(results[0]);
        }
    };

    return (
        <div className="relative">
            <div className="flex gap-3">
                <div className="flex-1">
                    <Input
                        ref={inputRef}
                        placeholder={barcodeMode ? 'Scan barcode or paste code...' : 'Search product name or barcode...'}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => query && setShowResults(true)}
                        onKeyDown={handleKeyDown}
                        icon={barcodeMode ? <Barcode size={18} /> : <Search size={18} />}
                        autoComplete="off"
                    />
                </div>
                <button
                    onClick={() => {
                        setBarcodeMode(!barcodeMode);
                        inputRef.current?.focus();
                    }}
                    className={`rounded-2xl border px-4 py-3 transition-colors ${
                        barcodeMode
                            ? 'border-brand-400/20 bg-brand-500/12 text-brand-300'
                            : 'border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]'
                    }`}
                    title="Toggle barcode mode"
                >
                    <Barcode size={20} />
                </button>
            </div>

            {showResults && results.length > 0 && (
                <div className="relative z-50 mt-3 overflow-hidden rounded-[22px] border border-white/10 bg-[rgba(12,20,40,0.98)] shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                    {results.map((product) => (
                        <button
                            key={product.id}
                            onClick={() => handleSelect(product)}
                            className="flex w-full items-center justify-between gap-4 border-b border-white/6 px-5 py-3 text-left transition-colors last:border-0 hover:bg-white/[0.04]"
                        >
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-100">{product.name}</p>
                                <p className="mt-1 truncate text-xs text-slate-400">
                                    {product.category} | {product.quantity} {product.unit} in stock
                                    {product.barcode && ` | ${product.barcode}`}
                                </p>
                            </div>
                            <p className="shrink-0 text-sm font-semibold text-emerald-300">
                                {formatCurrency(product.price)}
                            </p>
                        </button>
                    ))}
                </div>
            )}

            {showResults && (
                <div className="fixed inset-0 z-40" onClick={() => setShowResults(false)} />
            )}
        </div>
    );
}
