// ============================================================
// Stock Prediction Cards - When will products run out?
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import type { StockPrediction } from '@/types';

export default function PredictionCard() {
    const { apiFetch } = useAuth();
    const [predictions, setPredictions] = useState<StockPrediction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await apiFetch('/api/ai/predictions');
                const data = await res.json();
                setPredictions(data.predictions || []);
            } catch {
                setPredictions([]);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [apiFetch]);

    const urgencyConfig = {
        critical: { icon: AlertTriangle, color: 'text-red-300', bg: 'bg-red-500/[0.08]', badge: 'danger' as const },
        warning: { icon: Clock, color: 'text-amber-300', bg: 'bg-amber-500/[0.08]', badge: 'warning' as const },
        ok: { icon: CheckCircle, color: 'text-emerald-300', bg: 'bg-emerald-500/[0.08]', badge: 'success' as const },
    };

    if (loading) {
        return <Card><div className="py-8 text-center text-slate-500">Calculating predictions...</div></Card>;
    }

    return (
        <Card className="glass-panel-strong">
            <div className="mb-5">
                <h3 className="section-title text-xl font-semibold">Stock Predictions</h3>
                <p className="section-subtitle mt-1 text-sm">Forecasted stockout timing based on current turnover patterns.</p>
            </div>
            {predictions.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-500">All stock levels look healthy.</p>
            ) : (
                <div className="space-y-3">
                    {predictions.map((pred) => {
                        const config = urgencyConfig[pred.urgency];
                        const Icon = config.icon;
                        return (
                            <div
                                key={pred.productId}
                                className={`flex items-center gap-3 rounded-[24px] border border-white/8 ${config.bg} p-4`}
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/6">
                                    <Icon size={20} className={config.color} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-100">{pred.productName}</p>
                                    <p className="text-xs text-slate-400">
                                        Stock: {pred.currentStock} | Avg sales: {pred.avgDailySales}/day
                                    </p>
                                </div>
                                <div className="text-right">
                                    <Badge variant={config.badge}>
                                        {pred.daysUntilStockout <= 0 ? 'OUT' : `${pred.daysUntilStockout} days`}
                                    </Badge>
                                    <p className="mt-1 text-xs text-slate-500">{pred.predictedStockoutDate}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}
