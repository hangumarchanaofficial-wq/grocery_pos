// ============================================================
// Reusable Button component with variants
// ============================================================

'use client';

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]';

        const variants = {
            primary: 'bg-brand-500 text-white hover:bg-brand-400 focus:ring-brand-400 shadow-[0_16px_40px_rgba(34,197,94,0.22)]',
            secondary: 'bg-white/6 text-slate-100 border border-white/10 hover:bg-white/10 focus:ring-white/20',
            danger: 'bg-red-500/90 text-white hover:bg-red-400 focus:ring-red-400 shadow-[0_16px_34px_rgba(239,68,68,0.22)]',
            ghost: 'text-slate-300 hover:bg-white/6 hover:text-white focus:ring-white/20',
            outline: 'border border-brand-400/30 text-brand-300 hover:bg-brand-500/10 hover:text-brand-200 focus:ring-brand-400/30',
        };

        const sizes = {
            sm: 'px-3.5 py-2 text-sm',
            md: 'px-4.5 py-2.5 text-sm',
            lg: 'px-6 py-3.5 text-base',
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || loading}
                {...props}
            >
                {loading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
export default Button;
