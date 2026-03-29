// ============================================================
// Auth Hook — Manages login state, token storage, API calls
// ============================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    DEV_AUTH_BYPASS_ENABLED,
    DEV_AUTH_BYPASS_TOKEN,
    DEV_AUTH_BYPASS_CLIENT_USER,
    DEV_AUTH_BYPASS_USER,
} from '@/lib/auth';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'OWNER' | 'MANAGER' | 'CASHIER';
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Load token from localStorage on mount
    useEffect(() => {
        const savedToken = localStorage.getItem('pos_token');
        const savedUser = localStorage.getItem('pos_user');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        } else if (DEV_AUTH_BYPASS_ENABLED) {
            localStorage.setItem('pos_token', DEV_AUTH_BYPASS_TOKEN);
            localStorage.setItem('pos_user', JSON.stringify(DEV_AUTH_BYPASS_CLIENT_USER));
            setToken(DEV_AUTH_BYPASS_TOKEN);
            setUser(DEV_AUTH_BYPASS_CLIENT_USER);
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');

        localStorage.setItem('pos_token', data.token);
        localStorage.setItem('pos_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        router.push('/dashboard');
    }, [router]);

    const logout = useCallback(() => {
        localStorage.removeItem('pos_token');
        localStorage.removeItem('pos_user');
        setToken(null);
        setUser(null);
        router.push('/');
    }, [router]);

    // Helper: make authenticated API calls
    const apiFetch = useCallback(async (url: string, options: RequestInit = {}) => {
        const headers = new Headers(options.headers);
        if (token ?? DEV_AUTH_BYPASS_ENABLED) {
            headers.set('Authorization', `Bearer ${token ?? DEV_AUTH_BYPASS_TOKEN}`);
        }
        if (!headers.has('Content-Type') && options.method !== 'GET') {
            headers.set('Content-Type', 'application/json');
        }

        const res = await fetch(url, { ...options, headers });

        // Auto-logout on 401
        if (res.status === 401) {
            logout();
            throw new Error('Session expired');
        }

        return res;
    }, [token, logout]);

    return { user, token, loading, login, logout, apiFetch };
}
