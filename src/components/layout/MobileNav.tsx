// ============================================================
// Mobile Bottom Navigation — Dark glass pill
// ============================================================

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Package, Users, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isNavItemActive } from '@/lib/navigation';

const items = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/dashboard/billing', label: 'Bill', icon: ShoppingCart },
  { href: '/dashboard/inventory', label: 'Stock', icon: Package },
  { href: '/dashboard/customers', label: 'People', icon: Users },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="safe-bottom fixed bottom-0 left-0 right-0 z-[100] px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 sm:px-4 lg:hidden"
      aria-label="Primary"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-between gap-1 rounded-2xl border border-white/[0.08] bg-[#0a0a12]/90 px-1 py-1 shadow-[0_-12px_48px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        {items.map((item) => {
          const isActive = isNavItemActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className={cn(
                'flex min-h-[54px] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[14px] px-1 py-1.5 text-[10px] font-semibold tracking-wide transition-all duration-200',
                isActive
                  ? 'bg-emerald-500/[0.12] text-emerald-400 ring-1 ring-emerald-400/25'
                  : 'text-slate-500 active:bg-white/[0.04] hover:text-slate-400'
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-[10px] transition-colors',
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-white/[0.03] text-slate-500'
                )}
              >
                <item.icon size={18} strokeWidth={isActive ? 2.25 : 1.65} className="shrink-0" aria-hidden />
              </span>
              <span className="max-w-[4.25rem] truncate text-center leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
