'use client';

import { useRef, useState } from 'react';
import ProductSearch from '@/components/billing/ProductSearch';
import CustomerSearch from '@/components/billing/CustomerSearch';
import Cart from '@/components/billing/Cart';
import PaymentModal from '@/components/billing/PaymentModal';
import Receipt from '@/components/billing/Receipt';
import type { ReceiptBill } from '@/components/billing/Receipt';
import { useCart } from '@/hooks/useCart';
import { useCartStore } from '@/store/cartStore';
import { useSettingsStore } from '@/store/settingsStore';
import { calculateBillTotals } from '@/lib/billing';
import { t } from '@/lib/i18n';
import {
  CreditCard,
  Package,
  Printer,
  Receipt as ReceiptIcon,
  ScanLine,
  Search,
  ShoppingBag,
  Users,
  WalletCards,
  Zap,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';

export default function BillingPage() {
  const { submitBill } = useCart();
  const { items } = useCartStore();
  const { settings } = useSettingsStore();
  const lang = settings.language;
  const tr = (key: Parameters<typeof t>[1]) => t(lang, key);

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [lastBill, setLastBill] = useState<ReceiptBill | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePayment = async (method: string, paidAmount: number, discount: number) => {
    try {
      const bill = await submitBill(method, paidAmount, discount);
      setLastBill(bill);
      toast.success(`Bill ${bill.billNumber} created!`);
      setTimeout(() => { window.print(); }, 400);
    } catch (error: unknown) {
      toast.error((error as Error).message);
      throw error;
    }
  };

  const handlePrint = () => { if (lastBill) window.print(); };

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartTotals = calculateBillTotals({ subtotal, taxRatePercent: settings.taxRate });

  return (
    <div className="space-y-3 sm:space-y-4">

      {/* ── HERO BANNER ── */}
      <div className="premium-card animate-fade-up rounded-[18px] sm:rounded-[24px] p-4 sm:p-7">
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/[0.06] blur-[80px]" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-sky-500/[0.04] blur-[60px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

        <div className="relative flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 sm:mb-3 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-400">Register Workspace</span>
            </div>
            <h1 className="text-[clamp(1.3rem,3.5vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.04em] text-white">
              Fast billing,<br />
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">barcode-first.</span>
            </h1>
          </div>

          {/* Feature tiles */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:w-[420px]">
            {[
              { icon: ScanLine, color: 'emerald', label: 'Scanner', sub: 'Barcode + manual' },
              { icon: WalletCards, color: 'sky', label: 'Payments', sub: 'Cash, card, QR' },
              { icon: Zap, color: 'violet', label: 'Express', sub: 'One-click checkout' },
            ].map((tile) => (
              <div key={tile.label} className={`rounded-[12px] sm:rounded-[16px] border border-${tile.color}-400/20 bg-${tile.color}-500/10 p-2.5 sm:p-4 transition-all duration-300 hover:bg-${tile.color}-500/[0.15]`}>
                <div className={`mb-1.5 sm:mb-3 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-[8px] sm:rounded-[10px] bg-${tile.color}-500/10`}>
                  <tile.icon size={13} className={`text-${tile.color}-400 sm:[&]:w-[15px] sm:[&]:h-[15px]`} />
                </div>
                <p className="text-[10px] sm:text-[11px] font-semibold text-slate-200">{tile.label}</p>
                <p className="mt-0.5 text-[9px] sm:text-[10px] leading-relaxed text-slate-600 hidden sm:block">{tile.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN POS AREA — stacks on mobile, side-by-side on desktop ── */}
      <div className="mb-8 grid grid-cols-1 gap-3 sm:gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)] xl:items-start xl:gap-6">

        {/* LEFT COLUMN — Search + Customer */}
        <div className="space-y-3 sm:space-y-4">

          {/* Product Search */}
          <div className="premium-card !overflow-visible animate-fade-up rounded-[16px] sm:rounded-[24px] p-3.5 sm:p-6" style={{ animationDelay: '0.05s' }}>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/25 to-transparent" />
            <div className="relative mb-3 sm:mb-5 flex items-center gap-2.5 sm:gap-3">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-[10px] sm:rounded-[14px] border border-sky-400/20 bg-sky-500/10 shadow-[0_6px_20px_rgba(56,189,248,0.1)]">
                <Search size={14} className="text-sky-400 sm:[&]:w-[17px] sm:[&]:h-[17px]" />
              </div>
              <div>
                <h2 className="text-[13px] sm:text-[15px] font-semibold tracking-[-0.02em] text-slate-100">Product Lookup</h2>
                <p className="text-[9px] sm:text-[11px] text-slate-500">Search or scan barcode</p>
              </div>
            </div>
            <div className="relative">
              <ProductSearch />
            </div>
          </div>

          {/* Customer Attach */}
          <div className="premium-card !overflow-visible animate-fade-up rounded-[16px] sm:rounded-[24px] p-3.5 sm:p-6" style={{ animationDelay: '0.1s' }}>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/25 to-transparent" />
            <div className="relative mb-3 sm:mb-5 flex items-center gap-2.5 sm:gap-3">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-[10px] sm:rounded-[14px] border border-sky-400/20 bg-sky-500/10 shadow-[0_6px_20px_rgba(56,189,248,0.1)]">
                <Users size={14} className="text-sky-400 sm:[&]:w-[17px] sm:[&]:h-[17px]" />
              </div>
              <div>
                <h2 className="text-[13px] sm:text-[15px] font-semibold tracking-[-0.02em] text-slate-100">{tr('customer')}</h2>
                <p className="text-[9px] sm:text-[11px] text-slate-500">Search or attach by phone</p>
              </div>
            </div>
            <CustomerSearch />
          </div>

          {/* Last Receipt — only shows after a bill */}
          {lastBill && (
            <div className="premium-card animate-fade-up rounded-[16px] sm:rounded-[24px] p-3.5 sm:p-6">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
              <div className="relative mb-3 sm:mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-[10px] sm:rounded-[14px] border border-amber-400/20 bg-amber-500/10">
                    <ReceiptIcon size={14} className="text-amber-400 sm:[&]:w-[17px] sm:[&]:h-[17px]" />
                  </div>
                  <div>
                    <h2 className="text-[13px] sm:text-[15px] font-semibold tracking-[-0.02em] text-slate-100">Last Receipt</h2>
                    <p className="text-[9px] sm:text-[11px] text-slate-500">Preview before printing</p>
                  </div>
                </div>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 rounded-[10px] sm:rounded-[12px] border border-white/[0.08] bg-white/[0.04] px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-[12px] font-semibold text-slate-300 transition-all hover:bg-white/[0.08] hover:text-white active:scale-[0.97]"
                >
                  <Printer size={12} /> Print
                </button>
              </div>
              <div className="relative max-h-[400px] sm:max-h-[520px] overflow-y-auto rounded-[14px] sm:rounded-[18px] border border-white/[0.05] bg-white p-1.5 sm:p-2">
                <Receipt ref={receiptRef} bill={lastBill} />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN — Cart + Payment */}
        <div
          className="premium-card animate-fade-up isolate flex min-w-0 w-full flex-col overflow-hidden rounded-[16px] sm:rounded-[24px] hover:!translate-y-0 xl:sticky xl:top-6 xl:max-h-[calc(100dvh-3rem)] xl:overflow-y-auto"
          style={{ animationDelay: '0.15s' }}
        >
          {/* Top accent — same absolute pattern as Product Lookup / Customer so rows align */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/35 to-transparent" aria-hidden />

          {/* Cart Header */}
          <div className="relative flex items-center justify-between border-b border-white/[0.05] px-3.5 sm:px-6 py-3.5 sm:py-5">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-[10px] sm:rounded-[14px] border border-emerald-400/20 bg-emerald-500/10 shadow-[0_6px_20px_rgba(34,197,94,0.1)]">
                <ShoppingBag size={14} className="text-emerald-400 sm:[&]:w-[17px] sm:[&]:h-[17px]" />
              </div>
              <div>
                <h2 className="text-[13px] sm:text-[15px] font-semibold tracking-[-0.02em] text-slate-100">Current Cart</h2>
                <p className="text-[9px] sm:text-[11px] text-slate-500">{items.length} line items</p>
              </div>
            </div>
            {items.length > 0 && (
              <div className="rounded-full bg-emerald-500/15 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-bold text-emerald-400 ring-1 ring-emerald-400/20">
                {formatCurrency(subtotal)}
              </div>
            )}
          </div>

          {/* Cart Body */}
          <div className="relative min-h-0 flex-1 px-3.5 sm:px-6 py-3">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2.5 py-8 text-center sm:gap-3 sm:py-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] sm:h-14 sm:w-14">
                  <Package size={22} className="text-slate-600 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-slate-400 sm:text-[14px]">Cart is empty</p>
                  <p className="mt-0.5 text-[11px] text-slate-600 sm:text-[12px]">Search or scan products to begin</p>
                </div>
              </div>
            ) : (
              <Cart />
            )}
          </div>

          {/* Cart Footer — Totals + Pay Button */}
          {items.length > 0 && (
            <div className="relative border-t border-white/[0.05] p-3.5 sm:p-5">
              <div className="mb-3 sm:mb-4 space-y-1.5 sm:space-y-2 rounded-[12px] sm:rounded-[16px] border border-white/[0.05] bg-white/[0.02] p-3 sm:p-4">
                <div className="flex items-center justify-between text-[11px] sm:text-[12px]">
                  <span className="text-slate-500">{tr('subtotal')}</span>
                  <span className="font-medium text-slate-300">{formatCurrency(subtotal)}</span>
                </div>
                {settings.taxRate > 0 && (
                  <div className="flex items-center justify-between text-[11px] sm:text-[12px]">
                    <span className="text-slate-500">{tr('tax')} ({settings.taxRate}%)</span>
                    <span className="font-medium text-slate-300">{formatCurrency(cartTotals.tax)}</span>
                  </div>
                )}
                <div className="my-1.5 sm:my-2 border-t border-white/[0.06]" />
                <div className="flex items-center justify-between">
                  <span className="text-[12px] sm:text-[13px] font-semibold text-slate-200">Total</span>
                  <span className="text-[14px] sm:text-[15px] font-bold text-emerald-400">{formatCurrency(cartTotals.total)}</span>
                </div>
              </div>
              <button
                onClick={() => setPaymentOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-[12px] sm:rounded-[16px] bg-emerald-500 py-3 sm:py-3.5 text-[13px] sm:text-[14px] font-semibold text-slate-950 shadow-[0_8px_32px_rgba(34,197,94,0.3)] transition-all hover:bg-emerald-400 hover:shadow-[0_12px_40px_rgba(34,197,94,0.4)] active:scale-[0.97]"
              >
                <CreditCard size={16} />
                Proceed to Payment
              </button>
            </div>
          )}
        </div>

      </div>

      <PaymentModal open={paymentOpen} onClose={() => setPaymentOpen(false)} onSubmit={handlePayment} />
    </div>
  );
}
