'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import StatsCards from '@/components/dashboard/StatsCards';
import SalesChart from '@/components/dashboard/SalesChart';
import TopProducts from '@/components/dashboard/TopProducts';
import AlertsPanel from '@/components/dashboard/AlertsPanel';
import PredictionCard from '@/components/ai/PredictionCard';
import { ShoppingCart, Package, Brain, Activity, Zap, Clock, Target, Sparkles, TrendingUp, Shield } from 'lucide-react';
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
          <div className="absolute inset-0 h-12 w-12 rounded-full bg-emerald-500/20 blur-xl animate-glow-pulse" />
          <div className="relative h-12 w-12 animate-spin rounded-full border-[3px] border-emerald-500/20 border-t-emerald-400" />
        </div>
        <p className="text-xs font-medium text-slate-500">Loading dashboard...</p>
      </div>
    </div>
  );

  const greeting = time.getHours() < 12 ? 'Good morning' : time.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="space-y-3 sm:space-y-4">

      {/* -- HERO ROW -- */}
      <div className="grid gap-3 sm:gap-4 xl:grid-cols-[1fr_360px]">

        {/* LEFT */}
        <div className="premium-card animate-fade-up rounded-[20px] sm:rounded-[24px] p-5 sm:p-7 lg:p-8">
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/[0.06] blur-[80px]" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full bg-sky-500/[0.04] blur-[60px]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-lg">
              <div className="mb-3 sm:mb-4 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-400">Live Operations</span>
              </div>
              <h1 className="text-[clamp(1.5rem,4vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.04em] text-white">
                {greeting},<br />
                <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">{firstName}</span>
              </h1>
              <p className="mt-3 sm:mt-4 max-w-md text-[11.5px] sm:text-[13px] leading-[1.7] text-slate-400">
                Your store is operating smoothly. Monitor floor activity, push invoices, and stay ahead of stock risks.
              </p>
              <div className="mt-4 sm:mt-6 flex flex-wrap gap-2.5 sm:gap-3">
                <Link href="/dashboard/billing">
                  <button className="flex items-center gap-2 rounded-[12px] sm:rounded-[14px] bg-emerald-500 px-4 sm:px-5 py-2.5 text-[12px] sm:text-sm font-semibold text-slate-950 shadow-[0_8px_32px_rgba(34,197,94,0.3)] transition-all hover:bg-emerald-400 hover:shadow-[0_12px_40px_rgba(34,197,94,0.4)] active:scale-[0.97]">
                    <ShoppingCart size={15} /> Open Register
                  </button>
                </Link>
                {['OWNER', 'MANAGER'].includes(user?.role ?? '') && (
                  <Link href="/dashboard/inventory">
                    <button className="flex items-center gap-2 rounded-[12px] sm:rounded-[14px] border border-white/[0.09] bg-white/[0.05] px-4 sm:px-5 py-2.5 text-[12px] sm:text-sm font-semibold text-slate-200 transition-all hover:border-white/[0.15] hover:bg-white/[0.08] hover:text-white active:scale-[0.97]">
                      <Package size={15} /> Manage Stock
                    </button>
                  </Link>
                )}
              </div>
            </div>
            {/* Mini status cards */}
            <div className="grid w-full grid-cols-3 gap-2 sm:gap-2.5 lg:w-[240px] lg:grid-cols-1">
              {[
                { label: 'Register', value: 'Online', sub: 'Syncing live', icon: Activity, color: 'emerald' },
                { label: 'Time', value: time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), sub: time.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }), icon: Clock, color: 'sky' },
                { label: 'AI Engine', value: 'Active', sub: 'Predictions live', icon: Sparkles, color: 'violet' },
              ].map((card) => (
                <div key={card.label} className="rounded-[10px] sm:rounded-[14px] border border-white/[0.06] bg-white/[0.025] p-2.5 sm:p-3.5 transition-all duration-300 hover:bg-white/[0.04]">
                  <div className="mb-1.5 sm:mb-2.5 flex items-center justify-between">
                    <span className="text-[7px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">{card.label}</span>
                    <div className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md sm:rounded-lg bg-${card.color}-500/10`}>
                      <card.icon size={10} className={`text-${card.color}-400 sm:[&]:w-3 sm:[&]:h-3`} />
                    </div>
                  </div>
                  <p className="text-[11px] sm:text-[13px] font-semibold tabular-nums text-slate-100">{card.value}</p>
                  <p className="mt-0.5 text-[9px] sm:text-[10px] text-slate-600">{card.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Intelligence Brief */}
        <div className="premium-card animate-fade-up rounded-[20px] sm:rounded-[24px] p-5 sm:p-6" style={{ animationDelay: '0.1s' }}>
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-500/[0.08] blur-[70px]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />
          <div className="relative">
            <div className="mb-4 sm:mb-5 flex items-center gap-2.5 sm:gap-3">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-[12px] sm:rounded-[14px] border border-violet-400/20 bg-violet-500/15 shadow-[0_8px_24px_rgba(139,92,246,0.15)]">
                <Brain size={16} className="text-violet-300 sm:[&]:w-[18px] sm:[&]:h-[18px]" />
              </div>
              <div>
                <h3 className="text-[13px] sm:text-[15px] font-semibold tracking-[-0.02em] text-slate-100">Intelligence Brief</h3>
                <p className="text-[10px] sm:text-[11px] text-slate-500">AI-powered daily summary</p>
              </div>
            </div>
            <div className="space-y-2 sm:space-y-2.5">
              {[
                { icon: Target, label: 'Priority', color: 'amber', text: 'Review perishables before close \u2014 items nearing expiry date.' },
                { icon: Zap, label: 'Throughput', color: 'emerald', text: 'Invoice pace is strong today. Push express checkout if queue grows.' },
                { icon: TrendingUp, label: 'Trend', color: 'sky', text: 'Weekend sales peak after 17:00. Prepare for higher foot traffic.' },
              ].map((item) => (
                <div key={item.label} className={`rounded-[12px] sm:rounded-[14px] border border-${item.color}-400/[0.12] bg-${item.color}-500/[0.06] p-3 sm:p-3.5 transition-all duration-300 hover:bg-${item.color}-500/[0.09]`}>
                  <div className="mb-1 sm:mb-1.5 flex items-center gap-2">
                    <item.icon size={10} className={`text-${item.color}-400`} />
                    <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-${item.color}-400`}>{item.label}</span>
                  </div>
                  <p className="text-[11px] sm:text-[12.5px] leading-[1.6] text-slate-300">{item.text}</p>
                </div>
              ))}
              <div className="rounded-[10px] sm:rounded-[12px] border border-white/[0.05] bg-white/[0.02] p-2 sm:p-2.5">
                <div className="flex items-center gap-2 text-slate-600"><Shield size={10} /><span className="text-[9px] sm:text-[10px]">All systems secure &middot; Last sync 1 min ago</span></div>
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

      {/* STOCK PREDICTIONS + TOP PRODUCTS */}
      {['OWNER', 'MANAGER'].includes(user?.role ?? '') && (
        <>
          <PredictionCard />
          <TopProducts />
        </>
      )}

    </div>
  );
}
