// ============================================================
// Card — Uses new glass panel system
// ============================================================

import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'strong';
}

export default function Card({
  className,
  padding = 'md',
  variant = 'default',
  children,
  ...props
}: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'rounded-[24px]',
        variant === 'strong' ? 'glass-strong' : 'glass',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
