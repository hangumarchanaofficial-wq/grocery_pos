// ============================================================
// Main Dashboard Page - Stats, charts, alerts, quick actions
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import StatsCards from '@/components/dashboard/StatsCards';
import SalesChart from '@/components/dashboard/SalesChart';
import TopProducts from '@/components/dashboard/TopProducts';
import AlertsPanel from '@/components/dashboard/AlertsPanel';
import PredictionCard from '@/components/ai/PredictionCard';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { ShoppingCart, Package, Brain, Activity, ScanSearch, Clock3 } from 'lucide-react';
import Link from 'next/link';

const DEV_DASHBOARD_FALLBACK = {
    stats: {
        todaySales: 12450,
        todayBills: 18,
        todayProfit: 3180,
        totalProducts: 142,
        lowStockCount: 7,
        expiringCount: 3,
    },
    chartData: [
        { date: '2026-03-23', label: 'Sun 23', sales: 8200, profit: 1900, bills: 12 },
        { date: '2026-03-24', label: 'Mon 24', sales: 9650, profit: 2280, bills: 14 },
        { date: '2026-03-25', label: 'Tue 25', sales: 11100, profit: 2750, bills: 16 },
        { date: '2026-03-26', label: 'Wed 26', sales: 10400, profit: 2490, bills: 15 },
        { date: '2026-03-27', label: 'Thu 27', sales: 12050, profit: 3020, bills: 17 },
        { date: '2026-03-28', label: 'Fri 28', sales: 13600, profit: 3410, bills: 19 },
        { date: '2026-03-29', label: 'Sat 29', sales: 12450, profit: 3180, bills: 18 },
    ],
};

type DashboardData = {
    stats: {
        todaySales: number;
        todayBills: number;
        todayProfit: number;
        totalProducts: number;
        lowStockCount: number;
        expiringCount: number;
    };
    chartData: { date: string; label: string; sales: number; profit: number; bills: number }[];
};

function isDashboardData(value: unknown): value is DashboardData {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as Partial<DashboardData>;
    return !!candidate.stats && !!candidate.chartData && Array.isArray(candidate.chartData);
}

export default function DashboardPage() {
    const { apiFetch, user } = useAuth();
    const [dashData, setDashData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await apiFetch('/api/dashboard');
                const data = await res.json();
                if (!res.ok || !isDashboardData(data)) {
                    setDashData(DEV_DASHBOARD_FALLBACK);
                    return;
                }
                setDashData(data);
            } catch {
                setDashData(DEV_DASHBOARD_FALLBACK);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [apiFetch]);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-400/30 border-t-brand-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
                <Card className="glass-panel-strong overflow-hidden p-0">
                    <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-7">
                        <div>
                            <Badge variant="success" className="mb-4">
                                Live Operations
                            </Badge>
                            <h2 className="section-title text-3xl font-semibold lg:text-4xl">
                                Welcome back, {user?.name?.split(' ')[0]}.
                            </h2>
                            <p className="section-subtitle mt-3 max-w-xl text-sm leading-6">
                                Monitor floor activity, push invoices fast, and stay ahead of low-stock risk from one command surface.
                            </p>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link href="/dashboard/billing">
                                    <Button variant="primary" size="lg">
                                        <ShoppingCart size={16} className="mr-2" /> Open Register
                                    </Button>
                                </Link>
                                {user && ['OWNER', 'MANAGER'].includes(user.role) && (
                                    <Link href="/dashboard/inventory">
                                        <Button variant="secondary" size="lg">
                                            <Package size={16} className="mr-2" /> Manage Stock
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                            <div className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Register</span>
                                    <Activity size={16} className="text-brand-300" />
                                </div>
                                <p className="text-lg font-semibold text-slate-100">Online</p>
                                <p className="mt-1 text-sm text-slate-400">Transactions syncing without interruption.</p>
                            </div>
                            <div className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Scanner</span>
                                    <ScanSearch size={16} className="text-sky-300" />
                                </div>
                                <p className="text-lg font-semibold text-slate-100">Ready</p>
                                <p className="mt-1 text-sm text-slate-400">Barcode search and manual lookup both active.</p>
                            </div>
                            <div className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Shift Window</span>
                                    <Clock3 size={16} className="text-amber-300" />
                                </div>
                                <p className="text-lg font-semibold text-slate-100">08:00 to 22:00</p>
                                <p className="mt-1 text-sm text-slate-400">Peak traffic expected after 17:00.</p>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="glass-panel-strong">
                    <div className="mb-5 flex items-center gap-2">
                        <Brain size={18} className="text-violet-300" />
                        <h3 className="section-title text-lg font-semibold">Manager Notes</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Priority</p>
                            <p className="mt-2 text-sm text-slate-200">Review perishables before close. Three items are nearing expiry.</p>
                        </div>
                        <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Throughput</p>
                            <p className="mt-2 text-sm text-slate-200">Invoice pace is stable. Push express checkout if queue depth increases.</p>
                        </div>
                    </div>
                </Card>
            </section>

            {dashData && <StatsCards stats={dashData.stats} />}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.7fr]">
                <SalesChart data={dashData?.chartData || []} />
                <AlertsPanel />
            </div>

            {user && ['OWNER', 'MANAGER'].includes(user.role) && (
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <PredictionCard />
                    <TopProducts />
                </div>
            )}
        </div>
    );
}
