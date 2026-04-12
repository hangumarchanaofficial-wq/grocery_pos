'use client';

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

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: "Today's Sales",
      value: formatCurrency(stats.todaySales),
      sub: 'Total revenue',
      icon: DollarSign,
      iconColor: 'text-brand-400',
      iconBg: 'bg-brand-500/8',
    },
    {
      label: 'Bills Today',
      value: stats.todayBills.toString(),
      sub: 'Transactions',
      icon: Receipt,
      iconColor: 'text-slate-400',
      iconBg: 'bg-slate-500/8',
    },
    {
      label: "Today's Profit",
      value: formatCurrency(stats.todayProfit),
      sub: 'Net margin',
      icon: TrendingUp,
      iconColor: 'text-brand-400',
      iconBg: 'bg-brand-500/8',
    },
    {
      label: 'Total Products',
      value: stats.totalProducts.toString(),
      sub: 'Active SKUs',
      icon: Package,
      iconColor: 'text-slate-400',
      iconBg: 'bg-slate-500/8',
    },
    {
      label: 'Low Stock',
      value: stats.lowStockCount.toString(),
      sub: 'Need reorder',
      icon: AlertTriangle,
      iconColor: stats.lowStockCount > 0 ? 'text-amber-400' : 'text-slate-400',
      iconBg:   stats.lowStockCount > 0 ? 'bg-amber-500/8' : 'bg-slate-500/8',
    },
    {
      label: 'Expiring Soon',
      value: stats.expiringCount.toString(),
      sub: 'Within 3 days',
      icon: Clock,
      iconColor: stats.expiringCount > 0 ? 'text-rose-400' : 'text-slate-400',
      iconBg:   stats.expiringCount > 0 ? 'bg-rose-500/8' : 'bg-slate-500/8',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="relative overflow-hidden rounded-[16px] sm:rounded-[20px] border border-white/[0.06] bg-white/[0.03] p-4 sm:p-5 lg:p-6 backdrop-blur-sm transition-all duration-200 hover:border-white/[0.10] hover:bg-white/[0.05]"
        >
          {/* Icon */}
          <div className={`mb-3 sm:mb-5 inline-flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-lg sm:rounded-xl ${card.iconBg}`}>
            <card.icon size={17} className={`${card.iconColor} sm:[&]:w-5 sm:[&]:h-5`} />
          </div>

          {/* Value */}
          <p className="text-[20px] sm:text-[28px] font-semibold leading-none tracking-[-0.04em] text-slate-50">
            {card.value}
          </p>

          {/* Label */}
          <p className="mt-2 sm:mt-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            {card.label}
          </p>

          {/* Sub */}
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-600">
            {card.sub}
          </p>
        </div>
      ))}
    </div>
  );
}
