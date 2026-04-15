'use client';

import dynamic from 'next/dynamic';
import { useState, useRef, useCallback, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import MobileNav from '@/components/layout/MobileNav';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { DashboardAIProvider } from '@/contexts/DashboardAIContext';

const Footer = dynamic(() => import('@/components/layout/Footer'), { ssr: false });

const MOBILE_MENU_CLOSE_DELAY_MS = 2000;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigateCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPendingMenuClose = useCallback(() => {
    if (navigateCloseTimerRef.current) {
      clearTimeout(navigateCloseTimerRef.current);
      navigateCloseTimerRef.current = null;
    }
  }, []);

  const scheduleMobileMenuClose = useCallback(() => {
    clearPendingMenuClose();
    navigateCloseTimerRef.current = setTimeout(() => {
      setMobileMenuOpen(false);
      navigateCloseTimerRef.current = null;
    }, MOBILE_MENU_CLOSE_DELAY_MS);
  }, [clearPendingMenuClose]);

  const closeMobileMenuNow = useCallback(() => {
    clearPendingMenuClose();
    setMobileMenuOpen(false);
  }, [clearPendingMenuClose]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((open) => {
      if (open) clearPendingMenuClose();
      return !open;
    });
  }, [clearPendingMenuClose]);

  useEffect(() => () => clearPendingMenuClose(), [clearPendingMenuClose]);

  return (
    <ProtectedRoute>
      <DashboardAIProvider>
      <div className="flex min-h-screen bg-[#0a0a0f]">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeMobileMenuNow}
            />
            <div className="relative z-50 h-full w-[min(100%,280px)] max-w-[85vw]">
              <Sidebar onNavigate={scheduleMobileMenuClose} />
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col overflow-x-hidden">
          <TopBar menuOpen={mobileMenuOpen} onMenuToggle={toggleMobileMenu} />

          <main className="flex-1">
            <div className="min-h-full flex flex-col">
              <div className="flex-1 p-3 pb-28 sm:p-4 sm:pb-24 lg:p-8">
                {children}
              </div>

              <Footer />
            </div>
          </main>

          {!mobileMenuOpen && <MobileNav />}
        </div>
      </div>
      </DashboardAIProvider>
    </ProtectedRoute>
  );
}
