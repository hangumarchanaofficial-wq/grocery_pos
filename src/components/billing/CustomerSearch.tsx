'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Input from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore } from '@/store/cartStore';
import { useSettingsStore } from '@/store/settingsStore';
import { t } from '@/lib/i18n';
import { toast } from 'react-hot-toast';

interface CustomerRow {
  id: string;
  name: string;
  phone: string | null;
}

const PAGE_SIZE = 10;

export default function CustomerSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CustomerRow[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [page, setPage] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { apiFetch } = useAuth();
  const { setCustomer, customerName } = useCartStore();
  const { settings } = useSettingsStore();
  const tr = (key: Parameters<typeof t>[1]) => t(settings.language, key);

  const searchCustomers = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (trimmed.length < 1) {
        setResults([]);
        setShowPanel(false);
        setPage(0);
        return;
      }
      try {
        const params = new URLSearchParams({
          search: trimmed,
          limit: '20',
        });
        const res = await apiFetch(`/api/customers?${params}`);
        const data = await res.json();
        if (!res.ok) {
          setResults([]);
          setShowPanel(true);
          setPage(0);
          return;
        }
        const list = Array.isArray(data) ? data : (data.customers ?? []);
        setResults(list);
        setShowPanel(true);
        setPage(0);
      } catch {
        setResults([]);
        setShowPanel(true);
        setPage(0);
      }
    },
    [apiFetch]
  );

  useEffect(() => {
    const timer = setTimeout(() => searchCustomers(query), 400);
    return () => clearTimeout(timer);
  }, [query, searchCustomers]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowPanel(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const maxPage = Math.max(0, Math.ceil(results.length / PAGE_SIZE) - 1);
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const activePage = Math.min(page, maxPage);
  const pageRows = useMemo(() => {
    const start = activePage * PAGE_SIZE;
    return results.slice(start, start + PAGE_SIZE);
  }, [results, activePage]);

  const rangeStart = results.length === 0 ? 0 : activePage * PAGE_SIZE + 1;
  const rangeEnd = Math.min((activePage + 1) * PAGE_SIZE, results.length);

  const attach = (c: CustomerRow) => {
    setCustomer(c.id, c.name);
    toast.success(`${tr('customer')}: ${c.name}`);
    setQuery('');
    setResults([]);
    setShowPanel(false);
    setPage(0);
    inputRef.current?.focus();
  };

  const findExact = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    if (pageRows.length > 0) {
      attach(pageRows[0]);
      return;
    }
    try {
      const res = await apiFetch(
        `/api/customers?search=${encodeURIComponent(trimmed)}&limit=5`
      );
      const data = await res.json();
      if (!res.ok || !Array.isArray(data) || data.length === 0) {
        toast.error('Customer not found');
        return;
      }
      attach(data[0] as CustomerRow);
    } catch {
      toast.error('Lookup failed');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      findExact();
    }
  };

  const panelOpen = showPanel && query.trim().length >= 1;

  return (
    <div ref={containerRef} className="flex flex-col gap-0">
      <Input
        ref={inputRef}
        placeholder="Name or phone..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(0);
        }}
        onFocus={() => query.trim() && setShowPanel(true)}
        onKeyDown={handleKeyDown}
        icon={<Search size={16} />}
        autoComplete="off"
      />

      {panelOpen && (
        <div
          className="mt-2 w-full overflow-hidden rounded-[16px] sm:rounded-[22px] border border-white/10 bg-[rgba(12,20,40,0.98)] shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          aria-label="Customer matches"
        >
          {results.length > 0 ? (
            <>
              <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
                <table className="w-full min-w-[280px] table-fixed border-collapse text-left text-[11px] sm:text-[12px]">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-white/[0.03] text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500 sm:text-[10px]">
                      <th className="w-[52%] px-2 py-2.5 sm:px-3 sm:py-3">Name</th>
                      <th className="px-2 py-2.5 sm:px-3 sm:py-3">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {pageRows.map((c) => (
                      <tr
                        key={c.id}
                        className="cursor-pointer transition-colors hover:bg-white/[0.05] active:bg-white/[0.08]"
                        onClick={() => attach(c)}
                      >
                        <td className="min-w-0 px-2 py-2.5 font-semibold text-slate-100 sm:px-3 sm:py-3">
                          <span className="line-clamp-2">{c.name}</span>
                        </td>
                        <td className="min-w-0 px-2 py-2.5 tabular-nums text-slate-400 sm:px-3 sm:py-3">
                          {c.phone ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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
                      setPage((p) => Math.max(0, p - 1));
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
                      setPage((p) => Math.min(maxPage, p + 1));
                    }}
                    disabled={activePage >= maxPage}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.05] text-slate-300 transition-all hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="px-3.5 py-4 text-center text-[12px] sm:text-sm text-slate-500">
              No matching customers
            </div>
          )}
        </div>
      )}

      {customerName && (
        <div className="relative mt-2.5 sm:mt-3 flex items-center gap-2 rounded-xl sm:rounded-[14px] border border-emerald-400/20 bg-emerald-500/10 px-3 sm:px-4 py-2 sm:py-2.5">
          <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-emerald-500/20 text-[9px] sm:text-[10px] font-bold text-emerald-400">
            {customerName[0].toUpperCase()}
          </div>
          <p className="text-[12px] sm:text-[13px] font-semibold text-emerald-300">{customerName}</p>
          <span className="ml-auto text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-emerald-500">Linked</span>
        </div>
      )}
    </div>
  );
}
