// ============================================================
// Sidebar — Premium dark navigation
// ============================================================

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, ShoppingCart, Package, Users,
  BarChart3, Settings, Brain, LogOut, ShoppingBag, ReceiptText,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Badge from '@/components/ui/Badge';
import { isNavItemActive } from '@/lib/navigation';

const navItems = [
  { href: '/dashboard',              label: 'Dashboard',      icon: LayoutDashboard, roles: ['OWNER', 'MANAGER', 'CASHIER'] },
  { href: '/dashboard/billing',      label: 'New Bill',       icon: ShoppingCart,    roles: ['OWNER', 'MANAGER', 'CASHIER'] },
  { href: '/dashboard/transactions', label: 'Transactions',   icon: ReceiptText,     roles: ['OWNER'] },
  { href: '/dashboard/inventory',    label: 'Inventory',      icon: Package,         roles: ['OWNER', 'MANAGER'] },
  { href: '/dashboard/products',     label: 'Products',       icon: ShoppingBag,     roles: ['OWNER', 'MANAGER'] },
  { href: '/dashboard/customers',    label: 'Customers',      icon: Users,           roles: ['OWNER', 'MANAGER', 'CASHIER'] },
  { href: '/dashboard/reports',      label: 'Reports',        icon: BarChart3,       roles: ['OWNER', 'MANAGER'] },
  { href: '/dashboard/intelligence', label: 'Smart Insights', icon: Brain,           roles: ['OWNER', 'MANAGER'] },
  { href: '/dashboard/settings',     label: 'Settings',       icon: Settings,        roles: ['OWNER'] },
];

export interface SidebarProps {
  /** Called after choosing a link (e.g. close mobile overlay). */
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <aside className="glass-strong flex h-screen w-[260px] flex-col border-r border-white/[0.05] lg:sticky lg:top-0">
      {/* ── Brand ── */}
      <div className="border-b border-white/[0.05] px-4 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Workspace</p>
        <h1 className="mt-1 text-[15px] font-semibold tracking-tight text-slate-50">GroceryPOS</h1>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden px-2.5 py-3">
        {navItems
          .filter((item) => user && item.roles.includes(user.role))
          .map((item) => {
            const isActive = isNavItemActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={item.href === '/dashboard/billing'}
                onClick={() => onNavigate?.()}
                className={cn(
                  'group relative flex h-11 shrink-0 items-center gap-3 rounded-xl pl-2.5 pr-3 text-[13px] font-medium transition-colors duration-200',
                  isActive
                    ? 'bg-white/[0.05] text-white'
                    : 'text-slate-500 hover:bg-white/[0.03] hover:text-slate-200'
                )}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.35)]"
                    aria-hidden
                  />
                )}
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                    isActive
                      ? 'bg-emerald-500/[0.12] text-emerald-400 ring-1 ring-emerald-400/20'
                      : 'bg-white/[0.03] text-slate-500 ring-1 ring-transparent group-hover:text-slate-400 group-hover:ring-white/[0.06]'
                  )}
                >
                  <item.icon size={16} strokeWidth={isActive ? 2.25 : 1.75} className="shrink-0" />
                </span>
                <span className="min-w-0 flex-1 truncate leading-none">{item.label}</span>
              </Link>
            );
          })}
      </nav>

      {/* ── User ── */}
      <div className="border-t border-white/[0.05] p-2.5">
        <div className="mb-2 hidden items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 lg:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 ring-1 ring-emerald-400/15">
            <span className="text-xs font-bold text-emerald-300">
              {user?.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-200">{user?.name}</p>
            <Badge variant="success" className="mt-1">{user?.role}</Badge>
          </div>
        </div>
        <div className="mb-2 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 lg:hidden">
          <p className="truncate text-sm font-medium text-slate-200">{user?.name}</p>
          <Badge variant="success" className="shrink-0">{user?.role}</Badge>
        </div>
        <button
          type="button"
          onClick={async () => {
            await logout();
            onNavigate?.();
            router.replace('/');
            router.refresh();
          }}
          className="flex w-full items-center gap-2 rounded-[14px] px-3 py-2.5 text-sm text-slate-500 transition-colors hover:bg-red-500/[0.06] hover:text-red-300"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  );
}

