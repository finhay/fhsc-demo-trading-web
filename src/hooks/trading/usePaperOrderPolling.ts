'use client';

import { useEffect } from 'react';

import { PAPER_ORDER_BOOK_POLL_MS } from '@/constants/paper-trading';
import { useTradingStore } from '@/stores/trading/useTradingStore';

/**
 * Simulator không publish MQTT khi lệnh khớp (topic notifications hiện tại thuộc hệ thống thật
 * và gắn với tài khoản thật), nên sổ lệnh phải tự poll. Bỏ qua tick khi tab đang ẩn.
 */
export const usePaperOrderPolling = (accountId: string, intervalMs = PAPER_ORDER_BOOK_POLL_MS) => {
    const fetchOrders = useTradingStore((state) => state.fetchOrders);

    useEffect(() => {
        if (!accountId) return;

        const id = setInterval(() => {
            if (document.visibilityState !== 'visible') return;
            fetchOrders(accountId, { silent: true });
        }, intervalMs);

        return () => clearInterval(id);
    }, [accountId, intervalMs, fetchOrders]);
};
