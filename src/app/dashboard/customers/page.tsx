// ============================================================
// Customers Page — Premium dark-themed customer management
// ============================================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { Plus, Search, User, Phone, ShoppingBag, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  _count: { bills: number };
}

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

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const q = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await apiFetch(`/api/customers${q}`);
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [apiFetch, search]);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

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
        onChange={(e) => setSearch(e.target.value)}
        icon={<Search size={18} />}
      />

      {/* Customer Grid */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-400/30 border-t-brand-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {customers.map((customer) => (
            <Card
              key={customer.id}
              className="cursor-pointer transition-all hover:border-brand-400/20 hover:bg-white/[0.04]"
              onClick={() => viewCustomer(customer.id)}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.05]">
                  <User size={20} className="text-brand-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-slate-100">{customer.name}</h4>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
                    <Phone size={12} /> {customer.phone}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="info">
                      <ShoppingBag size={10} className="mr-1" />
                      {customer._count.bills} purchases
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {customers.length === 0 && (
            <div className="col-span-full flex h-40 items-center justify-center rounded-[28px] border border-dashed border-white/10 text-slate-500">
              No customers found
            </div>
          )}
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
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Total Spent</p>
                <p className="mt-2 text-lg font-semibold text-brand-300">
                  {formatCurrency(selectedCustomer.stats.totalSpent)}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Visits</p>
                <p className="mt-2 text-lg font-semibold text-slate-100">
                  {selectedCustomer.stats.visitCount}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Avg Bill</p>
                <p className="mt-2 text-lg font-semibold text-slate-100">
                  {selectedCustomer.stats.visitCount > 0
                    ? formatCurrency(selectedCustomer.stats.totalSpent / selectedCustomer.stats.visitCount)
                    : 'Rs 0'}
                </p>
              </div>
            </div>

            {/* Favorite Products */}
            {selectedCustomer.stats.favoriteProducts.length > 0 && (
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Favorite Products
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedCustomer.stats.favoriteProducts.map((product) => (
                    <Badge key={product} variant="info">{product}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Purchases */}
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Recent Purchases
              </p>
              <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
                {selectedCustomer.bills.slice(0, 10).map((bill) => (
                  <div
                    key={bill.billNumber}
                    className="flex justify-between rounded-[18px] border border-white/6 bg-white/[0.02] px-4 py-3 text-sm"
                  >
                    <span className="font-mono font-medium text-slate-200">{bill.billNumber}</span>
                    <span className="font-medium text-brand-300">{formatCurrency(bill.total)}</span>
                    <span className="text-slate-500">{new Date(bill.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
