'use client';

import { TradePlaceOrderPanel } from '@/components/giao-dich/verification/TradePlaceOrderPanel';
import type { PendingOrder } from '@/types/pages/trading';

type Props = {
    isPlaceOrderVisible: boolean;
    symbol: string;
    pendingOrder: PendingOrder | null;
    onPlaceOrderClose: () => void;
    onPlaceOrderSuccess: () => void;
};

export const TradePanelOverlays = ({
    isPlaceOrderVisible,
    symbol,
    pendingOrder,
    onPlaceOrderClose,
    onPlaceOrderSuccess,
}: Props) => {
    if (!isPlaceOrderVisible || !pendingOrder) return null;

    return (
        <TradePlaceOrderPanel
            symbol={symbol}
            pendingOrder={pendingOrder}
            onClose={onPlaceOrderClose}
            onSuccess={onPlaceOrderSuccess}
        />
    );
};
