import { ORDER_STATUS, ORDER_TYPE } from '@/constants/trading';
import type { OrderStatusTone, TradeOrderBookRow } from '@/types/pages/trading';

export const getOrderStatusColor = (tone: OrderStatusTone): string => {
    if (tone === 'success') return 'text-green';
    if (tone === 'error') return 'text-red';
    return 'text-secondary';
};

export const formatPlacedPriceCell = (
    placedPriceFormatted: string,
    priceType?: string | null,
): string => {
    const pt = (priceType ?? '').trim().toUpperCase();
    if (!pt || pt === 'LO') return placedPriceFormatted;
    return pt;
};

export const buildActiveOrderPriceMarkers = (
    orders: TradeOrderBookRow[],
    symbol: string,
): { buyPrices: Set<number>; sellPrices: Set<number> } => {
    const ACTIVE_MARKER_STATUSES = new Set(['2', '4', 'SENT', 'MATCHED', ORDER_STATUS.PENDING]);
    const buyPrices = new Set<number>();
    const sellPrices = new Set<number>();
    if (!symbol) return { buyPrices, sellPrices };

    for (const order of orders) {
        if (order.symbol !== symbol) continue;
        // Ưu tiên cờ suy ở FE — status của simulator không nằm trong bộ mã cũ.
        const isActive = order.isActive ?? ACTIVE_MARKER_STATUSES.has(order.status);
        if (!isActive) continue;
        if (order.rawPrice <= 0) continue;
        if (order.type === ORDER_TYPE.BUY) buyPrices.add(order.rawPrice);
        else if (order.type === ORDER_TYPE.SELL) sellPrices.add(order.rawPrice);
    }
    return { buyPrices, sellPrices };
};
