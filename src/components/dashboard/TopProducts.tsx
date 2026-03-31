'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { SalesInsight } from '@/types';
import { TrendingUp, TrendingDown, Flame, Snail } from 'lucide-react';

export default function TopProducts() {
  const { apiFetch } = useAuth();
  const [insights, setInsights] = useState<SalesInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch('/api/ai/insights');
        const data = await res.json();
        setInsights(data.insights ?? []);
      } catch { setInsights([]); }
      finally { setLoading(false); }
    }
    load();
  }, [apiFetch]);

  const topSelling = insights.filter(i => i.type === 'top_selling');
  const lowSelling = insights.filter(i => i.type === 'low_selling');

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/[0.07] bg-gradient-to-br from-[rgba(6,14,30,0.96)] to-[rgba(3,8,18,0.98)] p-6 min-h-[320px] shadow-[0_32px_80px_rgba(0,0,0,0.35)]">
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />

      <div className="mb-5">
        <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-slate-100">Product Insights</h3>
        <p className="mt-1 text-[11px] text-slate-500">High-performing lines and items losing velocity over 30 days.</p>
      </div>

      {loading ? (
        <div className="flex min-h-[220px] items-center justify-center gap-3 text-slate-500 text-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-violet-400" />
          Analysing sales patterns...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Top Sellers */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-emerald-500/10">
                <Flame size={13} className="text-emerald-400" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Top Sellers</span>
            </div>
            {topSelling.length === 0 ? (
              <div className="rounded-[14px] border border-white/[0.05] bg-white/[0.02] px-4 py-6 text-center">
                <p className="text-[12px] text-slate-500">No sales data yet — process some bills to see top sellers.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {topSelling.map((ins, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-[14px] border border-white/[0.05] bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] transition-colors">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[8px] bg-emerald-500/10 text-[11px] font-bold text-emerald-400">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-slate-200">{ins.productName}</p>
                      <p className="text-[11px] text-slate-500">{ins.message.split('—')[1]?.trim() ?? ins.message}</p>
                    </div>
                    <TrendingUp size={14} className="flex-shrink-0 text-emerald-400" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Slow Moving */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-amber-500/10">
                <Snail size={13} className="text-amber-400" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">Slow Moving</span>
            </div>
            {lowSelling.length === 0 ? (
              <div className="rounded-[14px] border border-white/[0.05] bg-white/[0.02] px-4 py-6 text-center">
                <p className="text-[12px] text-slate-500">All products are moving well — no slow movers detected.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {lowSelling.map((ins, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-[14px] border border-amber-400/[0.08] bg-amber-500/[0.03] px-4 py-3 hover:bg-amber-500/[0.06] transition-colors">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[8px] bg-amber-500/10">
                      <TrendingDown size={12} className="text-amber-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-slate-200">{ins.productName}</p>
                      <p className="text-[11px] text-slate-500">{ins.message.split('—')[0]?.trim() ?? ins.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}