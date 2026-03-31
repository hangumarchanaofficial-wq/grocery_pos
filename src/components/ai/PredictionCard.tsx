'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { StockPrediction } from '@/types';
import { TrendingDown, AlertTriangle, CheckCircle, Package } from 'lucide-react';

export default function PredictionCard() {
  const { apiFetch } = useAuth();
  const [predictions, setPredictions] = useState<StockPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch('/api/ai/predictions');
        const data = await res.json();
        setPredictions(data.predictions ?? []);
      } catch { setPredictions([]); }
      finally { setLoading(false); }
    }
    load();
  }, [apiFetch]);

  const urgent = predictions.filter(p => p.urgency !== 'ok').slice(0, 8);

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/[0.07] bg-gradient-to-br from-[rgba(6,14,30,0.96)] to-[rgba(3,8,18,0.98)] p-6 min-h-[320px] shadow-[0_32px_80px_rgba(0,0,0,0.35)]">
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/30 to-transparent" />

      <div className="mb-5">
        <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-slate-100">Stock Predictions</h3>
        <p className="mt-1 text-[11px] text-slate-500">Forecasted stockout timing based on current turnover patterns.</p>
      </div>

      {loading ? (
        <div className="flex min-h-[220px] items-center justify-center gap-3 text-slate-500 text-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-sky-400" />
          Analysing stock...
        </div>
      ) : urgent.length === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-emerald-500/10 ring-1 ring-emerald-400/20">
            <CheckCircle size={26} className="text-emerald-400" />
          </div>
          <p className="text-[14px] font-semibold text-emerald-300">All stock levels look healthy</p>
          <p className="text-[12px] text-slate-500 max-w-xs">No stockout risk detected in the next 7 days based on current sales velocity.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {urgent.map(p => {
            const isCritical = p.urgency === 'critical';
            return (
              <div key={p.productId} className={`rounded-[16px] border p-4 ${isCritical ? 'border-red-400/20 bg-red-500/[0.06]' : 'border-amber-400/20 bg-amber-500/[0.06]'}`}>
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] ${isCritical ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                      {isCritical ? <AlertTriangle size={14} className="text-red-400" /> : <Package size={14} className="text-amber-400" />}
                    </div>
                    <p className="text-[13px] font-semibold text-slate-100 leading-tight">{p.productName}</p>
                  </div>
                  <span className={`flex-shrink-0 rounded-[8px] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${isCritical ? 'bg-red-500/15 text-red-300' : 'bg-amber-500/15 text-amber-300'}`}>
                    {isCritical ? 'Critical' : 'Warning'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-[10px] bg-white/[0.03] p-2">
                    <p className="text-[11px] font-bold text-slate-100">{p.currentStock}</p>
                    <p className="text-[9px] uppercase tracking-[0.15em] text-slate-500 mt-0.5">Stock</p>
                  </div>
                  <div className="rounded-[10px] bg-white/[0.03] p-2">
                    <p className="text-[11px] font-bold text-slate-100">{p.daysUntilStockout}d</p>
                    <p className="text-[9px] uppercase tracking-[0.15em] text-slate-500 mt-0.5">Left</p>
                  </div>
                  <div className="rounded-[10px] bg-white/[0.03] p-2">
                    <p className="text-[11px] font-bold text-slate-100">{p.avgDailySales}</p>
                    <p className="text-[9px] uppercase tracking-[0.15em] text-slate-500 mt-0.5">Daily</p>
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