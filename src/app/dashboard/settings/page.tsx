// ============================================================
// Settings Page — User management (Owner only)
// ============================================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { Plus, Shield } from 'lucide-react';
import { ROLES } from '@/lib/constants';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const { apiFetch, user } = useAuth();
    const [users, setUsers] = useState<
        { id: string; name: string; email: string; role: string; active: boolean }[]
    >([]);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CASHIER' });
    const [saving, setSaving] = useState(false);

    const loadUsers = useCallback(async () => {
        // We would need an admin users endpoint; for now, show current user info
        // In production, add GET /api/users for OWNER role
    }, []);

    useEffect(() => { loadUsers(); }, [loadUsers]);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await apiFetch('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }
            toast.success('User created!');
            setShowAdd(false);
            setForm({ name: '', email: '', password: '', role: 'CASHIER' });
        } catch (error: unknown) {
            toast.error((error as Error).message);
        } finally {
            setSaving(false);
        }
    };

    if (user?.role !== 'OWNER') {
        return (
            <div className="text-center py-16">
                <Shield size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600">Owner Access Only</h3>
                <p className="text-sm text-gray-400">You need owner privileges to access settings.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

            {/* Store Info */}
            <Card>
                <h3 className="text-lg font-semibold mb-4">Store Information</h3>
                <div className="space-y-3">
                    <Input label="Store Name" defaultValue="GroceryPOS Store" />
                    <Input label="Phone" defaultValue="+91 98765 43210" />
                    <Input label="Address" defaultValue="123 Market Street, City" />
                    <Button variant="primary">Save Changes</Button>
                </div>
            </Card>

            {/* User Management */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">User Management</h3>
                    <Button size="sm" onClick={() => setShowAdd(true)}>
                        <Plus size={14} className="mr-1" /> Add User
                    </Button>
                </div>

                {/* Current user info */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <Badge variant="success">{user.role}</Badge>
                    </div>
                </div>
            </Card>

            {/* Tax Settings */}
            <Card>
                <h3 className="text-lg font-semibold mb-4">Tax Configuration</h3>
                <Input label="GST Rate (%)" type="number" defaultValue="5" />
                <Button variant="primary" className="mt-3">Update Tax Rate</Button>
            </Card>

            {/* Add User Modal */}
            <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New User">
                <form onSubmit={handleAddUser} className="space-y-4">
                    <Input
                        label="Full Name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                    />
                    <Select
                        label="Role"
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        options={ROLES.map((r) => ({ value: r.value, label: r.label }))}
                    />
                    <div className="flex gap-3">
                        <Button type="submit" loading={saving}>Create User</Button>
                        <Button type="button" variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
