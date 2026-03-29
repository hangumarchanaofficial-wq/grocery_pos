// ============================================================
// Reusable Card component
// ============================================================

import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({ className, padding = 'md', children, ...props }: CardProps) {
    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div
            className={cn(
                'glass-panel rounded-[28px] text-slate-100',
                paddings[padding],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
