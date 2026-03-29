// ============================================================
// Mobile Bottom Navigation — Dark glass pill
// ============================================================

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Package, Users, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 lg:hidden">
      <div className="glass mx-auto flex max-w-md items-center justify-around rounded-[20px] px-1 py-1.5">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-w-0 flex-col items-center rounded-[14px] px-3 py-2 text-[10px] font-semibold transition-all',
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-slate-600 active:bg-white/[0.04]'
              )}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.2 : 1.5} />
              <span className="mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
