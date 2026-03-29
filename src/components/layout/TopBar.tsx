// ============================================================
// Top Bar for mobile + notifications
// ============================================================

'use client';

import { useState, useEffect } from 'react';
import { Menu, Bell, ShoppingCart, Command } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Badge from '@/components/ui/Badge';
import ThemeToggle from '@/components/layout/ThemeToggle';

interface TopBarProps {
    onMenuToggle: () => void;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
    const { user, apiFetch } = useAuth();
    const [alertCount, setAlertCount] = useState(0);

    useEffect(() => {
        async function fetchAlerts() {
            try {
                const res = await apiFetch('/api/ai/alerts');
                const data = await res.json();
                setAlertCount(data.summary?.critical + data.summary?.warning || 0);
            } catch {
                // Ignore notification fetch failures in the shell.
            }
        }
        fetchAlerts();
    }, [apiFetch]);

    return (
        <header className="sticky top-0 z-40 mb-5">
            <div className="glass-panel mx-auto flex items-center justify-between rounded-[28px] px-4 py-3 lg:px-5">
                <button
                    onClick={onMenuToggle}
                    className="rounded-2xl p-2 text-slate-300 transition-colors hover:bg-white/8 lg:hidden"
                >
                    <Menu size={22} />
                </button>

                <div className="flex items-center gap-3 lg:hidden">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-500 text-slate-950">
                        <ShoppingCart size={16} />
                    </div>
                    <span className="font-semibold tracking-[-0.04em] text-slate-100">GroceryPOS</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-slate-400 md:flex">
                        <Command size={15} />
                        <span>Shift overview</span>
                    </div>
                    <ThemeToggle />
                    <button className="relative rounded-2xl p-2 text-slate-400 transition-colors hover:bg-white/8 hover:text-white">
                        <Bell size={20} />
                        {alertCount > 0 && (
                            <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                {alertCount > 9 ? '9+' : alertCount}
                            </span>
                        )}
                    </button>

                    <div className="hidden items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2 lg:flex">
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/8">
                            <span className="text-sm font-bold text-brand-300">
                                {user?.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-100">{user?.name}</p>
                            <Badge variant="success">{user?.role}</Badge>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
