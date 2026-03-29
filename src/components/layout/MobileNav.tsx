// ============================================================
// Bottom Navigation for Mobile
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
    { href: '/dashboard/customers', label: 'Customers', icon: Users },
    { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
];

export default function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-50 px-3 py-3 lg:hidden">
            <div className="glass-panel mx-auto flex max-w-xl items-center justify-around rounded-[28px] px-2 py-1.5">
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex min-w-0 flex-col items-center rounded-2xl px-3 py-2 text-[11px] font-medium transition-colors',
                                isActive ? 'bg-brand-500/12 text-brand-300' : 'text-slate-500'
                            )}
                        >
                            <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                            <span className="mt-0.5 font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
