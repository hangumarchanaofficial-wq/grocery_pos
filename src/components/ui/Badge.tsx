// ============================================================
// Badge / Tag component
// ============================================================

import { cn } from '@/lib/utils';

interface BadgeProps {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    children: React.ReactNode;
    className?: string;
}

export default function Badge({ variant = 'default', children, className }: BadgeProps) {
    const variants = {
        default: 'bg-white/8 text-slate-200 border border-white/10',
        success: 'bg-emerald-500/12 text-emerald-300 border border-emerald-400/20',
        warning: 'bg-amber-500/12 text-amber-300 border border-amber-400/20',
        danger: 'bg-red-500/12 text-red-300 border border-red-400/20',
        info: 'bg-sky-500/12 text-sky-300 border border-sky-400/20',
    };

    return (
        <span className={cn(
            'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]',
            variants[variant],
            className
        )}>
      {children}
    </span>
    );
}
