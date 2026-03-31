'use client';

import { useState, useRef } from 'react';
import ProductSearch from '@/components/billing/ProductSearch';
import Cart from '@/components/billing/Cart';
import PaymentModal from '@/components/billing/PaymentModal';
import Receipt from '@/components/billing/Receipt';
import type { ReceiptBill } from '@/components/billing/Receipt';
import { useCart } from '@/hooks/useCart';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/hooks/useAuth';
import Input from '@/components/ui/Input';
import { CreditCard, ScanLine, WalletCards, UserPlus, Printer, ShoppingBag, Zap, Search, User, Package, Receipt as ReceiptIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function BillingPage() {
  const submitBill = useCart();
  const { items, setCustomer, customerName } = useCartStore();
  const { apiFetch } = useAuth();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [lastBill, setLastBill] = useState<ReceiptBill | null>(null);
  const [customerPhone, setCustomerPhone] = useState('');
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleCustomerLookup = async () => {
    if (!customerPhone) return;
    try {
      const res = await apiFetch(`/api/customers?search=${customerPhone}`);
      const data = await res.json();
      if (data.length > 0) {
        setCustomer(data[0].id, data[0].name);
        toast.success(`Customer: ${data[0].name}`);
      } else {
        toast.error('Customer not found');
      }
    } catch { toast.error('Lookup failed'); }
  };

  const handlePayment = async (method: string, paidAmount: number, discount: number) => {
    try {
      const bill = await submitBill(method, paidAmount, discount);
      setLastBill(bill);
      toast.success(`Bill ${bill.billNumber} created!`);
    } catch (error: unknown) {
      toast.error((error as Error).message);
      throw error;
    }
  };

  const handlePrint = () => { if (receiptRef.current) window.print(); };

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="space-y-5">

      {/* ── HERO HEADER ── */}
      <div className="relative overflow-hidden rounded-[24px] border border-white/[0.07] bg-gradient-to-br from-[rgba(8,20,40,0.96)] to-[rgba(4,10,22,0.98)] p-7 shadow-[0_32px_80px_rgba(0,0,0,0.4)]">
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/[0.06] blur-[80px]" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-sky-500/[0.04] blur-[60px]" />
        <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-400">Register Workspace</span>
            </div>
            <h1 className="text-[clamp(1.8rem,3.5vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.04em] text-white">
              Fast billing,<br />
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">barcode-first.</span>
            </h1>
            <p className="mt-3 max-w-md text-[13px] leading-[1.75] text-slate-400">
              Search, scan, and complete invoices from one transaction surface designed for high-throughput checkout.
            </p>
          </div>

          {/* Right — capability tiles */}
          <div className="grid grid-cols-3 gap-3 lg:w-[420px]">
            <div className="rounded-[16px] border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-[10px] bg-emerald-500/10">
                <ScanLine size={15} className="text-emerald-400" />
              </div>
              <p className="text-[11px] font-semibold text-slate-200">Scanner</p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-slate-600">Barcode + manual fallback</p>
            </div>
            <div className="rounded-[16px] border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-[10px] bg-sky-500/10">
                <WalletCards size={15} className="text-sky-400" />
              </div>
              <p className="text-[11px] font-semibold text-slate-200">Payments</p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-slate-600">Cash, card, QR + discounts</p>
            </div>
            <div className="rounded-[16px] border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-[10px] bg-violet-500/10">
                <Zap size={15} className="text-violet-400" />
              </div>
              <p className="text-[11px] font-semibold text-slate-200">Express</p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-slate-600">One-click fast checkout</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN WORKSPACE ── */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_400px]">

        {/* LEFT COLUMN */}
        <div className="space-y-4">

          {/* Product Lookup */}
          <div className="relative overflow-hidden rounded-[24px] border border-white/[0.07] bg-gradient-to-br from-[rgba(6,14,30,0.96)] to-[rgba(3,8,18,0.98)] p-6 shadow-[0_32px_80px_rgba(0,0,0,0.3)]">
            <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/25 to-transparent" />
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-sky-400/20 bg-sky-500/10">
                <Search size={17} className="text-sky-400" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-slate-100">Product Lookup</h2>
                <p className="text-[11px] text-slate-500">Search by name or scan barcode for rapid entry</p>
              </div>
            </div>
            <ProductSearch />
          </div>

          {/* Customer Lookup */}
          <div className="relative overflow-hidden rounded-[24px] border border-white/[0.07] bg-gradient-to-br from-[rgba(6,14,30,0.96)] to-[rgba(3,8,18,0.98)] p-6 shadow-[0_32px_80px_rgba(0,0,0,0.3)]">
            <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/20 to-transparent" />
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-violet-400/20 bg-violet-500/10">
                <UserPlus size={17} className="text-violet-400" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-slate-100">Customer Lookup</h2>
                <p className="text-[11px] text-slate-500">Attach a customer to this transaction by phone</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Enter phone number..."
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCustomerLookup()}
                />
              </div>
              <button
                onClick={handleCustomerLookup}
                className="flex items-center gap-2 rounded-[14px] border border-violet-400/20 bg-violet-500/10 px-5 py-2.5 text-[13px] font-semibold text-violet-300 transition-all hover:bg-violet-500/20 hover:text-violet-200 active:scale-[0.98]"
              >
                <User size={14} /> Find
              </button>
            </div>
            {customerName && (
              <div className="mt-3 flex items-center gap-2 rounded-[14px] border border-emerald-400/20 bg-emerald-500/10 px-4 py-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">
                  {customerName[0].toUpperCase()}
                </div>
                <p className="text-[13px] font-semibold text-emerald-300">{customerName}</p>
                <span className="ml-auto text-[10px] uppercase tracking-[0.15em] text-emerald-500">Linked</span>
              </div>
            )}
          </div>

          {/* Last Receipt */}
          {lastBill && (
            <div className="relative overflow-hidden rounded-[24px] border border-white/[0.07] bg-gradient-to-br from-[rgba(6,14,30,0.96)] to-[rgba(3,8,18,0.98)] p-6 shadow-[0_32px_80px_rgba(0,0,0,0.3)]">
              <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-amber-400/20 bg-amber-500/10">
                    <ReceiptIcon size={17} className="text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-slate-100">Last Receipt</h2>
                    <p className="text-[11px] text-slate-500">Preview before printing</p>
                  </div>
                </div>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 rounded-[12px] border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-[12px] font-semibold text-slate-300 transition-all hover:bg-white/[0.08] hover:text-white"
                >
                  <Printer size={13} /> Print
                </button>
              </div>
              <div className="print-receipt max-h-64 overflow-y-auto rounded-[18px] border border-white/[0.05] bg-white/[0.02] p-4">
                <Receipt ref={receiptRef} bill={lastBill} />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN — Cart */}
        <div className="relative overflow-hidden rounded-[24px] border border-white/[0.07] bg-gradient-to-br from-[rgba(6,14,30,0.96)] to-[rgba(3,8,18,0.98)] shadow-[0_32px_80px_rgba(0,0,0,0.3)] flex flex-col min-h-[600px]">
          <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />

          {/* Cart Header */}
          <div className="flex items-center justify-between border-b border-white/[0.05] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-emerald-400/20 bg-emerald-500/10">
                <ShoppingBag size={17} className="text-emerald-400" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-slate-100">Current Cart</h2>
                <p className="text-[11px] text-slate-500">{items.length} line item{items.length !== 1 ? 's' : ''} staged</p>
              </div>
            </div>
            {items.length > 0 && (
              <div className="rounded-[10px] bg-emerald-500/15 px-3 py-1.5 text-[11px] font-bold text-emerald-400">
                Rs {subtotal.toLocaleString('en-IN')}
              </div>
            )}
          </div>

          {/* Cart Body */}
          <div className="flex-1 overflow-hidden px-4 py-3">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-[20px] border border-white/[0.05] bg-white/[0.02]">
                  <Package size={28} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-slate-400">Cart is empty</p>
                  <p className="mt-1 text-[12px] text-slate-600">Search or scan products to begin a transaction</p>
                </div>
              </div>
            ) : (
              <Cart />
            )}
          </div>

          {/* Cart Footer */}
          {items.length > 0 && (
            <div className="border-t border-white/[0.05] p-5">
              {/* Summary */}
              <div className="mb-4 space-y-2 rounded-[16px] border border-white/[0.05] bg-white/[0.02] p-4">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium text-slate-300">Rs {subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-slate-500">Tax (5%)</span>
                  <span className="font-medium text-slate-300">Rs {Math.round(subtotal * 0.05).toLocaleString('en-IN')}</span>
                </div>
                <div className="my-2 border-t border-white/[0.06]" />
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-slate-200">Total</span>
                  <span className="text-[15px] font-bold text-emerald-400">
                    Rs {Math.round(subtotal * 1.05).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setPaymentOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-emerald-500 py-3.5 text-[14px] font-semibold text-slate-950 shadow-[0_8px_32px_rgba(34,197,94,0.3)] transition-all hover:bg-emerald-400 hover:shadow-[0_12px_40px_rgba(34,197,94,0.45)] active:scale-[0.98]"
              >
                <CreditCard size={17} />
                Proceed to Payment
              </button>
            </div>
          )}
        </div>
      </div>

      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        onSubmit={handlePayment}
      />
    </div>
  );
}