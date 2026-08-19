import { useEffect, useRef, useState } from 'react';

import { createPortal } from 'react-dom';
import { FaCheck, FaCircleExclamation, FaXmark } from 'react-icons/fa6';

import { ToastItem as ToastItemType, ToastType, useToast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';

const CONFIG: Record<
    ToastType,
    {
        bg: string;
        border: string;
        iconBg: string;
        progressBar: string;
        Icon: React.ElementType;
    }
> = {
    success: {
        bg: 'bg-success',
        border: 'border-highlight',
        iconBg: 'bg-highlight',
        progressBar: 'bg-highlight',
        Icon: FaCheck,
    },
    error: {
        bg: 'bg-error',
        border: 'border-red',
        iconBg: 'bg-red',
        progressBar: 'bg-red',
        Icon: FaXmark,
    },
    warning: {
        bg: 'bg-warning',
        border: 'border-yellow',
        iconBg: 'bg-yellow',
        progressBar: 'bg-yellow',
        Icon: FaCircleExclamation,
    },
};

export function ToastItem({ toast }: { toast: ToastItemType }) {
    const trans = useTranslate();
    const { remove } = useToast();
    const duration = toast.duration ?? 4000;

    const [visible, setVisible] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const [progress, setProgress] = useState(100);

    const remainingRef = useRef(duration);
    const startTimeRef = useRef(0);
    const rafRef = useRef<number>(0);
    const pausedRef = useRef(false);

    const dismiss = () => {
        setLeaving(true);
        setTimeout(() => remove(toast.id), 300);
    };

    const tick = (ts: number) => {
        if (pausedRef.current) return;
        if (!startTimeRef.current) startTimeRef.current = ts;
        const elapsed = ts - startTimeRef.current;
        const pct = Math.max(0, 100 - (elapsed / remainingRef.current) * 100);
        setProgress(pct);
        if (pct <= 0) {
            dismiss();
            return;
        }
        rafRef.current = requestAnimationFrame(tick);
    };

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
        if (duration === -1) return;
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, []);

    const onMouseEnter = () => {
        if (duration === -1) return;
        pausedRef.current = true;
        cancelAnimationFrame(rafRef.current);
        const elapsed = performance.now() - startTimeRef.current;
        remainingRef.current = Math.max(0, remainingRef.current - elapsed);
        startTimeRef.current = 0;
    };

    const onMouseLeave = () => {
        if (duration === -1) return;
        pausedRef.current = false;
        rafRef.current = requestAnimationFrame(tick);
    };

    const { bg, border, iconBg, progressBar, Icon } = CONFIG[toast.type];

    return (
        <div
            role="alert"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={[
                'relative flex w-80 max-w-96 items-center justify-between',
                'gap-2 overflow-hidden rounded-xl border p-3 backdrop-blur-sm shadow-lg',
                bg,
                border,
                'transition-all duration-300 ease-out',
                visible && !leaving ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0',
            ].join(' ')}
        >
            <div className="flex items-center gap-2">
                <span
                    className={[
                        'flex shrink-0 items-center justify-center rounded-full p-1.5',
                        iconBg,
                    ].join(' ')}
                >
                    <Icon size={14} className="text-primary" />
                </span>

                <div className="flex flex-col">
                    <p className="font-body-2-highlight text-primary">{toast.message}</p>
                    {toast.description && (
                        <p className="font-body-3 text-primary">{toast.description}</p>
                    )}
                </div>
            </div>
            <button
                onClick={dismiss}
                aria-label={trans.toast.close}
                className="shrink-0 text-primary"
            >
                <FaXmark size={14} className="text-primary" />
            </button>

            {duration !== -1 && (
                <div className="absolute bottom-0 left-0 h-1 w-full bg-white/10">
                    <div
                        className={['h-full transition-none', progressBar].join(' ')}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );
}

export function ToastContainer() {
    const { toasts } = useToast();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <div className="pointer-events-none fixed right-4 top-4 z-[1000000] flex flex-col items-end gap-2">
            {toasts.map((t) => (
                <div key={t.id} className="pointer-events-auto">
                    <ToastItem toast={t} />
                </div>
            ))}
        </div>,
        document.body,
    );
}
