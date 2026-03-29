// ============================================================
// Reusable Select dropdown
// ============================================================

'use client';

import { cn } from '@/lib/utils';
import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, options, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    className={cn(
                        'w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-100 focus:border-brand-400/40 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-colors',
                        error && 'border-red-400/50',
                        className
                    )}
                    {...props}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {error && <p className="mt-1 text-sm text-red-300">{error}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';
export default Select;
