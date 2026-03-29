// ============================================================
// Reusable Input component
// ============================================================

'use client';

import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, icon, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            'w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-400/40 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-colors',
                            icon && 'pl-10',
                            error && 'border-red-400/50 focus:border-red-400 focus:ring-red-500/10',
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && <p className="mt-1 text-sm text-red-300">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
export default Input;
