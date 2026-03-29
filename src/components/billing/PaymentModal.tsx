// ============================================================
// Payment Modal - Choose payment method & complete sale
// ============================================================

'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useCartStore } from '@/store/cartStore';
import { formatCurrency } from '@/lib/utils';
import { Banknote, CreditCard, QrCode, CheckCircle } from 'lucide-react';

interface PaymentModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (paymentMethod: string, paidAmount: number, discount: number) => Promise<void>;
}

const paymentMethods = [
    { value: 'CASH', label: 'Cash', icon: Banknote, color: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300' },
    { value: 'CARD', label: 'Card', icon: CreditCard, color: 'border-sky-400/20 bg-sky-500/10 text-sky-300' },
    { value: 'QR', label: 'QR Code', icon: QrCode, color: 'border-violet-400/20 bg-violet-500/10 text-violet-300' },
];

export default function PaymentModal({ open, onClose, onSubmit }: PaymentModalProps) {
    const [method, setMethod] = useState('CASH');
    const [discount, setDiscount] = useState('0');
    const [paidAmount, setPaidAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const { getSubtotal, items } = useCartStore();
    const discountNum = parseFloat(discount) || 0;
    const subtotal = getSubtotal();
    const adjustedSubtotal = subtotal - discountNum;
    const tax = adjustedSubtotal * 0.05;
    const total = adjustedSubtotal + tax;
    const paid = parseFloat(paidAmount) || total;
    const change = Math.max(0, paid - total);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await onSubmit(method, paid, discountNum);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
                setDiscount('0');
                setPaidAmount('');
                setMethod('CASH');
            }, 2000);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Modal open={open} onClose={onClose} size="sm">
                <div className="flex flex-col items-center py-8">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/12">
                        <CheckCircle size={40} className="text-emerald-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-100">Payment Successful</h3>
                    <p className="mt-1 text-sm text-slate-400">Receipt is being generated.</p>
                </div>
            </Modal>
        );
    }

    return (
        <Modal open={open} onClose={onClose} title="Complete Payment" size="md">
            <div className="space-y-5">
                <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Payment Method</p>
                    <div className="grid grid-cols-3 gap-3">
                        {paymentMethods.map((pm) => (
                            <button
                                key={pm.value}
                                onClick={() => setMethod(pm.value)}
                                className={`flex flex-col items-center gap-2 rounded-[22px] border p-4 transition-all ${
                                    method === pm.value
                                        ? pm.color
                                        : 'border-white/8 text-slate-500 hover:border-white/14 hover:bg-white/[0.03]'
                                }`}
                            >
                                <pm.icon size={24} />
                                <span className="text-sm font-medium">{pm.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <Input
                    label="Discount (Rs)"
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    min="0"
                    max={subtotal.toString()}
                />

                {method === 'CASH' && (
                    <Input
                        label="Received Amount (Rs)"
                        type="number"
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(e.target.value)}
                        placeholder={total.toFixed(2)}
                    />
                )}

                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex justify-between text-sm text-slate-400">
                        <span>Items ({items.length})</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {discountNum > 0 && (
                        <div className="mt-2 flex justify-between text-sm text-red-300">
                            <span>Discount</span>
                            <span>-{formatCurrency(discountNum)}</span>
                        </div>
                    )}
                    <div className="mt-2 flex justify-between text-sm text-slate-400">
                        <span>Tax (5%)</span>
                        <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="mt-3 flex justify-between border-t border-white/8 pt-3 text-lg font-semibold text-slate-100">
                        <span>Total</span>
                        <span className="text-brand-300">{formatCurrency(total)}</span>
                    </div>
                    {method === 'CASH' && change > 0 && (
                        <div className="mt-2 flex justify-between text-sm font-medium text-sky-300">
                            <span>Change to return</span>
                            <span>{formatCurrency(change)}</span>
                        </div>
                    )}
                </div>

                <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={items.length === 0}
                >
                    Complete Sale | {formatCurrency(total)}
                </Button>
            </div>
        </Modal>
    );
}
