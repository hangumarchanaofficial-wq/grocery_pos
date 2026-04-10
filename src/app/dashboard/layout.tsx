'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import MobileNav from '@/components/layout/MobileNav';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Footer from '@/components/layout/Footer';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-[#0a0a0f]">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-50 h-full w-72">
              <Sidebar />
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

          <main className="flex-1 overflow-y-auto">
            <div className="min-h-full flex flex-col">
              <div className="flex-1 p-4 pb-24 sm:p-6 lg:p-8">
                {children}
              </div>

              <Footer />
            </div>
          </main>

          <MobileNav />
        </div>
      </div>
    </ProtectedRoute>
  );
}
