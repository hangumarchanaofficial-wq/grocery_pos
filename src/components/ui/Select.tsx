// ============================================================
// Reusable Select dropdown
// ============================================================

'use client';

import { cn } from '@/lib/utils';
import { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

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
                <div className="relative">
                    <select
                        ref={ref}
                        className={cn(
                            'w-full appearance-none rounded-2xl border border-white/10 bg-[var(--surface-2)] px-4 py-3 pr-11 text-sm text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition-colors focus:border-emerald-400/40 focus:outline-none focus:ring-4 focus:ring-emerald-500/10',
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
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
                {error && <p className="mt-1 text-sm text-red-300">{error}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';
export default Select;
