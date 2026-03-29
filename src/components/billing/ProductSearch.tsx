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
                <div className="glass-panel-strong absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-[24px]">
                    {results.map((product) => (
                        <button
                            key={product.id}
                            onClick={() => handleSelect(product)}
                            className="flex w-full items-center justify-between border-b border-white/6 px-4 py-4 text-left transition-colors last:border-0 hover:bg-white/[0.04]"
                        >
                            <div>
                                <p className="text-sm font-medium text-slate-100">{product.name}</p>
                                <p className="text-xs text-slate-500">
                                    {product.category} | {product.quantity} {product.unit} in stock
                                    {product.barcode && ` | ${product.barcode}`}
                                </p>
                            </div>
                            <p className="text-sm font-semibold text-brand-300">
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
