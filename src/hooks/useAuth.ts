'use client';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, useCallback } from 'react';

async function readJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      res.ok
        ? 'Invalid response from server'
        : `Server error (${res.status}). If this is production, confirm Supabase env vars are set in the host (including SUPABASE_SERVICE_ROLE_KEY).`
    );
  }
}

interface UserProfile {
  id: string;
  name: string;
  email?: string;
  role: 'OWNER' | 'MANAGER' | 'CASHIER';
  active: boolean;
}

export function useAuth() {
  const [user, setUser]       = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        try {
          const res = await fetch('/api/auth/me', { credentials: 'include' });
          const data = await readJson<UserProfile & { error?: string }>(res);
          setUser(res.ok ? (data as UserProfile) : null);
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        try {
          const res = await fetch('/api/auth/me', { credentials: 'include' });
          const data = await readJson<UserProfile & { error?: string }>(res);
          setUser(res.ok ? (data as UserProfile) : null);
        } catch {
          setUser(null);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    const data = await readJson<{ error?: string } & UserProfile>(res);
    if (!res.ok) throw new Error((data as { error?: string }).error || 'Login failed');
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const apiFetch = useCallback(
    (url: string, options?: RequestInit) =>
      fetch(url, { ...options, credentials: 'include' }),
    []
  );

  return { user, loading, login, logout, apiFetch };
}
