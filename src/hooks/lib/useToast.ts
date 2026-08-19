import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning';

export interface ToastItem {
    id: string;
    type: ToastType;
    message: string;
    description?: string;
    duration?: number;
}

type Listener = (toasts: ToastItem[]) => void;

let _toasts: ToastItem[] = [];
const _listeners = new Set<Listener>();

const notify = () => _listeners.forEach((fn) => fn([..._toasts]));

let _seq = 0;

const genId = (): string => {
    _seq += 1;
    return `toast-${_seq}-${Math.random().toString(36).slice(2, 10)}`;
};

const add = (item: Omit<ToastItem, 'id'>): string => {
    const id = genId();
    _toasts = [..._toasts, { ...item, id }];
    notify();
    return id;
};

const remove = (id: string) => {
    _toasts = _toasts.filter((t) => t.id !== id);
    notify();
};

export const toast = {
    success: (message: string, opts?: Pick<ToastItem, 'duration' | 'description'>) =>
        add({ type: 'success', message, ...opts }),
    error: (message: string, opts?: Pick<ToastItem, 'duration' | 'description'>) =>
        add({ type: 'error', message, ...opts }),
    warning: (message: string, opts?: Pick<ToastItem, 'duration' | 'description'>) =>
        add({ type: 'warning', message, ...opts }),
};

export const useToast = () => {
    const [toasts, setToasts] = useState<ToastItem[]>(_toasts);

    useEffect(() => {
        _listeners.add(setToasts);
        return () => {
            _listeners.delete(setToasts);
        };
    }, []);

    return { toasts, remove };
};
