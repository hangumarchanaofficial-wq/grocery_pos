// ============================================================
// Top Bar — Dark-only, no theme toggle
// ============================================================

'use client';

import { Menu, Bell, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardAI } from '@/contexts/DashboardAIContext';
import { cn } from '@/lib/utils';

interface TopBarProps {
  onMenuToggle: () => void;
  /** When true, header is hidden on small screens (e.g. mobile drawer open). */
  menuOpen?: boolean;
}

export default function TopBar({ onMenuToggle, menuOpen = false }: TopBarProps) {
  const { user } = useAuth();
  const { urgentAlertCount } = useDashboardAI();

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
          {/* Notification */}
          <button className="relative rounded-xl p-2 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white">
            <Bell size={18} />
            {urgentAlertCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-[var(--bg)]">
                {urgentAlertCount > 9 ? '9+' : urgentAlertCount}
              </span>
            )}
          </button>

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
