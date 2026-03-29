// ============================================================
// Top Products - Quick view of best sellers
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { SalesInsight } from '@/types';

export default function TopProducts() {
    const { apiFetch } = useAuth();
    const [insights, setInsights] = useState<SalesInsight[]>([]);

    useEffect(() => {
        async function load() {
            try {
                const res = await apiFetch('/api/ai/insights');
                const data = await res.json();
                setInsights(data.insights || []);
            } catch {
                setInsights([]);
            }
        }
        load();
    }, [apiFetch]);

    const topSellers = insights.filter((i) => i.type === 'top_selling').slice(0, 5);
    const lowSellers = insights.filter((i) => i.type === 'low_selling').slice(0, 3);

    return (
        <Card className="glass-panel-strong">
            <div className="mb-5">
                <h3 className="section-title text-xl font-semibold">Product Insights</h3>
                <p className="section-subtitle mt-1 text-sm">High-performing lines and items that are losing velocity.</p>
            </div>

            <div className="mb-6">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Top Sellers</p>
                <div className="space-y-3">
                    {topSellers.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-[22px] border border-white/8 bg-emerald-500/[0.08] px-4 py-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/12">
                                    <TrendingUp size={16} className="text-emerald-300" />
                                </div>
                                <span className="text-sm font-medium text-slate-100">{item.productName}</span>
                            </div>
                            <Badge variant="success">{item.value} sold</Badge>
                        </div>
                    ))}
                    {topSellers.length === 0 && (
                        <p className="py-2 text-sm text-slate-500">No data yet</p>
                    )}
                </div>
            </div>

            <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Slow Moving</p>
                <div className="space-y-3">
                    {lowSellers.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-[22px] border border-white/8 bg-amber-500/[0.08] px-4 py-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/12">
                                    <TrendingDown size={16} className="text-amber-300" />
                                </div>
                                <span className="text-sm font-medium text-slate-100">{item.productName}</span>
                            </div>
                            <Badge variant="warning">{item.value} sold</Badge>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}
