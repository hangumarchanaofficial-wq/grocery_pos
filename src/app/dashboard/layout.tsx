// ============================================================
// Dashboard Layout - Sidebar + Content + Mobile Nav
// ============================================================

'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import MobileNav from '@/components/layout/MobileNav';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <ProtectedRoute>
            <div className="app-shell flex min-h-screen">
                <div className="hidden lg:block">
                    <Sidebar />
                </div>

                {mobileMenuOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-50 bg-slate-950/70 lg:hidden"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <div className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden">
                            <Sidebar />
                        </div>
                    </>
                )}

                <main className="flex min-h-screen flex-1 flex-col">
                    <TopBar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
                    <div className="flex-1 px-4 pb-24 pt-5 lg:px-6 lg:pb-8 lg:pt-6">
                        {children}
                    </div>
                </main>

                <MobileNav />
            </div>
        </ProtectedRoute>
    );
}
