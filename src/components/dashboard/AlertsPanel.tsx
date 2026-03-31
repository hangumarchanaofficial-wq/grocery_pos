'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AlertTriangle, Clock, TrendingDown, Package, Shield, Bell } from 'lucide-react';
import type { SmartAlert } from '@/types';

const ICON_MAP = { stockout: Package, expiry: Clock, low_selling: TrendingDown, reorder: AlertTriangle };
const STYLE_MAP = {
  critical: { border: 'border-red-400/20',   bg: 'bg-red-500/[0.06]',   icon: 'text-red-400',   iconBg: 'bg-red-500/10',   badge: 'bg-red-500/15 text-red-300'   },
  warning:  { border: 'border-amber-400/20', bg: 'bg-amber-500/[0.06]', icon: 'text-amber-400', iconBg: 'bg-amber-500/10', badge: 'bg-amber-500/15 text-amber-300' },
  info:     { border: 'border-sky-400/20',   bg: 'bg-sky-500/[0.06]',   icon: 'text-sky-400',   iconBg: 'bg-sky-500/10',   badge: 'bg-sky-500/15 text-sky-300'   },
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
        setAlerts(data.alerts ?? []);
      } catch { setAlerts([]); }
      finally { setLoading(false); }
    }
    load();
  }, [apiFetch]);

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/[0.07] bg-gradient-to-br from-[rgba(6,14,30,0.96)] to-[rgba(3,8,18,0.98)] p-6 shadow-[0_32px_80px_rgba(0,0,0,0.35)]">
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/25 to-transparent" />

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-amber-400/20 bg-amber-500/10">
            <Bell size={17} className="text-amber-400" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-slate-100">Smart Alerts</h3>
            <p className="text-[11px] text-slate-500">Risk, expiry, and movement anomalies</p>
          </div>
        </div>
        <div className={`rounded-[10px] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] ${
          alerts.length > 0 ? 'bg-amber-500/15 text-amber-300' : 'bg-emerald-500/12 text-emerald-400'
        }`}>
          {alerts.length} Active
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex min-h-[140px] items-center justify-center gap-3 text-slate-500 text-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-emerald-400" />
          Scanning for alerts...
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex items-center gap-5 rounded-[18px] border border-emerald-400/[0.12] bg-emerald-500/[0.05] px-6 py-8 min-h-[140px]">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px] bg-emerald-500/10">
            <Shield size={22} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-emerald-300">All clear — no active alerts</p>
            <p className="mt-0.5 text-[12px] text-slate-500">Stock levels, expiry dates, and sales velocity all look healthy.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 min-h-[140px]">
          {alerts.slice(0, 6).map(alert => {
            const Icon = ICON_MAP[alert.type as keyof typeof ICON_MAP] ?? AlertTriangle;
            const s = STYLE_MAP[alert.severity];
            return (
              <div key={alert.id} className={`rounded-[16px] border ${s.border} ${s.bg} p-4`}>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-[10px] ${s.iconBg}`}>
                    <Icon size={15} className={s.icon} />
                  </div>
                  <span className={`rounded-[8px] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] ${s.badge}`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-[13px] font-semibold leading-snug text-slate-100">{alert.title}</p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">{alert.message}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}