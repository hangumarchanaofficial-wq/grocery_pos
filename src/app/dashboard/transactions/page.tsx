'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Printer, ReceiptText, UserRound, WalletCards } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import Receipt, { type ReceiptBill } from '@/components/billing/Receipt';

type BillRow = {
  id: string;
  billNumber: string;
  total: number;
  paymentMethod: string;
  paidAmount: number;
  changeAmount: number;
  createdAt: string;
  customers?: { name?: string | null } | null;
  users?: { name?: string | null } | null;
};

type BillListResponse = {
  bills: BillRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type BillDetailResponse = {
  billNumber: string;
  createdAt: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paidAmount: number;
  changeAmount: number;
  customers?: { name?: string | null; phone?: string | null } | null;
  users?: { name?: string | null } | null;
  billItems?: Array<{
    quantity: number;
    price: number;
    costPrice?: number;
    total: number;
    products?: { name?: string | null; barcode?: string | null } | null;
  }>;
};

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TransactionsPage() {
  const { apiFetch, user } = useAuth();
  const [rows, setRows] = useState<BillRow[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [selectedBill, setSelectedBill] = useState<ReceiptBill | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch(`/api/billing?page=${page}&limit=25`);
        const data = (await res.json()) as BillListResponse & { error?: string };
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load transactions');
        }
        if (!cancelled) {
          setRows(data.bills || []);
          setPagination(data.pagination);
        }
      } catch (err) {
        if (!cancelled) {
          setRows([]);
          setError(err instanceof Error ? err.message : 'Failed to load transactions');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [apiFetch, page]);

  const totalSales = useMemo(
    () => rows.reduce((sum, row) => sum + Number(row.total || 0), 0),
    [rows]
  );

  const printReceipt = useCallback(() => {
    const receiptNode = receiptRef.current;
    if (!receiptNode || !selectedBill) return;

    const printWindow = window.open('', '_blank', 'width=420,height=900');
    if (!printWindow) return;

    printWindow.document.open();
    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Receipt ${selectedBill.billNumber}</title>
          <style>
            html, body {
              margin: 0;
              padding: 0;
              background: #ffffff;
            }
            body {
              width: 80mm;
              min-height: 100%;
            }
          </style>
        </head>
        <body>${receiptNode.outerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 150);
    };
  }, [selectedBill]);

  const openReceipt = useCallback(async (billId: string) => {
    setReceiptOpen(true);
    setReceiptLoading(true);
    setReceiptError(null);
    setSelectedBill(null);

    try {
      const res = await apiFetch(`/api/billing/${billId}`);
      const data = (await res.json()) as BillDetailResponse & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load receipt');
      }

      const mapped: ReceiptBill = {
        billNumber: data.billNumber,
        createdAt: data.createdAt,
        subtotal: Number(data.subtotal || 0),
        tax: Number(data.tax || 0),
        discount: Number(data.discount || 0),
        total: Number(data.total || 0),
        paymentMethod: data.paymentMethod,
        paidAmount: Number(data.paidAmount || 0),
        changeAmount: Number(data.changeAmount || 0),
        customer: data.customers
          ? {
              name: data.customers.name || 'POS CUSTOMER',
              phone: data.customers.phone || '',
            }
          : null,
        user: { name: data.users?.name || 'Unknown' },
        items: (data.billItems || []).map((item, index) => ({
          quantity: Number(item.quantity || 0),
          price: Number(item.price || 0),
          unitPrice: Number(item.costPrice || 0),
          total: Number(item.total || 0),
          product: {
            name: item.products?.name || `Item ${index + 1}`,
            productCode: item.products?.barcode || undefined,
          },
        })),
      };

      setSelectedBill(mapped);
    } catch (err) {
      setReceiptError(err instanceof Error ? err.message : 'Failed to load receipt');
    } finally {
      setReceiptLoading(false);
    }
  }, [apiFetch]);

  if (user && user.role !== 'OWNER') {
    return (
      <div className="premium-card rounded-[24px] p-6 text-slate-300">
        This page is available to owners only.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="premium-card rounded-[24px] p-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Past Transactions
            </div>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white">Bills and invoice history</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Review recent bills, payment methods, customer names, and cashier activity from one place.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:w-auto">
            <div className="rounded-[18px] border border-white/[0.06] bg-white/[0.03] px-4 py-3">
              <div className="mb-1 flex items-center gap-2 text-slate-500">
                <ReceiptText className="h-4 w-4 text-sky-400" />
                <span className="text-xs uppercase tracking-[0.18em]">Page Bills</span>
              </div>
              <p className="text-2xl font-semibold text-white">{rows.length}</p>
            </div>
            <div className="rounded-[18px] border border-white/[0.06] bg-white/[0.03] px-4 py-3">
              <div className="mb-1 flex items-center gap-2 text-slate-500">
                <WalletCards className="h-4 w-4 text-emerald-400" />
                <span className="text-xs uppercase tracking-[0.18em]">Page Total</span>
              </div>
              <p className="text-2xl font-semibold text-white">{formatCurrency(totalSales)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="premium-card overflow-hidden rounded-[24px]">
        <div className="border-b border-white/[0.06] px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-100">Recent bills</h2>
          <p className="mt-1 text-xs text-slate-500">Owner-only access to historical transactions</p>
        </div>

        {loading ? (
          <div className="px-5 py-16 text-center text-sm text-slate-500">Loading transactions...</div>
        ) : error ? (
          <div className="px-5 py-16 text-center text-sm text-rose-300">{error}</div>
        ) : rows.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-slate-500">No transactions found yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02] text-left text-[11px] uppercase tracking-[0.16em] text-slate-500">
                  <th className="px-5 py-3 font-semibold">Bill</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Cashier</th>
                  <th className="px-5 py-3 font-semibold">Payment</th>
                  <th className="px-5 py-3 font-semibold text-right">Paid</th>
                  <th className="px-5 py-3 font-semibold text-right">Change</th>
                  <th className="px-5 py-3 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => void openReceipt(row.id)}
                    className="cursor-pointer border-b border-white/[0.05] text-sm text-slate-300 transition hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{row.billNumber}</div>
                      <div className="mt-1 text-xs text-slate-500">{row.id.slice(0, 8)}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-400">{formatDateTime(row.createdAt)}</td>
                    <td className="px-5 py-4 text-slate-300">{row.customers?.name || 'POS CUSTOMER'}</td>
                    <td className="px-5 py-4">
                      <div className="inline-flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-sky-400" />
                        <span>{row.users?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-300">{row.paymentMethod}</td>
                    <td className="px-5 py-4 text-right tabular-nums text-slate-300">{formatCurrency(Number(row.paidAmount || 0))}</td>
                    <td className="px-5 py-4 text-right tabular-nums text-slate-400">{formatCurrency(Number(row.changeAmount || 0))}</td>
                    <td className="px-5 py-4 text-right tabular-nums font-semibold text-emerald-400">{formatCurrency(Number(row.total || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-4">
          <p className="text-xs text-slate-500">
            Showing page <span className="text-slate-300">{pagination.page}</span> of{' '}
            <span className="text-slate-300">{pagination.totalPages}</span> · Total bills{' '}
            <span className="text-slate-300">{pagination.total}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page <= 1}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-slate-300 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={pagination.page >= pagination.totalPages}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-slate-300 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <Modal open={receiptOpen} onClose={() => setReceiptOpen(false)} title="Past receipt" size="lg">
        {receiptLoading ? (
          <div className="py-10 text-center text-sm text-slate-400">Loading receipt...</div>
        ) : receiptError ? (
          <div className="py-10 text-center text-sm text-rose-300">{receiptError}</div>
        ) : selectedBill ? (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={printReceipt}
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08]"
              >
                <Printer className="h-4 w-4" />
                Print receipt
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto rounded-[18px] border border-white/[0.06] bg-white p-2">
              <Receipt ref={receiptRef} bill={selectedBill} />
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
