'use client';

import { memo } from 'react';
import { DollarSign, Receipt, TrendingUp, Package, AlertTriangle, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface StatsCardsProps {
  stats: {
    todaySales: number;
    todayBills: number;
    todayProfit: number;
    totalProducts: number;
    lowStockCount: number;
    expiringCount: number;
  };
}

function StatsCardsInner({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: "Today's Sales",
      value: formatCurrency(stats.todaySales),
      sub: 'Total revenue',
      icon: DollarSign,
      accent: 'emerald',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 ring-1 ring-emerald-400/20',
      glowColor: 'bg-emerald-500/[0.07]',
      topLine: 'from-transparent via-emerald-400/40 to-transparent',
    },
    {
      label: 'Bills Today',
      value: stats.todayBills.toString(),
      sub: 'Transactions',
      icon: Receipt,
      accent: 'slate',
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-500/10 ring-1 ring-sky-400/20',
      glowColor: 'bg-sky-500/[0.05]',
      topLine: 'from-transparent via-sky-400/30 to-transparent',
    },
    {
      label: "Today's Profit",
      value: formatCurrency(stats.todayProfit),
      sub: 'Net margin',
      icon: TrendingUp,
      accent: 'emerald',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 ring-1 ring-emerald-400/20',
      glowColor: 'bg-emerald-500/[0.07]',
      topLine: 'from-transparent via-emerald-400/40 to-transparent',
    },
    {
      label: 'Total Products',
      value: stats.totalProducts.toString(),
      sub: 'Active SKUs',
      icon: Package,
      accent: 'violet',
      iconColor: 'text-violet-400',
      iconBg: 'bg-violet-500/10 ring-1 ring-violet-400/20',
      glowColor: 'bg-violet-500/[0.05]',
      topLine: 'from-transparent via-violet-400/30 to-transparent',
    },
    {
      label: 'Low Stock',
      value: stats.lowStockCount.toString(),
      sub: 'Need reorder',
      icon: AlertTriangle,
      accent: 'amber',
      iconColor: stats.lowStockCount > 0 ? 'text-amber-400' : 'text-slate-500',
      iconBg: stats.lowStockCount > 0 ? 'bg-amber-500/10 ring-1 ring-amber-400/20' : 'bg-white/[0.04] ring-1 ring-white/[0.06]',
      glowColor: stats.lowStockCount > 0 ? 'bg-amber-500/[0.06]' : 'bg-transparent',
      topLine: stats.lowStockCount > 0 ? 'from-transparent via-amber-400/40 to-transparent' : 'from-transparent via-white/[0.06] to-transparent',
    },
    {
      label: 'Expiring Soon',
      value: stats.expiringCount.toString(),
      sub: 'Within 3 days',
      icon: Clock,
      accent: 'rose',
      iconColor: stats.expiringCount > 0 ? 'text-rose-400' : 'text-slate-500',
      iconBg: stats.expiringCount > 0 ? 'bg-rose-500/10 ring-1 ring-rose-400/20' : 'bg-white/[0.04] ring-1 ring-white/[0.06]',
      glowColor: stats.expiringCount > 0 ? 'bg-rose-500/[0.06]' : 'bg-transparent',
      topLine: stats.expiringCount > 0 ? 'from-transparent via-rose-400/40 to-transparent' : 'from-transparent via-white/[0.06] to-transparent',
    },
  ];

  return (
    <div className="stagger-children grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="premium-card group flex flex-col items-center text-center sm:items-start sm:text-left rounded-[16px] sm:rounded-[20px] p-4 sm:p-5"
        >
          {/* Top glow line */}
          <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${card.topLine}`} />

          {/* Background glow orb */}
          <div className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${card.glowColor} blur-[40px] opacity-60 transition-opacity duration-500 group-hover:opacity-100`} />

          {/* Icon */}
          <div className={`relative mb-3 sm:mb-4 flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl ${card.iconBg} transition-transform duration-300 group-hover:scale-110`}>
            <card.icon size={16} className={`${card.iconColor} sm:[&]:w-[18px] sm:[&]:h-[18px]`} />
          </div>

          {/* Value */}
          <p className="relative w-full text-[18px] sm:text-[24px] lg:text-[26px] font-semibold leading-none tracking-[-0.04em] text-slate-50 tabular-nums">
            {card.value}
          </p>

          {/* Label */}
          <p className="relative mt-2 sm:mt-2.5 w-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            {card.label}
          </p>

          {/* Sub */}
          <p className="relative mt-0.5 w-full text-[10px] sm:text-[11px] text-slate-600">
            {card.sub}
          </p>
        </div>
      ))}
    </div>
  );
}

export default memo(StatsCardsInner);
