// ============================================================
// Sidebar — Premium dark navigation
// ============================================================

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, ShoppingCart, Package, Users,
  BarChart3, Settings, Brain, LogOut, ShoppingBag,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Badge from '@/components/ui/Badge';

const navItems = [
  { href: '/dashboard',           label: 'Dashboard', icon: LayoutDashboard, roles: ['OWNER', 'MANAGER', 'CASHIER'] },
  { href: '/dashboard/billing',   label: 'New Bill',  icon: ShoppingCart,    roles: ['OWNER', 'MANAGER', 'CASHIER'] },
  { href: '/dashboard/inventory', label: 'Inventory', icon: Package,         roles: ['OWNER', 'MANAGER'] },
  { href: '/dashboard/products',  label: 'Products',  icon: ShoppingBag,     roles: ['OWNER', 'MANAGER'] },
  { href: '/dashboard/customers', label: 'Customers', icon: Users,           roles: ['OWNER', 'MANAGER', 'CASHIER'] },
  { href: '/dashboard/reports',   label: 'Reports',   icon: BarChart3,       roles: ['OWNER', 'MANAGER'] },
  { href: '/dashboard/settings',  label: 'Settings',  icon: Settings,        roles: ['OWNER'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="glass-strong flex h-screen w-[272px] flex-col border-r border-white/[0.04] lg:sticky lg:top-0">
      {/* ── Brand ── */}
      <div className="border-b border-white/[0.04] px-5 py-5">
        <h1 className="text-[15px] font-semibold tracking-tight text-slate-50">GroceryPOS</h1>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems
          .filter((item) => user && item.roles.includes(user.role))
          .map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-white/[0.06] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
                    : 'text-slate-500 hover:bg-white/[0.03] hover:text-slate-200'
                )}
              >
                <span className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-[10px] transition-colors',
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-400/15'
                    : 'bg-white/[0.02] text-slate-600 group-hover:text-slate-300'
                )}>
                  <item.icon size={16} />
                </span>
                <span className="flex-1">{item.label}</span>
                {isActive && <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
              </Link>
            );
          })}

        {/* AI section */}
        {user && ['OWNER', 'MANAGER'].includes(user.role) && (
          <div className="mt-4 border-t border-white/[0.04] pt-4">
            <p className="mb-2 px-3 label-caps text-slate-700">Intelligence</p>
            <Link
              href="/dashboard?tab=ai"
              className="flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-medium text-violet-400 transition-colors hover:bg-violet-500/[0.06]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-violet-500/10 ring-1 ring-violet-400/15">
                <Brain size={16} />
              </span>
              Smart Insights
            </Link>
          </div>
        )}
      </nav>

      {/* ── User ── */}
      <div className="border-t border-white/[0.04] p-3">
        <div className="mb-2 flex items-center gap-3 rounded-[14px] border border-white/[0.04] bg-white/[0.015] p-3">
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
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-[14px] px-3 py-2.5 text-sm text-slate-500 transition-colors hover:bg-red-500/[0.06] hover:text-red-300"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  );
}
