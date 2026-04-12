// ============================================================
// Customers Page — Premium dark-themed customer management
// ============================================================

'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { Plus, Search, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  _count: { bills: number };
}

const PAGE_SIZE = 10;

interface CustomerDetails {
  name: string;
  phone: string;
  email?: string;
  stats: {
    totalSpent: number;
    visitCount: number;
    favoriteProducts: string[];
  };
  bills: {
    billNumber: string;
    total: number;
    createdAt: string;
  }[];
}

export default function CustomersPage() {
  const { apiFetch } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetails | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [tablePage, setTablePage] = useState(0);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('limit', '500');
      const res = await apiFetch(`/api/customers?${params}`);
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [apiFetch, search]);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  const maxPage = Math.max(0, Math.ceil(customers.length / PAGE_SIZE) - 1);
  const totalPages = Math.max(1, Math.ceil(customers.length / PAGE_SIZE));
  const activePage = Math.min(tablePage, maxPage);
  const pageRows = useMemo(() => {
    const start = activePage * PAGE_SIZE;
    return customers.slice(start, start + PAGE_SIZE);
  }, [customers, activePage]);
  const rangeStart = customers.length === 0 ? 0 : activePage * PAGE_SIZE + 1;
  const rangeEnd = Math.min((activePage + 1) * PAGE_SIZE, customers.length);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error('Name and phone required');
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch('/api/customers', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      toast.success('Customer added!');
      setShowAdd(false);
      setForm({ name: '', phone: '', email: '', address: '' });
      loadCustomers();
    } catch (error: unknown) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const viewCustomer = async (id: string) => {
    try {
      const res = await apiFetch(`/api/customers/${id}`);
      const data = await res.json();
      setSelectedCustomer(data);
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <Card className="glass-panel-strong overflow-hidden p-0">
        <div className="px-6 py-6 lg:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge variant="info" className="mb-4">
                <Users size={10} className="mr-1" /> CRM
              </Badge>
              <h2 className="section-title text-3xl font-semibold">Customer Management</h2>
              <p className="section-subtitle mt-2 max-w-xl text-sm leading-6">
                Track regulars, view purchase history, and identify buying patterns from your customer base.
              </p>
            </div>
            <Button onClick={() => setShowAdd(true)}>
              <Plus size={16} className="mr-2" /> Add Customer
            </Button>
          </div>
        </div>
      </Card>

      {/* Search */}
      <Input
        placeholder="Search by name or phone number..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setTablePage(0);
        }}
        icon={<Search size={18} />}
      />

      {/* Customer table — 10 per page; search still loads filtered list from API */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-400/30 border-t-brand-400" />
        </div>
      ) : customers.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-[20px] border border-dashed border-white/10 text-slate-500">
          No customers found
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.015] backdrop-blur-sm">
          <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
            <table className="w-full table-fixed border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left">
                  <th className="w-[45%] px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:px-4">
                    Name
                  </th>
                  <th className="w-[35%] px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:px-4">
                    Phone
                  </th>
                  <th className="w-[20%] px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:px-4">
                    Purchases
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {pageRows.map((customer) => (
                  <tr
                    key={customer.id}
                    className="cursor-pointer transition-colors hover:bg-white/[0.04]"
                    onClick={() => viewCustomer(customer.id)}
                  >
                    <td className="min-w-0 px-3 py-3 font-semibold text-slate-100 sm:px-4">
                      <span className="line-clamp-2">{customer.name}</span>
                    </td>
                    <td className="min-w-0 px-3 py-3 text-slate-400 sm:px-4">
                      <span className="tabular-nums">{customer.phone}</span>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-slate-300 sm:px-4">
                      {customer._count.bills}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 border-t border-white/[0.06] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
            <p className="text-center text-[11px] text-slate-500 sm:text-left">
              <span className="tabular-nums text-slate-400">{rangeStart}</span>
              {'–'}
              <span className="tabular-nums text-slate-400">{rangeEnd}</span>
              <span className="text-slate-600"> of </span>
              <span className="tabular-nums text-slate-400">{customers.length}</span>
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setTablePage((p) => Math.max(0, p - 1));
                }}
                disabled={activePage <= 0}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-slate-300 transition-all hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="min-w-[3.5rem] text-center text-[11px] tabular-nums text-slate-500">
                {activePage + 1}/{totalPages}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setTablePage((p) => Math.min(maxPage, p + 1));
                }}
                disabled={activePage >= maxPage}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-slate-300 transition-all hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Next page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Customer">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Phone *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <div className="flex gap-3">
            <Button type="submit" loading={saving}>Add Customer</Button>
            <Button type="button" variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Customer Detail Modal */}
      <Modal
        open={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title="Customer Details"
        size="lg"
      >
        {selectedCustomer && (
          <div className="space-y-5">
            {/* Stats — shared layout so labels/values line up across cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-3">
              {[
                {
                  label: 'Total spent',
                  value: formatCurrency(selectedCustomer.stats.totalSpent),
                  valueClass: 'text-brand-300',
                },
                {
                  label: 'Visits',
                  value: String(selectedCustomer.stats.visitCount),
                  valueClass: 'text-slate-100',
                },
                {
                  label: 'Avg bill',
                  value:
                    selectedCustomer.stats.visitCount > 0
                      ? formatCurrency(
                          selectedCustomer.stats.totalSpent / selectedCustomer.stats.visitCount
                        )
                      : formatCurrency(0),
                  valueClass: 'text-brand-300',
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex min-h-[5.75rem] flex-col items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3 py-4 text-center sm:min-h-[6rem] sm:px-4"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {stat.label}
                  </p>
                  <p
                    className={`text-lg font-semibold tabular-nums leading-none ${stat.valueClass}`}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Favorite Products */}
            {selectedCustomer.stats.favoriteProducts.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Favorite products
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedCustomer.stats.favoriteProducts.map((product) => (
                    <Badge key={product} variant="info">{product}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Recent purchases */}
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Recent purchases
              </p>
              {selectedCustomer.bills.length === 0 ? (
                <p className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-center text-sm text-slate-500">
                  No purchases yet
                </p>
              ) : (
                <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
                  {selectedCustomer.bills.slice(0, 10).map((bill) => (
                    <div
                      key={bill.billNumber}
                      className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm"
                    >
                      <span className="min-w-0 truncate font-mono font-medium text-slate-200">
                        {bill.billNumber}
                      </span>
                      <span className="shrink-0 text-right font-medium tabular-nums text-brand-300">
                        {formatCurrency(bill.total)}
                      </span>
                      <span className="shrink-0 text-right text-slate-500 tabular-nums">
                        {new Date(bill.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
