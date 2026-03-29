// ============================================================
// Settings Page — Premium dark-themed owner controls
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
import { Plus, Shield, Store, Users, Percent } from 'lucide-react';
import { ROLES } from '@/lib/constants';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { apiFetch, user } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CASHIER' });
  const [saving, setSaving] = useState(false);

  const loadUsers = useCallback(async () => {}, []);
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
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/8 bg-white/[0.03]">
          <Shield size={36} className="text-slate-500" />
        </div>
        <h3 className="mt-5 text-xl font-semibold text-slate-200">Owner Access Only</h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          You need owner-level privileges to access store settings and user management.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="glass-panel-strong overflow-hidden p-0">
        <div className="px-6 py-6 lg:px-7">
          <Badge variant="default" className="mb-4">
            <Shield size={10} className="mr-1" /> Admin
          </Badge>
          <h2 className="section-title text-3xl font-semibold">Settings</h2>
          <p className="section-subtitle mt-2 text-sm leading-6">
            Store configuration, user management, and tax settings.
          </p>
        </div>
      </Card>

      {/* Store Info */}
      <Card className="glass-panel-strong">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/12">
            <Store size={18} className="text-brand-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-100">Store Information</h3>
        </div>
        <div className="space-y-4">
          <Input label="Store Name" defaultValue="GroceryPOS Store" />
          <Input label="Phone" defaultValue="+91 98765 43210" />
          <Input label="Address" defaultValue="123 Market Street, City" />
          <Button variant="primary">Save Changes</Button>
        </div>
      </Card>

      {/* User Management */}
      <Card className="glass-panel-strong">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/12">
              <Users size={18} className="text-sky-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100">User Management</h3>
          </div>
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus size={14} className="mr-1" /> Add User
          </Button>
        </div>
        <div className="rounded-[22px] border border-white/8 bg-white/[0.02]">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="font-medium text-slate-100">{user.name}</p>
              <p className="mt-0.5 text-sm text-slate-500">{user.email}</p>
            </div>
            <Badge variant="success">{user.role}</Badge>
          </div>
        </div>
      </Card>

      {/* Tax Settings */}
      <Card className="glass-panel-strong">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/12">
            <Percent size={18} className="text-amber-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-100">Tax Configuration</h3>
        </div>
        <div className="space-y-4">
          <Input label="GST Rate (%)" type="number" defaultValue="5" />
          <Button variant="primary">Update Tax Rate</Button>
        </div>
      </Card>

      {/* Add User Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New User">
        <form onSubmit={handleAddUser} className="space-y-4">
          <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} options={ROLES.map((r) => ({ value: r.value, label: r.label }))} />
          <div className="flex gap-3">
            <Button type="submit" loading={saving}>Create User</Button>
            <Button type="button" variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
