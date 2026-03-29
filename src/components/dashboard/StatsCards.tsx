// ============================================================
// Dashboard Stats Cards - Today's key metrics at a glance
// ============================================================

'use client';

import Card from '@/components/ui/Card';
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
            icon: DollarSign,
            accent: 'text-brand-300',
            glow: 'bg-brand-500/12',
        },
        {
            label: 'Bills Today',
            value: stats.todayBills.toString(),
            icon: Receipt,
            accent: 'text-sky-300',
            glow: 'bg-sky-500/12',
        },
        {
            label: "Today's Profit",
            value: formatCurrency(stats.todayProfit),
            icon: TrendingUp,
            accent: 'text-emerald-300',
            glow: 'bg-emerald-500/12',
        },
        {
            label: 'Total Products',
            value: stats.totalProducts.toString(),
            icon: Package,
            accent: 'text-violet-300',
            glow: 'bg-violet-500/12',
        },
        {
            label: 'Low Stock',
            value: stats.lowStockCount.toString(),
            icon: AlertTriangle,
            accent: 'text-amber-300',
            glow: 'bg-amber-500/12',
        },
        {
            label: 'Expiring Soon',
            value: stats.expiringCount.toString(),
            icon: Clock,
            accent: 'text-rose-300',
            glow: 'bg-rose-500/12',
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-6">
            {cards.map((card) => (
                <Card key={card.label} padding="sm" className="overflow-hidden">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{card.label}</p>
                            <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-50">{card.value}</p>
                        </div>
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.glow}`}>
                            <card.icon size={19} className={card.accent} />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
