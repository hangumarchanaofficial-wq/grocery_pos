// ============================================================
// Login Page — Entry point for the application
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { ShoppingCart, Mail, Lock } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-brand-50 via-white to-green-50">
        <Card className="w-full max-w-md" padding="lg">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-200">
              <ShoppingCart className="text-white" size={30} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">GroceryPOS</h1>
            <p className="text-sm text-gray-500 mt-1">Smart Billing System</p>
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
              Sign In
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs font-medium text-gray-500 mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p><span className="font-medium">Owner:</span> owner@grocerypos.com / password123</p>
              <p><span className="font-medium">Manager:</span> manager@grocerypos.com / password123</p>
              <p><span className="font-medium">Cashier:</span> cashier@grocerypos.com / password123</p>
            </div>
          </div>
        </Card>
      </div>
  );
}
