'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import StatsCards from '@/components/dashboard/StatsCards';
import SalesChart from '@/components/dashboard/SalesChart';
import TopProducts from '@/components/dashboard/TopProducts';
import AlertsPanel from '@/components/dashboard/AlertsPanel';
import PredictionCard from '@/components/ai/PredictionCard';
import { ShoppingCart, Package, Brain, Activity, Zap, ArrowUpRight, Clock, Target, Sparkles, TrendingUp, Shield } from 'lucide-react';
import Link from 'next/link';

const FALLBACK = {
  stats: { todaySales: 0, todayBills: 0, todayProfit: 0, totalProducts: 0, lowStockCount: 0, expiringCount: 0 },
  chartData: [
    { date: '2026-03-23', label: 'Mon 23', sales: 0, profit: 0, bills: 0 },
    { date: '2026-03-24', label: 'Tue 24', sales: 0, profit: 0, bills: 0 },
    { date: '2026-03-25', label: 'Wed 25', sales: 0, profit: 0, bills: 0 },
    { date: '2026-03-26', label: 'Thu 26', sales: 0, profit: 0, bills: 0 },
    { date: '2026-03-27', label: 'Fri 27', sales: 0, profit: 0, bills: 0 },
    { date: '2026-03-28', label: 'Sat 28', sales: 0, profit: 0, bills: 0 },
    { date: '2026-03-29', label: 'Sun 29', sales: 0, profit: 0, bills: 0 },
  ],
};

type DashboardData = typeof FALLBACK;

