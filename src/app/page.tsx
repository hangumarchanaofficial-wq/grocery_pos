// ============================================================
// Login Page — Premium dark-themed entry point
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { ShoppingCart, Mail, Lock, Fingerprint } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard');
    }
  }, [authLoading, router, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
    } catch (error: unknown) {
      toast.error((error as Error).message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      {/* Animated background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-brand-500/[0.07] blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-sky-500/[0.05] blur-[140px]" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.04] blur-[100px]" />
      </div>

      <Card className="glass-panel-strong relative w-full max-w-md" padding="lg">
        {/* Decorative line */}
        <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/30 to-transparent" />

        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="relative mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center">
            <div className="absolute inset-0 rounded-[22px] bg-brand-500/20 blur-xl" />
            <div className="relative flex h-full w-full items-center justify-center rounded-[22px] border border-brand-400/20 bg-brand-500 text-slate-950 shadow-[0_20px_50px_rgba(34,197,94,0.3)]">
              <ShoppingCart size={30} />
            </div>
          </div>
          <h1 className="text-2xl font-semibold tracking-[-0.04em] text-slate-50">
            GroceryPOS
          </h1>
          <p className="mt-1 text-sm text-slate-500">Retail Command System</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="owner@grocerypos.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={18} />}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={18} />}
            required
          />
          <Button type="submit" size="lg" className="w-full" loading={submitting}>
            <Fingerprint size={18} className="mr-2" />
            Sign In
          </Button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Demo Credentials
          </p>
          <div className="space-y-1.5 text-sm text-slate-400">
            <p>
              <span className="font-medium text-brand-300">Owner:</span>{' '}
              owner@grocerypos.com / password123
            </p>
            <p>
              <span className="font-medium text-sky-300">Manager:</span>{' '}
              manager@grocerypos.com / password123
            </p>
            <p>
              <span className="font-medium text-amber-300">Cashier:</span>{' '}
              cashier@grocerypos.com / password123
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
