'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChevronDown, BarChart3 } from 'lucide-react';

const WINDOWS = [
  { label: '7 Days',    value: '7d',   days: 7,   period: 'daily'   },
  { label: '30 Days',   value: '30d',  days: 30,  period: 'daily'   },
  { label: '3 Months',  value: '3m',   days: 90,  period: 'weekly'  },
  { label: '6 Months',  value: '6m',   days: 180, period: 'weekly'  },
  { label: '12 Months', value: '12m',  days: 365, period: 'monthly' },
];

interface ChartRow { date: string; label?: string; totalSales: number; totalProfit: number; totalBills: number; }

interface SalesChartProps {
  data?: { date: string; label: string; sales: number; profit: number; bills: number }[];
}

export default function SalesChart({ data: initialData }: SalesChartProps) {
  const { apiFetch } = useAuth();
  const [selected, setSelected] = useState(WINDOWS[0]);
  const [open, setOpen] = useState(false);
  const [chartData, setChartData] = useState<ChartRow[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (selected.value === '7d' && initialData?.length) {
      setChartData(initialData.map(d => ({
        date: d.date,
        label: d.label,
        totalSales: d.sales,
        totalProfit: d.profit,
        totalBills: d.bills,
      })));
      return;
    }
    async function load() {
      setLoading(true);
      try {
        const from = new Date(Date.now() - selected.days * 86400000).toISOString().slice(0, 10);
        const to   = new Date().toISOString().slice(0, 10);
        const res  = await apiFetch(`/api/reports?period=${selected.period}&from=${from}&to=${to}`);
        const json = await res.json();
        setChartData(json.report ?? []);
      } catch { setChartData([]); }
      finally  { setLoading(false); }
    }
    load();
  }, [selected, initialData, apiFetch]);

  const fmt = (v: number | string | readonly (string | number)[] | undefined) => {
    const n = typeof v === 'number' ? v : Number(Array.isArray(v) ? v[0] : v ?? 0);
    return `Rs ${n.toLocaleString('en-IN')}`;
  };

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/[0.07] bg-gradient-to-br from-[rgba(6,14,30,0.96)] to-[rgba(3,8,18,0.98)] p-6 shadow-[0_32px_80px_rgba(0,0,0,0.35)]">
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-emerald-400/20 bg-emerald-500/10">
            <BarChart3 size={18} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-slate-100">Sales Overview</h3>
            <p className="text-[11px] text-slate-500">Revenue and profit velocity</p>
          </div>
        </div>

        {/* Window Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-2 rounded-[12px] border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-[12px] font-semibold text-slate-200 transition-all hover:border-white/[0.13] hover:bg-white/[0.07]"
          >
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mr-1">Window</span>
            {selected.label}
            <ChevronDown size={13} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-[16px] border border-white/[0.09] bg-[rgba(10,18,35,0.97)] shadow-[0_24px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              {WINDOWS.map(w => (
                <button
                  key={w.value}
                  onClick={() => { setSelected(w); setOpen(false); }}
                  className={`flex w-full items-center justify-between px-4 py-3 text-[12px] font-medium transition-colors hover:bg-white/[0.05] ${
                    selected.value === w.value ? 'text-emerald-400' : 'text-slate-300'
                  }`}
                >
                  {w.label}
                  {selected.value === w.value && <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="flex h-72 items-center justify-center text-slate-500 text-sm">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-600 border-t-emerald-400 mr-3" />
          Loading chart...
        </div>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#94a3b8" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" vertical={false} />
              <XAxis dataKey={chartData[0]?.label ? 'label' : 'date'} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => `Rs ${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.025)' }}
                contentStyle={{ borderRadius: '16px', border: '1px solid rgba(148,163,184,0.1)', background: 'rgba(8,16,32,0.97)', backdropFilter: 'blur(20px)', boxShadow: '0 32px 80px rgba(0,0,0,0.4)', color: '#e2e8f0', fontSize: '12px' }}
                formatter={(v, name) => [fmt(v), name === 'totalSales' ? 'Sales' : 'Profit']}
              />
              <Legend wrapperStyle={{ color: '#64748b', fontSize: '11px', paddingTop: '16px' }} formatter={v => v === 'totalSales' ? 'Sales' : 'Profit'} />
              <Bar dataKey="totalSales" fill="url(#salesGrad)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="totalProfit" fill="url(#profitGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}