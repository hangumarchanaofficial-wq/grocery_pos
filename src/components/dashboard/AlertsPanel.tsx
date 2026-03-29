// ============================================================
// Alerts Panel — Dark premium alert cards
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { AlertTriangle, Clock, TrendingDown, Package, Shield } from 'lucide-react';
import type { SmartAlert } from '@/types';

const icons = {
  stockout: Package,
  expiry: Clock,
  low_selling: TrendingDown,
  reorder: AlertTriangle,
};

const severityMap = {
  critical: { badge: 'danger' as const, accent: 'text-red-400', ring: 'ring-red-400/15', bg: 'bg-red-500/8' },
  warning:  { badge: 'warning' as const, accent: 'text-amber-400', ring: 'ring-amber-400/15', bg: 'bg-amber-500/8' },
  info:     { badge: 'info' as const, accent: 'text-sky-400', ring: 'ring-sky-400/15', bg: 'bg-sky-500/8' },
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
      } catch { setAlerts([]); }
      finally { setLoading(false); }
    }
    load();
  }, [apiFetch]);

  return (
    <Card variant="strong" className="flex h-full flex-col">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="heading-lg text-xl font-semibold">Smart Alerts</h3>
          <p className="body-muted mt-1 text-sm">Risk, expiry, and movement anomalies.</p>
        </div>
        <Badge variant={alerts.length > 0 ? 'warning' : 'success'}>
          {alerts.length} active
        </Badge>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center text-slate-500">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-emerald-400" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-[20px] border border-dashed border-white/[0.06] bg-white/[0.01] text-center">
          <Shield size={32} className="mb-3 text-emerald-500/40" />
          <p className="text-sm font-medium text-slate-400">All clear</p>
          <p className="mt-1 text-xs text-slate-600">No active alerts at this time.</p>
        </div>
      ) : (
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {alerts.slice(0, 8).map((alert) => {
            const Icon = icons[alert.type] || AlertTriangle;
            const style = severityMap[alert.severity];
            return (
              <div key={alert.id} className="inner-panel p-4">
                <div className="flex gap-3">
                  <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${style.bg} ring-1 ${style.ring}`}>
                    <Icon size={16} className={style.accent} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-100">{alert.title}</p>
                      <Badge variant={style.badge}>{alert.severity}</Badge>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{alert.message}</p>
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
