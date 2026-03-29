import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = 'default', children, className }: BadgeProps) {
  const variants = {
    default: 'bg-white/[0.06] text-slate-300 ring-1 ring-white/[0.06]',
    success: 'bg-emerald-500/8 text-emerald-400 ring-1 ring-emerald-400/15',
    warning: 'bg-amber-500/8 text-amber-400 ring-1 ring-amber-400/15',
    danger:  'bg-red-500/8 text-red-400 ring-1 ring-red-400/15',
    info:    'bg-sky-500/8 text-sky-400 ring-1 ring-sky-400/15',
  };

  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
