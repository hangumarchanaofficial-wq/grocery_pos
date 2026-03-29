// ============================================================
// Billing Page - The main POS screen
// ============================================================

'use client';

import { useState, useRef } from 'react';
import ProductSearch from '@/components/billing/ProductSearch';
import Cart from '@/components/billing/Cart';
import PaymentModal from '@/components/billing/PaymentModal';
import Receipt from '@/components/billing/Receipt';
import type { ReceiptBill } from '@/components/billing/Receipt';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useCart } from '@/hooks/useCart';
import { useCartStore } from '@/store/cartStore';
import { CreditCard, Printer, UserPlus, ScanLine, WalletCards } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

export default function BillingPage() {
    const { submitBill } = useCart();
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
        } catch {
            toast.error('Lookup failed');
        }
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

    const handlePrint = () => {
        if (receiptRef.current) {
            window.print();
        }
    };

    return (
        <div className="space-y-6">
            <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                <Card className="glass-panel-strong">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-300">Register Workspace</p>
                            <h2 className="section-title mt-3 text-3xl font-semibold">Fast billing, barcode-first.</h2>
                            <p className="section-subtitle mt-2 max-w-2xl text-sm leading-6">
                                Search, scan, and complete invoices from one transaction surface designed for high-throughput checkout.
                            </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                                <div className="mb-2 flex items-center gap-2 text-slate-400">
                                    <ScanLine size={16} />
                                    <span className="text-xs font-semibold uppercase tracking-[0.18em]">Scanner</span>
                                </div>
                                <p className="text-sm text-slate-200">Ready for barcode input and manual search fallback.</p>
                            </div>
                            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                                <div className="mb-2 flex items-center gap-2 text-slate-400">
                                    <WalletCards size={16} />
                                    <span className="text-xs font-semibold uppercase tracking-[0.18em]">Payments</span>
                                </div>
                                <p className="text-sm text-slate-200">Cash, card, and QR collection with discount handling.</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </section>

            <div className="grid h-[calc(100vh-240px)] min-h-[720px] grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-6">
                    <Card className="glass-panel-strong">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="section-title text-xl font-semibold">Product Lookup</h3>
                                <p className="section-subtitle mt-1 text-sm">Search by product name or switch to barcode mode for rapid entry.</p>
                            </div>
                        </div>
                        <ProductSearch />
                    </Card>

                    <Card className="glass-panel-strong" padding="sm">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05] text-brand-300">
                                <UserPlus size={18} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Customer Lookup</p>
                                <div className="mt-2 flex gap-2">
                                    <Input
                                        placeholder="Enter phone number"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCustomerLookup()}
                                    />
                                    <Button variant="secondary" onClick={handleCustomerLookup}>
                                        Find
                                    </Button>
                                </div>
                            </div>
                            {customerName && (
                                <div className="rounded-2xl border border-brand-400/20 bg-brand-500/10 px-3 py-2 text-sm font-medium text-brand-300">
                                    {customerName}
                                </div>
                            )}
                        </div>
                    </Card>

                    {lastBill && (
                        <Card className="glass-panel-strong">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h3 className="section-title text-lg font-semibold">Last Receipt</h3>
                                    <p className="section-subtitle mt-1 text-sm">Preview the most recent invoice before printing.</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={handlePrint}>
                                    <Printer size={16} className="mr-2" /> Print
                                </Button>
                            </div>
                            <div className="print-receipt max-h-72 overflow-y-auto rounded-[24px] border border-white/8 bg-white/[0.02] p-3">
                                <Receipt ref={receiptRef} bill={lastBill} />
                            </div>
                        </Card>
                    )}
                </div>

                <Card className="glass-panel-strong flex h-full flex-col">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h3 className="section-title text-xl font-semibold">Current Cart</h3>
                            <p className="section-subtitle mt-1 text-sm">{items.length} line items currently staged for checkout.</p>
                        </div>
                        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2 text-sm font-medium text-slate-300">
                            {items.length} items
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <Cart />
                    </div>

                    {items.length > 0 && (
                        <div className="mt-5 border-t border-white/8 pt-5">
                            <Button
                                variant="primary"
                                size="lg"
                                className="w-full"
                                onClick={() => setPaymentOpen(true)}
                            >
                                <CreditCard size={18} className="mr-2" />
                                Proceed to Payment
                            </Button>
                        </div>
                    )}
                </Card>
            </div>

            <PaymentModal
                open={paymentOpen}
                onClose={() => setPaymentOpen(false)}
                onSubmit={handlePayment}
            />
        </div>
    );
}
