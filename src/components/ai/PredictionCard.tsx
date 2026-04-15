'use client';

import type { StockPrediction } from '@/types';
import { TrendingDown, AlertTriangle, CheckCircle, Package, Sparkles } from 'lucide-react';

type Props = { predictions: StockPrediction[]; loading: boolean };

export default function PredictionCard({ predictions, loading }: Props) {
  const urgent = predictions.filter(p => p.urgency !== 'ok').slice(0, 8);

  return (
    <div className="premium-card animate-fade-up rounded-[20px] sm:rounded-[24px] p-4 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/30 to-transparent" />
      <div className="pointer-events-none absolute -left-12 -top-12 h-32 w-32 rounded-full bg-sky-500/[0.06] blur-[50px]" />

      <div className="relative mb-4 sm:mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-[12px] sm:rounded-[14px] border border-sky-400/20 bg-sky-500/10 shadow-[0_8px_24px_rgba(56,189,248,0.12)]">
          <Sparkles size={15} className="text-sky-400 sm:[&]:w-[17px] sm:[&]:h-[17px]" />
        </div>
        <div>
          <h3 className="text-[13px] sm:text-[15px] font-semibold tracking-[-0.02em] text-slate-100">Stock Predictions</h3>
          <p className="text-[10px] sm:text-[11px] text-slate-500">Forecasted stockout timing</p>
        </div>
      </div>

      {loading ? (
        <div className="relative flex min-h-[180px] sm:min-h-[220px] items-center justify-center gap-3 text-slate-500 text-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-sky-400" />
          <span className="text-[12px]">Analysing stock...</span>
        </div>
      ) : urgent.length === 0 ? (
        <div className="relative flex min-h-[180px] sm:min-h-[220px] flex-col items-center justify-center gap-3 text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-[18px] bg-emerald-500/20 blur-xl animate-glow-pulse" />
            <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-[18px] bg-emerald-500/10 ring-1 ring-emerald-400/20">
              <CheckCircle size={24} className="text-emerald-400 sm:[&]:w-[28px] sm:[&]:h-[28px]" />
            </div>
          </div>
          <p className="text-[13px] sm:text-[14px] font-semibold text-emerald-300">All stock levels look healthy</p>
          <p className="text-[11px] sm:text-[12px] text-slate-500 max-w-xs leading-relaxed">No stockout risk detected in the next 7 days based on current sales velocity.</p>
        </div>
      ) : (
        <div className="stagger-children relative grid grid-cols-1 gap-2.5 sm:gap-3 sm:grid-cols-2">
          {urgent.map(p => {
            const isCritical = p.urgency === 'critical';
            return (
              <div key={p.productId} className={`group rounded-[14px] sm:rounded-[16px] border p-3.5 sm:p-4 transition-all duration-300 hover:scale-[1.01] ${
                isCritical
                  ? 'border-red-400/15 bg-gradient-to-br from-red-500/[0.08] to-red-500/[0.02]'
                  : 'border-amber-400/15 bg-gradient-to-br from-amber-500/[0.08] to-amber-500/[0.02]'
              }`}>
                <div className="mb-2.5 sm:mb-3 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-[8px] sm:rounded-[10px] ${
                      isCritical ? 'bg-red-500/10 ring-1 ring-red-400/20' : 'bg-amber-500/10 ring-1 ring-amber-400/20'
                    }`}>
                      {isCritical
                        ? <AlertTriangle size={13} className="text-red-400 sm:[&]:w-[14px] sm:[&]:h-[14px]" />
                        : <Package size={13} className="text-amber-400 sm:[&]:w-[14px] sm:[&]:h-[14px]" />
                      }
                    </div>
                    <p className="text-[12px] sm:text-[13px] font-semibold text-slate-100 leading-tight">{p.productName}</p>
                  </div>
                  <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] ${
                    isCritical ? 'bg-red-500/15 text-red-300 ring-1 ring-red-400/20' : 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/20'
                  }`}>
                    {isCritical ? 'Critical' : 'Warning'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
                  <div className="rounded-[8px] sm:rounded-[10px] bg-white/[0.03] ring-1 ring-white/[0.04] p-2 sm:p-2.5">
                    <p className="text-[11px] sm:text-[12px] font-bold text-slate-100">{p.currentStock}</p>
                    <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.15em] text-slate-500 mt-0.5">Stock</p>
                  </div>
                  <div className="rounded-[8px] sm:rounded-[10px] bg-white/[0.03] ring-1 ring-white/[0.04] p-2 sm:p-2.5">
                    <p className="text-[11px] sm:text-[12px] font-bold text-slate-100">{p.daysUntilStockout}d</p>
                    <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.15em] text-slate-500 mt-0.5">Left</p>
                  </div>
                  <div className="rounded-[8px] sm:rounded-[10px] bg-white/[0.03] ring-1 ring-white/[0.04] p-2 sm:p-2.5">
                    <p className="text-[11px] sm:text-[12px] font-bold text-slate-100">{p.avgDailySales}</p>
                    <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.15em] text-slate-500 mt-0.5">Daily</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