export default function DashboardPage() {
  const { apiFetch, user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch('/api/dashboard');
        const json = await res.json();
        if (res.ok && json?.stats && json?.chartData) setData(json);
        else setData(FALLBACK);
      } catch { setData(FALLBACK); }
      finally { setLoading(false); }
    }
    load();
  }, [apiFetch]);

  if (loading) return (
    <div className="flex h-[70vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-emerald-500/20 border-t-emerald-400" />
          <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border border-emerald-400/10" />
        </div>
        <p className="text-xs font-medium text-slate-500">Loading dashboard...</p>
      </div>
    </div>
  );

  const greeting = time.getHours() < 12 ? 'Good morning' : time.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="space-y-5">

      {/* ── HERO ROW ── */}
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">

        {/* LEFT */}
        <div className="relative overflow-hidden rounded-[24px] border border-white/[0.07] bg-gradient-to-br from-[rgba(8,20,40,0.95)] to-[rgba(4,10,22,0.98)] p-7 lg:p-8 shadow-[0_32px_80px_rgba(0,0,0,0.4)]">
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/[0.06] blur-[80px]" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full bg-sky-500/[0.04] blur-[60px]" />
          <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-lg">
              <div className="mb-4 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-400">Live Operations</span>
              </div>
              <h1 className="text-[clamp(2rem,4vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.04em] text-white">
                {greeting},<br />
                <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">{firstName}</span>
              </h1>
              <p className="mt-4 max-w-md text-[13px] leading-[1.75] text-slate-400">
                Your store is operating smoothly. Monitor floor activity, push invoices, and stay ahead of stock risks.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/dashboard/billing">
                  <button className="flex items-center gap-2 rounded-[14px] bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_8px_32px_rgba(34,197,94,0.3)] transition-all hover:bg-emerald-400 hover:shadow-[0_12px_40px_rgba(34,197,94,0.4)] active:scale-[0.98]">
                    <ShoppingCart size={15} /> Open Register
                  </button>
                </Link>
                {['OWNER', 'MANAGER'].includes(user?.role ?? '') && (
                  <Link href="/dashboard/inventory">
                    <button className="flex items-center gap-2 rounded-[14px] border border-white/[0.09] bg-white/[0.05] px-5 py-2.5 text-sm font-semibold text-slate-200 transition-all hover:border-white/[0.15] hover:bg-white/[0.08] hover:text-white active:scale-[0.98]">
                      <Package size={15} /> Manage Stock
                    </button>
                  </Link>
                )}
              </div>
            </div>
            <div className="grid w-full grid-cols-3 gap-3 lg:w-[260px] lg:grid-cols-1">
              <div className="rounded-[16px] border border-white/[0.06] bg-white/[0.03] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Register</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10"><Activity size={12} className="text-emerald-400" /></div>
                </div>
                <p className="text-[13px] font-semibold text-slate-100">Online</p>
                <p className="mt-0.5 text-[11px] text-slate-600">Syncing live</p>
              </div>
              <div className="rounded-[16px] border border-white/[0.06] bg-white/[0.03] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Time</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10"><Clock size={12} className="text-sky-400" /></div>
                </div>
                <p className="text-[13px] font-semibold tabular-nums text-slate-100">{time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="mt-0.5 text-[11px] text-slate-600">{time.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
              </div>
              <div className="rounded-[16px] border border-white/[0.06] bg-white/[0.03] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">AI Engine</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10"><Sparkles size={12} className="text-violet-400" /></div>
                </div>
                <p className="text-[13px] font-semibold text-slate-100">Active</p>
                <p className="mt-0.5 text-[11px] text-slate-600">Predictions live</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative overflow-hidden rounded-[24px] border border-white/[0.07] bg-gradient-to-br from-[rgba(18,12,40,0.95)] to-[rgba(8,6,22,0.98)] p-6 shadow-[0_32px_80px_rgba(0,0,0,0.4)]">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-500/[0.08] blur-[70px]" />
          <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />
          <div className="relative">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-violet-400/20 bg-violet-500/15 shadow-[0_8px_24px_rgba(139,92,246,0.2)]">
                <Brain size={18} className="text-violet-300" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-slate-100">Intelligence Brief</h3>
                <p className="text-[11px] text-slate-500">AI-powered daily summary</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-[14px] border border-amber-400/[0.12] bg-amber-500/[0.06] p-4">
                <div className="mb-2 flex items-center gap-2"><Target size={11} className="text-amber-400" /><span className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-400">Priority</span></div>
                <p className="text-[12.5px] leading-[1.6] text-slate-300">Review perishables before close — items nearing expiry date.</p>
              </div>
              <div className="rounded-[14px] border border-emerald-400/[0.12] bg-emerald-500/[0.06] p-4">
                <div className="mb-2 flex items-center gap-2"><Zap size={11} className="text-emerald-400" /><span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400">Throughput</span></div>
                <p className="text-[12.5px] leading-[1.6] text-slate-300">Invoice pace is strong today. Push express checkout if queue grows.</p>
              </div>
              <div className="rounded-[14px] border border-sky-400/[0.12] bg-sky-500/[0.06] p-4">
                <div className="mb-2 flex items-center gap-2"><TrendingUp size={11} className="text-sky-400" /><span className="text-[9px] font-bold uppercase tracking-[0.2em] text-sky-400">Trend</span></div>
                <p className="text-[12.5px] leading-[1.6] text-slate-300">Weekend sales peak after 17:00. Prepare for higher foot traffic.</p>
              </div>
              <div className="rounded-[14px] border border-white/[0.05] bg-white/[0.02] p-3">
                <div className="flex items-center gap-2 text-slate-600"><Shield size={11} /><span className="text-[10px]">All systems secure · Last sync 1 min ago</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      {data && <StatsCards stats={data.stats} />}

      {/* SALES CHART */}
      <SalesChart data={data?.chartData} />

      {/* ALERTS */}
      <AlertsPanel />

      {/* STOCK PREDICTIONS — full width */}
      {['OWNER', 'MANAGER'].includes(user?.role ?? '') && (
        <>
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 ring-1 ring-sky-400/15">
                <Brain size={15} className="text-sky-300" />
              </div>
              <h3 className="text-lg font-semibold tracking-[-0.03em] text-slate-100">Stock Predictions</h3>
            </div>
            <PredictionCard />
          </div>

          {/* TOP PRODUCTS — full width */}
          <TopProducts />
        </>
      )}

    </div>
  );
}