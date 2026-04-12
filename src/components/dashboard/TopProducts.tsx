'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { SalesInsight } from '@/types';
import { TrendingUp, TrendingDown, Flame, Snail, BarChart3 } from 'lucide-react';

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
    <div className="premium-card animate-fade-up rounded-[20px] sm:rounded-[24px] p-4 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-violet-500/[0.06] blur-[40px]" />

      <div className="relative mb-4 sm:mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-[12px] sm:rounded-[14px] border border-violet-400/20 bg-violet-500/10 shadow-[0_8px_24px_rgba(139,92,246,0.12)]">
          <BarChart3 size={15} className="text-violet-400 sm:[&]:w-[17px] sm:[&]:h-[17px]" />
        </div>
        <div>
          <h3 className="text-[13px] sm:text-[15px] font-semibold tracking-[-0.02em] text-slate-100">Product Insights</h3>
          <p className="text-[10px] sm:text-[11px] text-slate-500">Performance over 30 days</p>
        </div>
      </div>

      {loading ? (
        <div className="relative flex min-h-[180px] sm:min-h-[220px] items-center justify-center gap-3 text-slate-500 text-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-violet-400" />
          <span className="text-[12px]">Analysing sales patterns...</span>
        </div>
      ) : (
        <div className="relative grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2">

          {/* Top Sellers */}
          <div>
            <div className="mb-2.5 sm:mb-3 flex items-center gap-2">
              <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-[8px] sm:rounded-[10px] bg-emerald-500/10 ring-1 ring-emerald-400/20">
                <Flame size={11} className="text-emerald-400 sm:[&]:w-[13px] sm:[&]:h-[13px]" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Top Sellers</span>
            </div>
            {topSelling.length === 0 ? (
              <div className="rounded-[12px] sm:rounded-[14px] border border-white/[0.05] bg-white/[0.02] p-4 sm:px-4 sm:py-5 text-center">
                <p className="text-[11px] sm:text-[12px] text-slate-500 leading-relaxed">No sales data yet — process some bills to see top sellers.</p>
              </div>
            ) : (
              <div className="stagger-children space-y-1.5 sm:space-y-2">
                {topSelling.map((ins, i) => (
                  <div key={i} className="group flex items-center gap-2.5 sm:gap-3 rounded-[12px] sm:rounded-[14px] border border-white/[0.05] bg-white/[0.02] px-3 sm:px-4 py-2.5 sm:py-3 transition-all duration-300 hover:bg-white/[0.04] hover:border-white/[0.08]">
                    <div className="flex h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0 items-center justify-center rounded-[6px] sm:rounded-[8px] bg-emerald-500/10 text-[10px] sm:text-[11px] font-bold text-emerald-400 ring-1 ring-emerald-400/15">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] sm:text-[13px] font-medium text-slate-200">{ins.productName}</p>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">{ins.message.split('\u2014')[1]?.trim() ?? ins.message}</p>
                    </div>
                    <TrendingUp size={13} className="flex-shrink-0 text-emerald-400/60 transition-colors group-hover:text-emerald-400 sm:[&]:w-[14px] sm:[&]:h-[14px]" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Slow Moving */}
          <div>
            <div className="mb-2.5 sm:mb-3 flex items-center gap-2">
              <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-[8px] sm:rounded-[10px] bg-amber-500/10 ring-1 ring-amber-400/20">
                <Snail size={11} className="text-amber-400 sm:[&]:w-[13px] sm:[&]:h-[13px]" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">Slow Moving</span>
            </div>
            {lowSelling.length === 0 ? (
              <div className="rounded-[12px] sm:rounded-[14px] border border-white/[0.05] bg-white/[0.02] p-4 sm:px-4 sm:py-5 text-center">
                <p className="text-[11px] sm:text-[12px] text-slate-500 leading-relaxed">All products are moving well — no slow movers detected.</p>
              </div>
            ) : (
              <div className="stagger-children space-y-1.5 sm:space-y-2">
                {lowSelling.map((ins, i) => (
                  <div key={i} className="group flex items-center gap-2.5 sm:gap-3 rounded-[12px] sm:rounded-[14px] border border-amber-400/[0.08] bg-amber-500/[0.03] px-3 sm:px-4 py-2.5 sm:py-3 transition-all duration-300 hover:bg-amber-500/[0.06] hover:border-amber-400/[0.15]">
                    <div className="flex h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0 items-center justify-center rounded-[6px] sm:rounded-[8px] bg-amber-500/10 ring-1 ring-amber-400/15">
                      <TrendingDown size={11} className="text-amber-400 sm:[&]:w-[12px] sm:[&]:h-[12px]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] sm:text-[13px] font-medium text-slate-200">{ins.productName}</p>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">{ins.message.split('\u2014')[0]?.trim() ?? ins.message}</p>
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
