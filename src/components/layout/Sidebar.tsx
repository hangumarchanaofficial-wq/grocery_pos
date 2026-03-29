// ============================================================
// Desktop Sidebar Navigation
// ============================================================

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    BarChart3,
    Settings,
    Brain,
    LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Badge from '@/components/ui/Badge';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['OWNER', 'MANAGER', 'CASHIER'] },
    { href: '/dashboard/billing', label: 'New Bill', icon: ShoppingCart, roles: ['OWNER', 'MANAGER', 'CASHIER'] },
    { href: '/dashboard/inventory', label: 'Inventory', icon: Package, roles: ['OWNER', 'MANAGER'] },
    { href: '/dashboard/customers', label: 'Customers', icon: Users, roles: ['OWNER', 'MANAGER', 'CASHIER'] },
    { href: '/dashboard/reports', label: 'Reports', icon: BarChart3, roles: ['OWNER', 'MANAGER'] },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['OWNER'] },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <aside className="glass-panel-strong flex h-screen w-[288px] flex-col border-r border-white/8 lg:sticky lg:top-0">
            <div className="border-b border-white/8 p-6">
                <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500 text-slate-950 shadow-[0_18px_40px_rgba(34,197,94,0.28)]">
                        <ShoppingCart size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold tracking-[-0.04em] text-slate-50">GroceryPOS</h1>
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Retail Command</p>
                    </div>
                </div>
                <div className="rounded-[24px] border border-brand-400/10 bg-brand-500/8 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-300">Shift Status</p>
                    <p className="mt-2 text-sm font-medium text-slate-100">Store online. Register and stock monitoring active.</p>
                </div>
            </div>

            <nav className="flex-1 space-y-1 p-4">
                {navItems
                    .filter((item) => user && item.roles.includes(user.role))
                    .map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200',
                                    isActive
                                        ? 'bg-brand-500/14 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                                        : 'text-slate-400 hover:bg-white/6 hover:text-white'
                                )}
                            >
                                <span className={cn(
                                    'flex h-9 w-9 items-center justify-center rounded-xl border transition-colors',
                                    isActive
                                        ? 'border-brand-400/25 bg-brand-400/15 text-brand-300'
                                        : 'border-white/6 bg-white/[0.03] text-slate-500 group-hover:text-slate-200'
                                )}>
                                    <item.icon size={18} />
                                </span>
                                <span className="flex-1">{item.label}</span>
                                {isActive && <span className="h-2 w-2 rounded-full bg-brand-400" />}
                            </Link>
                        );
                    })}

                {user && ['OWNER', 'MANAGER'].includes(user.role) && (
                    <div className="mt-4 border-t border-white/8 pt-4">
                        <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Intelligence</p>
                        <Link
                            href="/dashboard?tab=ai"
                            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-violet-300 transition-colors hover:bg-violet-500/10"
                        >
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/12">
                                <Brain size={18} />
                            </span>
                            Smart Insights
                        </Link>
                    </div>
                )}
            </nav>

            <div className="border-t border-white/8 p-4">
                <div className="mb-3 flex items-center gap-3 rounded-[24px] border border-white/6 bg-white/[0.03] px-3 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8">
                        <span className="text-sm font-bold text-brand-300">
                            {user?.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-100">{user?.name}</p>
                        <div className="mt-1">
                            <Badge variant="success">{user?.role}</Badge>
                        </div>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-sm text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                >
                    <LogOut size={16} />
                    Logout
                </button>
            </div>
        </aside>
    );
}
