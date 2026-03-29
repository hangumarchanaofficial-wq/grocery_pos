'use client';

import { Moon, SunMedium } from 'lucide-react';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'grocerypos-theme';

export default function ThemeToggle() {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    useEffect(() => {
        const savedTheme = window.localStorage.getItem(STORAGE_KEY);
        const nextTheme = savedTheme === 'light' ? 'light' : 'dark';
        document.documentElement.classList.toggle('light', nextTheme === 'light');
        document.documentElement.classList.toggle('dark', nextTheme === 'dark');
        setTheme(nextTheme);
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.classList.toggle('light', nextTheme === 'light');
        document.documentElement.classList.toggle('dark', nextTheme === 'dark');
        window.localStorage.setItem(STORAGE_KEY, nextTheme);
        setTheme(nextTheme);
    };

    return (
        <button
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? <SunMedium size={16} /> : <Moon size={16} />}
            <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
        </button>
    );
}
