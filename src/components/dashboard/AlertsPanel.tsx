// ============================================================
// Smart Alerts Panel - AI-generated alerts
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { AlertTriangle, Clock, TrendingDown, Package } from 'lucide-react';
import type { SmartAlert } from '@/types';

const alertIcons = {
    stockout: Package,
    expiry: Clock,
    low_selling: TrendingDown,
    reorder: AlertTriangle,
};

const severityVariant = {
    critical: 'danger' as const,
    warning: 'warning' as const,
    info: 'info' as const,
};

export default function AlertsPanel() {
    const { apiFetch } = useAuth();
    const [alerts, setAlerts] = useState<SmartAlert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await apiFetch('/api/ai/alerts');
                const data = await res.json();
                setAlerts(data.alerts || []);
            } catch {
                setAlerts([]);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [apiFetch]);

    return (
        <Card className="glass-panel-strong h-full">
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h3 className="section-title text-xl font-semibold">Smart Alerts</h3>
                    <p className="section-subtitle mt-1 text-sm">Watchlist for risk, expiry, and movement anomalies.</p>
                </div>
                <Badge variant={alerts.length > 0 ? 'warning' : 'success'}>
                    {alerts.length} active
                </Badge>
            </div>

            {loading ? (
                <div className="py-10 text-center text-slate-500">Loading AI insights...</div>
            ) : alerts.length === 0 ? (
                <div className="flex h-[260px] items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] text-center text-slate-500">
                    All clear. No active alerts.
                </div>
            ) : (
                <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
                    {alerts.slice(0, 10).map((alert) => {
                        const Icon = alertIcons[alert.type] || AlertTriangle;
                        return (
                            <div
                                key={alert.id}
                                className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4"
                            >
                                <div className="flex gap-3">
                                    <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/6">
                                        <Icon size={18} className={
                                            alert.severity === 'critical'
                                                ? 'text-red-300'
                                                : alert.severity === 'warning'
                                                    ? 'text-amber-300'
                                                    : 'text-sky-300'
                                        } />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-sm font-semibold text-slate-100">{alert.title}</p>
                                            <Badge variant={severityVariant[alert.severity]}>
                                                {alert.severity}
                                            </Badge>
                                        </div>
                                        <p className="mt-2 text-sm leading-6 text-slate-400">{alert.message}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}
