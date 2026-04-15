// ============================================================
// Top Bar — Dark-only, no theme toggle
// ============================================================

'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Menu, Bell, ShoppingCart, AlertTriangle, Clock, TrendingDown, Package } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { TOPBAR_ALERTS_MAX, useDashboardAI } from '@/contexts/DashboardAIContext';
import { cn } from '@/lib/utils';
import type { SmartAlert } from '@/types';

const ALERT_ICONS: Record<string, typeof Package> = {
  stockout: Package,
  expiry: Clock,
  low_selling: TrendingDown,
  reorder: AlertTriangle,
};

const ALERT_ROW_STYLES: Record<
  SmartAlert['severity'],
  { border: string; bg: string; iconWrap: string; icon: string; badge: string }
> = {
  critical: {
    border: 'border-red-400/20',
    bg: 'bg-red-500/[0.06]',
    iconWrap: 'bg-red-500/10 ring-1 ring-red-400/25',
    icon: 'text-red-400',
    badge: 'bg-red-500/15 text-red-300 ring-1 ring-red-400/25',
  },
  warning: {
    border: 'border-amber-400/20',
    bg: 'bg-amber-500/[0.06]',
    iconWrap: 'bg-amber-500/10 ring-1 ring-amber-400/25',
    icon: 'text-amber-400',
    badge: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/25',
  },
  info: {
    border: 'border-sky-400/20',
    bg: 'bg-sky-500/[0.06]',
    iconWrap: 'bg-sky-500/10 ring-1 ring-sky-400/25',
    icon: 'text-sky-400',
    badge: 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/25',
  },
};

interface TopBarProps {
  onMenuToggle: () => void;
  /** When true, header is hidden on small screens (e.g. mobile drawer open). */
  menuOpen?: boolean;
}

export default function TopBar({ onMenuToggle, menuOpen = false }: TopBarProps) {
  const { user } = useAuth();
  const { urgentAlertCount, urgentAlerts, loading } = useDashboardAI();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const badgeLabel =
    urgentAlertCount > 9 ? '9+' : urgentAlertCount > 0 ? String(urgentAlertCount) : '';

  return (
    <header
      className={cn(
        'sticky top-0 z-40 px-3 pt-3 lg:px-4 lg:pt-4',
        menuOpen && 'hidden lg:block'
      )}
    >
      <div className="glass mx-auto flex items-center justify-between rounded-[20px] px-4 py-2.5 lg:px-5">
        {/* Mobile menu */}
        <button
          type="button"
          onClick={onMenuToggle}
          className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white lg:hidden"
        >
          <Menu size={22} />
        </button>

        {/* Mobile logo */}
        <div className="flex items-center gap-2.5 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-slate-950">
            <ShoppingCart size={14} />
          </div>
          <span className="text-sm font-semibold tracking-tight text-slate-100">GroceryPOS</span>
        </div>

        {/* Left — Desktop status */}
        <div className="hidden items-center gap-3 lg:flex">
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
            <span className="text-xs font-medium text-slate-400">System Online</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Notifications — real AI alerts (critical + warning), list max 5 */}
          <div className="relative" ref={wrapRef}>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-haspopup="dialog"
              aria-label={
                urgentAlertCount > 0
                  ? `Notifications, ${urgentAlertCount} urgent`
                  : 'Notifications'
              }
              className="relative rounded-xl p-2 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <Bell size={18} />
              {urgentAlertCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white ring-2 ring-[var(--bg)]">
                  {badgeLabel}
                </span>
              )}
            </button>

            {open && (
              <div
                role="dialog"
                aria-label="Urgent alerts"
                className="absolute right-0 top-full z-50 mt-2 w-[min(calc(100vw-1.5rem),20rem)] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0f1419] shadow-[0_24px_48px_rgba(0,0,0,0.45)]"
              >
                <div className="border-b border-white/[0.06] px-4 py-3">
                  <p className="text-xs font-semibold text-slate-100">Alerts</p>
                  <p className="text-[10px] text-slate-500">
                    {loading
                      ? 'Loading…'
                      : urgentAlertCount === 0
                        ? 'No critical or warning items'
                        : urgentAlertCount > TOPBAR_ALERTS_MAX
                      ? `${urgentAlertCount} urgent · first ${TOPBAR_ALERTS_MAX} below`
                      : `${urgentAlertCount} urgent`}
                  </p>
                </div>

                <div className="max-h-[min(60vh,22rem)] overflow-y-auto p-2">
                  {loading && (
                    <div className="flex items-center justify-center gap-2 py-8 text-xs text-slate-500">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-amber-400" />
                      Loading alerts…
                    </div>
                  )}
                  {!loading && urgentAlertCount === 0 && (
                    <p className="px-2 py-6 text-center text-xs text-slate-500">
                      You&apos;re all caught up. Stock and expiry look fine.
                    </p>
                  )}
                  {!loading &&
                    urgentAlertCount > 0 &&
                    urgentAlerts.map((alert) => {
                      const st = ALERT_ROW_STYLES[alert.severity];
                      const Icon = ALERT_ICONS[alert.type] ?? AlertTriangle;
                      return (
                        <div
                          key={alert.id}
                          className={cn(
                            'mb-1.5 rounded-xl border p-3 last:mb-0',
                            st.border,
                            st.bg
                          )}
                        >
                          <div className="flex gap-2.5">
                            <div
                              className={cn(
                                'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
                                st.iconWrap
                              )}
                            >
                              <Icon className={cn('h-3.5 w-3.5', st.icon)} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-[12px] font-semibold leading-snug text-slate-100">
                                  {alert.title}
                                </p>
                                <span
                                  className={cn(
                                    'flex-shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider',
                                    st.badge
                                  )}
                                >
                                  {alert.severity}
                                </span>
                              </div>
                              <p className="mt-1 text-[10px] leading-relaxed text-slate-400">
                                {alert.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {urgentAlertCount > TOPBAR_ALERTS_MAX && (
                  <div className="border-t border-white/[0.06] px-3 py-2.5">
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="block text-center text-[11px] font-medium text-emerald-400 hover:text-emerald-300"
                    >
                      View all {urgentAlertCount} on dashboard
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User pill — desktop */}
          <div className="hidden items-center gap-2.5 rounded-[16px] border border-white/[0.06] bg-white/[0.02] py-1.5 pl-2 pr-3.5 lg:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 ring-1 ring-emerald-400/20">
              <span className="text-xs font-bold text-emerald-300">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-200">{user?.name}</p>
              <p className="text-[10px] text-slate-500">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
