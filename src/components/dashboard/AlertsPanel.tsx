'use client';

import { AlertTriangle, Clock, TrendingDown, Package, Shield, Bell } from 'lucide-react';
import type { SmartAlert } from '@/types';

const ICON_MAP = { stockout: Package, expiry: Clock, low_selling: TrendingDown, reorder: AlertTriangle };
const STYLE_MAP = {
  critical: {
    border: 'border-red-400/15',
    bg: 'bg-gradient-to-br from-red-500/[0.08] to-red-500/[0.02]',
    icon: 'text-red-400',
    iconBg: 'bg-red-500/10 ring-1 ring-red-400/20',
    badge: 'bg-red-500/15 text-red-300 ring-1 ring-red-400/20',
  },
  warning: {
    border: 'border-amber-400/15',
    bg: 'bg-gradient-to-br from-amber-500/[0.08] to-amber-500/[0.02]',
    icon: 'text-amber-400',
    iconBg: 'bg-amber-500/10 ring-1 ring-amber-400/20',
    badge: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/20',
  },
  info: {
    border: 'border-sky-400/15',
    bg: 'bg-gradient-to-br from-sky-500/[0.08] to-sky-500/[0.02]',
    icon: 'text-sky-400',
    iconBg: 'bg-sky-500/10 ring-1 ring-sky-400/20',
    badge: 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/20',
  },
};

type Props = { alerts: SmartAlert[]; loading: boolean };

export default function AlertsPanel({ alerts, loading }: Props) {
  return (
    <div className="premium-card animate-fade-up rounded-[20px] sm:rounded-[24px] p-4 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/25 to-transparent" />

      {/* Header */}
      <div className="relative mb-4 sm:mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-[12px] sm:rounded-[14px] border border-amber-400/20 bg-amber-500/10 shadow-[0_8px_24px_rgba(245,158,11,0.12)]">
            <Bell size={15} className="text-amber-400 sm:[&]:w-[17px] sm:[&]:h-[17px]" />
          </div>
          <div>
            <h3 className="text-[13px] sm:text-[15px] font-semibold tracking-[-0.02em] text-slate-100">Smart Alerts</h3>
            <p className="text-[10px] sm:text-[11px] text-slate-500">Risk, expiry & anomalies</p>
          </div>
        </div>
        <div className={`rounded-full px-3 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.12em] ${
          alerts.length > 0 ? 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/20' : 'bg-emerald-500/12 text-emerald-400 ring-1 ring-emerald-400/20'
        }`}>
          {alerts.length} Active
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="relative flex min-h-[120px] sm:min-h-[140px] items-center justify-center gap-3 text-slate-500 text-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-amber-400" />
          <span className="text-[12px]">Scanning for alerts...</span>
        </div>
      ) : alerts.length === 0 ? (
        <div className="relative flex items-center gap-4 sm:gap-5 rounded-[16px] sm:rounded-[18px] border border-emerald-400/[0.12] bg-gradient-to-br from-emerald-500/[0.06] to-emerald-500/[0.02] p-4 sm:px-6 sm:py-6">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-500/[0.08] blur-[30px]" />
          <div className="relative flex h-11 w-11 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-[14px] bg-emerald-500/10 ring-1 ring-emerald-400/20 shadow-[0_8px_24px_rgba(34,197,94,0.15)]">
            <Shield size={20} className="text-emerald-400 sm:[&]:w-[22px] sm:[&]:h-[22px]" />
          </div>
          <div className="relative">
            <p className="text-[13px] sm:text-[14px] font-semibold text-emerald-300">All clear — no active alerts</p>
            <p className="mt-0.5 text-[11px] sm:text-[12px] leading-relaxed text-slate-500">Stock levels, expiry dates, and sales velocity all look healthy.</p>
          </div>
        </div>
      ) : (
        <div className="stagger-children relative grid grid-cols-1 gap-2.5 sm:gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {alerts.slice(0, 6).map(alert => {
            const Icon = ICON_MAP[alert.type as keyof typeof ICON_MAP] ?? AlertTriangle;
            const s = STYLE_MAP[alert.severity];
            return (
              <div key={alert.id} className={`group rounded-[14px] sm:rounded-[16px] border ${s.border} ${s.bg} p-3.5 sm:p-4 transition-all duration-300 hover:scale-[1.01]`}>
                <div className="mb-2.5 sm:mb-3 flex items-center justify-between gap-2">
                  <div className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-[8px] sm:rounded-[10px] ${s.iconBg}`}>
                    <Icon size={13} className={`${s.icon} sm:[&]:w-[15px] sm:[&]:h-[15px]`} />
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.12em] ${s.badge}`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-[12px] sm:text-[13px] font-semibold leading-snug text-slate-100">{alert.title}</p>
                <p className="mt-1 sm:mt-1.5 text-[10px] sm:text-[11px] leading-relaxed text-slate-400">{alert.message}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
