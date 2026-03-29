// ============================================================
// Modal component with backdrop
// ============================================================

'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
    // Close on Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (open) document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onClose]);

    // Prevent body scroll when open
    useEffect(() => {
        if (open) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    if (!open) return null;

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={onClose} />

            {/* Modal content */}
            <div className={cn(
                'glass-panel-strong relative w-full rounded-[30px] animate-in fade-in zoom-in-95 duration-200',
                sizes[size]
            )}>
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between border-b border-white/8 p-6">
                        <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
                        <button
                            onClick={onClose}
                            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-white/6 hover:text-slate-100"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}
