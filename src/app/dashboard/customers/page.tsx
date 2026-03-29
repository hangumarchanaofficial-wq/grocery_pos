// ============================================================
// Customers Page - List customers with purchase insights
// ============================================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { Plus, Search, User, Phone, ShoppingBag } from 'lucide-react';
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
        } catch {
            // Ignore list loading failures here and keep the page responsive.
        } finally {
            setLoading(false);
        }
    }, [apiFetch, search]);

    useEffect(() => {
        loadCustomers();
    }, [loadCustomers]);

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
        } catch {
            // Ignore detail loading failures to avoid trapping the page.
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
                <Button onClick={() => setShowAdd(true)}>
                    <Plus size={16} className="mr-2" /> Add Customer
                </Button>
            </div>

            <Input
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search size={18} />}
            />

            {loading ? (
                <div className="py-8 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {customers.map((customer) => (
                        <Card
                            key={customer.id}
                            className="cursor-pointer transition-shadow hover:shadow-md"
                            onClick={() => viewCustomer(customer.id)}
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-100">
                                    <User size={18} className="text-brand-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{customer.name}</h4>
                                    <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
                                        <Phone size={12} /> {customer.phone}
                                    </p>
                                    <div className="mt-2 flex items-center gap-2">
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
                        <p className="col-span-full py-8 text-center text-gray-400">No customers found</p>
                    )}
                </div>
            )}

            <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Customer">
                <form onSubmit={handleAdd} className="space-y-4">
                    <Input
                        label="Name *"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Phone *"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                    <Input
                        label="Address"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                    <div className="flex gap-3">
                        <Button type="submit" loading={saving}>Add Customer</Button>
                        <Button type="button" variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
                    </div>
                </form>
            </Modal>

            <Modal
                open={!!selectedCustomer}
                onClose={() => setSelectedCustomer(null)}
                title="Customer Details"
                size="lg"
            >
                {selectedCustomer && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <Card padding="sm" className="text-center">
                                <p className="text-xs text-gray-500">Total Spent</p>
                                <p className="text-lg font-bold text-brand-600">
                                    {formatCurrency(selectedCustomer.stats.totalSpent)}
                                </p>
                            </Card>
                            <Card padding="sm" className="text-center">
                                <p className="text-xs text-gray-500">Visits</p>
                                <p className="text-lg font-bold">{selectedCustomer.stats.visitCount}</p>
                            </Card>
                            <Card padding="sm" className="text-center">
                                <p className="text-xs text-gray-500">Avg Bill</p>
                                <p className="text-lg font-bold">
                                    {selectedCustomer.stats.visitCount > 0
                                        ? formatCurrency(selectedCustomer.stats.totalSpent / selectedCustomer.stats.visitCount)
                                        : 'Rs 0'}
                                </p>
                            </Card>
                        </div>

                        {selectedCustomer.stats.favoriteProducts.length > 0 && (
                            <div>
                                <p className="mb-2 text-sm font-medium text-gray-500">Favorite Products</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedCustomer.stats.favoriteProducts.map((product) => (
                                        <Badge key={product} variant="info">{product}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <p className="mb-2 text-sm font-medium text-gray-500">Recent Purchases</p>
                            <div className="max-h-48 space-y-2 overflow-y-auto">
                                {selectedCustomer.bills.slice(0, 10).map((bill) => (
                                    <div key={bill.billNumber} className="flex justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                                        <span className="font-medium">{bill.billNumber}</span>
                                        <span>{formatCurrency(bill.total)}</span>
                                        <span className="text-gray-400">{new Date(bill.createdAt).toLocaleDateString()}</span>
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
