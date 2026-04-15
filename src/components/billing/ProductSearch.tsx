'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ShieldCheck, Plus, ArrowRight } from 'lucide-react';
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

const PAGE_SIZE = 10;

function formatCategory(cat: string) {
  if (!cat) return '—';
  const lower = cat.toLowerCase().replace(/_/g, ' ');
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export default function ProductSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [page, setPage] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { apiFetch } = useAuth();
  const addItem = useCartStore((s) => s.addItem);

  const searchProducts = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 1) {
      setResults([]);
      setShowResults(false);
      setPage(0);
      return;
    }
    try {
      const res = await apiFetch(`/api/products/search?q=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok) {
        setResults([]);
        setShowResults(true);
        setPage(0);
        return;
      }
      setResults(Array.isArray(data) ? data : []);
      setShowResults(true);
      setPage(0);
    } catch {
      setResults([]);
      setShowResults(true);
      setPage(0);
    }
  }, [apiFetch]);

  useEffect(() => {
    const timer = setTimeout(() => searchProducts(query), 400);
    return () => clearTimeout(timer);
  }, [query, searchProducts]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const maxPage = Math.max(0, Math.ceil(results.length / PAGE_SIZE) - 1);
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const activePage = Math.min(page, maxPage);

  const pageResults = useMemo(() => {
    const start = activePage * PAGE_SIZE;
    return results.slice(start, start + PAGE_SIZE);
  }, [results, activePage]);

  const rangeStart = results.length === 0 ? 0 : activePage * PAGE_SIZE + 1;
  const rangeEnd = Math.min((activePage + 1) * PAGE_SIZE, results.length);

  const handleSelect = (product: SearchResult) => {
    addItem({
      id: product.id,
      name: product.name,
      productCode: product.barcode ?? undefined,
      category: product.category,
      unit: product.unit,
      price: product.price,
      costPrice: product.costPrice,
      quantity: product.quantity,
    });
    setQuery('');
    setResults([]);
    setShowResults(false);
    setPage(0);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && pageResults.length > 0) handleSelect(pageResults[0]);
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-0">
      <Input
        ref={inputRef}
        placeholder="Search product or barcode..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim() && setShowResults(true)}
        onKeyDown={handleKeyDown}
        icon={<Search size={16} />}
        autoComplete="off"
      />

      {showResults && query.trim().length >= 1 && (
        <div
          className="mt-2 w-full overflow-hidden rounded-[16px] sm:rounded-[22px] border border-white/10 bg-[rgba(12,20,40,0.98)] shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          aria-label="Product matches"
        >
          {results.length > 0 ? (
            <>
              {/* Narrow view: cards — from md up use table so POS side-by-side layout shows columns */}
              <div className="space-y-2 px-2.5 pb-1 pt-2 md:hidden">
                {pageResults.map((product) => {
                  const cat = formatCategory(product.category);
                  const metaParts = [cat, product.barcode].filter(Boolean) as string[];
                  const meta = metaParts.length > 0 ? metaParts.join(' · ') : '—';

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleSelect(product)}
                      className="w-full rounded-[14px] border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-left shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] transition-colors hover:bg-white/[0.06] active:bg-white/[0.08]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] leading-snug text-slate-100">
                            <span className="font-normal text-slate-400">{cat} </span>
                            <span className="font-semibold text-white">{product.name}</span>
                          </p>
                          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{meta}</p>
                        </div>
                        <p className="shrink-0 pt-0.5 text-right text-[13px] font-semibold tabular-nums text-emerald-400">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-white/[0.08] pt-2.5">
                        <span className="inline-flex min-w-0 items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2 py-1 text-[11px] font-medium tabular-nums text-emerald-400 ring-1 ring-emerald-500/25">
                          <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          <span className="truncate">
                            {product.quantity} {product.unit}
                          </span>
                        </span>
                        <div
                          className="flex shrink-0 items-center gap-2 text-slate-500 pointer-events-none"
                          aria-hidden
                        >
                          <Plus className="h-4 w-4" strokeWidth={2} />
                          <ArrowRight className="h-4 w-4 opacity-80" strokeWidth={2} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Tablet/desktop: table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[640px] table-fixed border-collapse text-left text-[11px] sm:text-[12px]">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-white/[0.03] text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500 sm:text-[10px]">
                      <th className="w-8 px-2 py-2 sm:px-3 sm:py-2.5">#</th>
                      <th className="min-w-[120px] px-2 py-2 sm:px-3 sm:py-2.5">Product</th>
                      <th className="w-[18%] px-2 py-2 sm:px-3 sm:py-2.5">Category</th>
                      <th className="w-[22%] px-2 py-2 text-right sm:px-3 sm:py-2.5">Stock</th>
                      <th className="w-[24%] px-2 py-2 text-right sm:px-3 sm:py-2.5">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {pageResults.map((product, rowIdx) => {
                      const n = activePage * PAGE_SIZE + rowIdx + 1;
                      return (
                        <tr
                          key={product.id}
                          className="cursor-pointer transition-colors hover:bg-white/[0.05] active:bg-white/[0.08]"
                          onClick={() => handleSelect(product)}
                        >
                          <td className="px-2 py-2 tabular-nums text-slate-500 sm:px-3 sm:py-2.5">{n}</td>
                          <td className="min-w-0 px-2 py-2 sm:px-3 sm:py-2.5">
                            <p className="break-words font-semibold text-slate-100">{product.name}</p>
                            {product.barcode && (
                              <p className="mt-0.5 truncate text-[10px] text-slate-500 tabular-nums sm:text-[11px]">
                                {product.barcode}
                              </p>
                            )}
                          </td>
                          <td className="px-2 py-2 text-slate-400 sm:px-3 sm:py-2.5">
                            <span className="line-clamp-2">{formatCategory(product.category)}</span>
                          </td>
                          <td className="px-2 py-2 text-right tabular-nums text-slate-300 sm:px-3 sm:py-2.5">
                            {product.quantity} {product.unit}
                          </td>
                          <td className="px-2 py-2 text-right font-semibold tabular-nums text-emerald-400 sm:px-3 sm:py-2.5">
                            {formatCurrency(product.price)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {results.length > 0 && (
                <div className="flex flex-col gap-2 border-t border-white/[0.06] px-2 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-3 sm:py-3">
                  <p className="text-center text-[10px] text-slate-500 sm:text-left">
                    <span className="tabular-nums text-slate-400">{rangeStart}</span>
                    {'–'}
                    <span className="tabular-nums text-slate-400">{rangeEnd}</span>
                    <span className="text-slate-600"> of </span>
                    <span className="tabular-nums text-slate-400">{results.length}</span>
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPage((p) => Math.max(0, Math.min(maxPage, p) - 1));
                      }}
                      disabled={activePage <= 0}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.05] text-slate-300 transition-all hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-35"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="min-w-[3.5rem] text-center text-[10px] tabular-nums text-slate-500 sm:text-[11px]">
                      {activePage + 1}/{totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPage((p) => Math.min(maxPage, Math.max(0, p) + 1));
                      }}
                      disabled={activePage >= maxPage}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.05] text-slate-300 transition-all hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-35"
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="px-3.5 py-4 text-center text-[12px] sm:text-sm text-slate-500">
              No matching products in stock
            </div>
          )}
        </div>
      )}
    </div>
  );
}
