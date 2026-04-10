// src/app/dashboard/settings/page.tsx
// ============================================================
// Settings Page — Language, Store Info, Receipt, Users, Tax
// ============================================================

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSettingsStore } from '@/store/settingsStore';
import { t } from '@/lib/i18n';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import {
  Plus, Shield, Store, Users, Percent, Languages,
  Globe, FileText, CheckCircle, Receipt
} from 'lucide-react';
import { ROLES } from '@/lib/constants';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { apiFetch, user } = useAuth();
  const { settings, updateSettings, setLanguage } = useSettingsStore();
  const lang = settings.language;
  const tr = (key: Parameters<typeof t>[1]) => t(lang, key);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CASHIER' });
  const [saving, setSaving] = useState(false);
  const [storeForm, setStoreForm] = useState({
    storeName: settings.storeName,
    storeNameSi: settings.storeNameSi,
    address: settings.address,
    addressSi: settings.addressSi,
    phone: settings.phone,
    receiptFooter: settings.receiptFooter,
    receiptFooterSi: settings.receiptFooterSi,
    taxRate: settings.taxRate,
    terminalId: settings.terminalId,
    showSavingsOnReceipt: settings.showSavingsOnReceipt,
  });

  const handleSaveStore = () => {
    updateSettings(storeForm);
    toast.success(lang === 'si' ? 'සැකසුම් සුරකින ලදී!' : 'Settings saved!');
  };

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
      toast.success(lang === 'si' ? 'පරිශීලකයා සාදන ලදී!' : 'User created!');
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
        <h3 className="mt-5 text-xl font-semibold text-slate-200">
          {lang === 'si' ? 'හිමිකරු ප්‍රවේශය පමණි' : 'Owner Access Only'}
        </h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          {lang === 'si'
            ? 'ගබඩා සැකසුම් සහ පරිශීලක කළමනාකරණය සඳහා ඔබට හිමිකරු මට්ටමේ වරප්‍රසාද අවශ්‍ය වේ.'
            : 'You need owner-level privileges to access store settings and user management.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header Card */}
      <Card className="glass-panel-strong overflow-hidden p-0">
        <div className="px-6 py-6 lg:px-7">
          <Badge variant="default" className="mb-4">
            <Shield size={10} className="mr-1" /> Admin
          </Badge>
          <h2 className="section-title text-3xl font-semibold">{tr('settings')}</h2>
          <p className="section-subtitle mt-2 text-sm leading-6">
            {lang === 'si'
              ? 'ගබඩා වින්‍යාසය, පරිශීලක කළමනාකරණය සහ බදු සැකසුම්.'
              : 'Store configuration, user management, tax and language settings.'}
          </p>
        </div>
      </Card>

      {/* ── LANGUAGE SETTINGS ── */}
      <Card className="glass-panel-strong">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/12">
            <Languages size={18} className="text-blue-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-100">{tr('languageSettings')}</h3>
        </div>
        <p className="mb-4 text-sm text-slate-400">{tr('languageHint')}</p>

        {/* Language Toggle */}
        <div className="flex gap-3 mb-4">
          {/* English Option */}
          <button
            onClick={() => setLanguage('en')}
            className={`flex-1 flex items-center gap-3 p-4 rounded-[18px] border-2 transition-all ${
              lang === 'en'
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-white/10 bg-white/[0.02] hover:border-white/20'
            }`}
          >
            <div className="text-2xl">🇬🇧</div>
            <div className="text-left">
              <div className="font-semibold text-slate-100">{tr('english')}</div>
              <div className="text-xs text-slate-500">English Interface</div>
            </div>
            {lang === 'en' && <CheckCircle size={18} className="ml-auto text-emerald-400" />}
          </button>

          {/* Sinhala Option */}
          <button
            onClick={() => setLanguage('si')}
            className={`flex-1 flex items-center gap-3 p-4 rounded-[18px] border-2 transition-all ${
              lang === 'si'
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-white/10 bg-white/[0.02] hover:border-white/20'
            }`}
          >
            <div className="text-2xl">🇱🇰</div>
            <div className="text-left">
              <div className="font-semibold text-slate-100" style={{ fontFamily: "'Noto Sans Sinhala', sans-serif" }}>
                {tr('sinhala')}
              </div>
              <div className="text-xs text-slate-500">සිංහල අතුරු මුහුණත</div>
            </div>
            {lang === 'si' && <CheckCircle size={18} className="ml-auto text-emerald-400" />}
          </button>
        </div>

        <div className="rounded-[14px] border border-blue-400/20 bg-blue-500/5 px-4 py-3 text-[12px] text-blue-300">
          <Globe size={12} className="inline mr-1" />
          {lang === 'si'
            ? 'වත්මන් භාෂාව: සිංහල — රිසිට්, මෙනු, සහ සියලු UI සිංහලෙන් දිස් වේ.'
            : 'Current language: English — Receipts, menus, and all UI will display in English.'}
        </div>
      </Card>

      {/* ── STORE INFORMATION ── */}
      <Card className="glass-panel-strong">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/12">
            <Store size={18} className="text-brand-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-100">{tr('storeInfo')}</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={tr('storeName')}
              value={storeForm.storeName}
              onChange={e => setStoreForm({ ...storeForm, storeName: e.target.value })}
              placeholder="SAMARANAYAKE&#10;THE DISCOUNT STORE"
            />
            <Input
              label={tr('storeNameSi')}
              value={storeForm.storeNameSi}
              onChange={e => setStoreForm({ ...storeForm, storeNameSi: e.target.value })}
              placeholder="ගබඩා නාමය (සිංහල)"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={tr('address')}
              value={storeForm.address}
              onChange={e => setStoreForm({ ...storeForm, address: e.target.value })}
            />
            <Input
              label={tr('addressSi')}
              value={storeForm.addressSi}
              onChange={e => setStoreForm({ ...storeForm, addressSi: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={tr('phone')}
              value={storeForm.phone}
              onChange={e => setStoreForm({ ...storeForm, phone: e.target.value })}
            />
            <Input
              label={tr('terminalId')}
              type="number"
              value={String(storeForm.terminalId)}
              onChange={e => setStoreForm({ ...storeForm, terminalId: parseInt(e.target.value) || 1 })}
            />
          </div>
          <Button variant="primary" onClick={handleSaveStore}>{tr('saveChanges')}</Button>
        </div>
      </Card>

      {/* ── RECEIPT SETTINGS ── */}
      <Card className="glass-panel-strong">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/12">
            <Receipt size={18} className="text-amber-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-100">{tr('receiptSettings')}</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={tr('receiptFooter')}
              value={storeForm.receiptFooter}
              onChange={e => setStoreForm({ ...storeForm, receiptFooter: e.target.value })}
              placeholder="Thank you Please Come again."
            />
            <Input
              label={tr('receiptFooterSi')}
              value={storeForm.receiptFooterSi}
              onChange={e => setStoreForm({ ...storeForm, receiptFooterSi: e.target.value })}
              placeholder="ස්තූතියි. නැවත වැඩම කරන්න."
            />
          </div>

          {/* Show Savings Toggle */}
          <div className="flex items-center justify-between rounded-[16px] border border-white/10 bg-white/[0.02] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-200">{tr('showSavings')}</p>
              <p className="text-xs text-slate-500">
                {lang === 'si' ? '"ඔබ ඉතිරි කළා" කොටස රිසිට් හි දිස් කරන්න' : 'Show "You Saved" box on the receipt'}
              </p>
            </div>
            <button
              onClick={() => setStoreForm({ ...storeForm, showSavingsOnReceipt: !storeForm.showSavingsOnReceipt })}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                storeForm.showSavingsOnReceipt ? 'bg-emerald-500' : 'bg-slate-600'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                storeForm.showSavingsOnReceipt ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <Button variant="primary" onClick={handleSaveStore}>{tr('saveChanges')}</Button>
        </div>
      </Card>

      {/* ── TAX SETTINGS ── */}
      <Card className="glass-panel-strong">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/12">
            <Percent size={18} className="text-amber-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-100">{tr('taxConfig')}</h3>
        </div>
        <div className="space-y-4">
          <Input
            label={tr('taxRate')}
            type="number"
            value={String(storeForm.taxRate)}
            onChange={e => setStoreForm({ ...storeForm, taxRate: parseFloat(e.target.value) || 0 })}
          />
          <p className="text-xs text-slate-500">
            {lang === 'si'
              ? 'බදු 0 ලෙස සකසන්නේ නම් රිසිට් හි බදු ලෙස නොපෙන්වේ.'
              : 'Set to 0 to disable tax display on receipts.'}
          </p>
          <Button variant="primary" onClick={handleSaveStore}>{tr('saveChanges')}</Button>
        </div>
      </Card>

      {/* ── USER MANAGEMENT ── */}
      <Card className="glass-panel-strong">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/12">
              <Users size={18} className="text-sky-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100">{tr('userManagement')}</h3>
          </div>
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus size={14} className="mr-1" /> {tr('addUser')}
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

      {/* Add User Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)}
        title={lang === 'si' ? 'නව පරිශීලකයෙකු එකතු කරන්න' : 'Add New User'}>
        <form onSubmit={handleAddUser} className="space-y-4">
          <Input label={lang === 'si' ? 'සම්පූර්ණ නාමය' : 'Full Name'}
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label={lang === 'si' ? 'මුරපදය' : 'Password'} type="password"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <Select label={lang === 'si' ? 'භූමිකාව' : 'Role'}
            value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
            options={ROLES.map((r) => ({ value: r.value, label: r.label }))} />
          <div className="flex gap-3">
            <Button type="submit" loading={saving}>{lang === 'si' ? 'සාදන්න' : 'Create User'}</Button>
            <Button type="button" variant="secondary" onClick={() => setShowAdd(false)}>
              {lang === 'si' ? 'අවලංගු කරන්න' : 'Cancel'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
