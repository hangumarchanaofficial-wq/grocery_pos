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
    let cancelled = false;

    async function syncProfileFromServer() {
      if (cancelled) return;
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        const data = await readJson<UserProfile & { error?: string }>(res);
        if (!cancelled) setUser(res.ok ? (data as UserProfile) : null);
      } catch {
        if (!cancelled) setUser(null);
      }
    }

    // Do not call getUser() here — it races with onAuthStateChange (same cookie/Web Locks
    // storage) and throws AbortError / lock errors. INITIAL_SESSION carries the current session.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return;

      if (event === 'INITIAL_SESSION') {
        if (session?.user) {
          await syncProfileFromServer();
        } else {
          setUser(null);
        }
        setLoading(false);
        return;
      }

      if (event === 'SIGNED_IN') {
        await syncProfileFromServer();
        return;
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
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
