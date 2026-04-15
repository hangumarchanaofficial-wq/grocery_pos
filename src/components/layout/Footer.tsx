'use client';

import { Heart, ShieldCheck, Cpu } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-auto border-t border-white/[0.06] bg-[#0a0a0f] hidden sm:block">
      {/* Subtle glow line at top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-2 gap-8 py-10 lg:grid-cols-4">

          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 ring-1 ring-emerald-500/30">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="text-base font-semibold text-slate-100 tracking-tight">
                GroceryPOS
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-slate-500 max-w-xs">
              AI-powered point-of-sale system built for modern grocery stores.
              Smart billing, real-time inventory, and predictive analytics.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              System
            </h4>
            <ul className="space-y-2">
              {[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'New Bill', href: '/dashboard/billing' },
                { label: 'Inventory', href: '/dashboard/inventory' },
                { label: 'Reports', href: '/dashboard/reports' },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-[13px] text-slate-500 transition-colors hover:text-emerald-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Management */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Management
            </h4>
            <ul className="space-y-2">
              {[
                { label: 'Customers', href: '/dashboard/customers' },
                { label: 'Smart Insights', href: '/dashboard/intelligence' },
                { label: 'Settings', href: '/dashboard/settings' },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-[13px] text-slate-500 transition-colors hover:text-emerald-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Status */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Status
            </h4>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[13px] text-slate-400">All systems operational</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-[13px] text-slate-500">AI Engine v2.0 active</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-[13px] text-slate-500">SSL Encrypted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 py-5 sm:flex-row">
          <p className="text-[12px] text-slate-600">
            &copy; {currentYear} GroceryPOS. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-[12px] text-slate-600">
            Crafted with
            <Heart className="h-3 w-3 text-rose-500/70" fill="currentColor" />
            by
            <span className="font-medium text-slate-500">HangWorks</span>
          </p>
          <p className="text-[12px] text-slate-600">
            v2.0.0 &middot; Next.js 16.2 &middot; Prisma 7
          </p>
        </div>
      </div>

      {/* Bottom glow */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-emerald-500/[0.02] to-transparent pointer-events-none" />
    </footer>
  );
}
