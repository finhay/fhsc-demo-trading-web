import dayjs from 'dayjs';

import {
    ICEBERG_TERMINAL_STATUSES,
    ORDER_TYPE,
    SPECIAL_FUND_SYMBOLS,
    STOCK_TYPE,
    TRADE_UI_CONFIG,
    TWAP_LO_SLICE_PENDING_STATUSES,
    TWAP_LO_TERMINAL_STATUSES,
} from '@/constants/trading';
import type { OrderLotSplit, PlacementOrder } from '@/types/pages/trading';
import type {
    CreateTwapLoOrderRequest,
    PendingTwapLoOrder,
    TwapLoOrderDto,
    TwapLoSliceDto,
} from '@/types/trade/twap-lo';
import { formatBoardPrice, formatNumberVN } from '@/utils/format';

export const getTradingFieldBg = (
    hasValue: boolean,
    side?: 'buy' | 'sell',
    disabled?: boolean,
): string => {
    if (disabled) return 'bg-tertiary opacity-50';
    if (!hasValue) return 'bg-tertiary';
    if (side === 'buy') return 'bg-green/20';
    if (side === 'sell') return 'bg-red/20';
    return 'bg-tertiary';
};

export const getActiveColor = (active: boolean | undefined) => {
    if (active === true) return 'bg-green';
    if (active === false) return 'bg-red';
    return 'bg-highlight';
};

export const canCancelIcebergOrder = (status: string) => !ICEBERG_TERMINAL_STATUSES.has(status);

export const mapIcebergOrderToOrder = (order: {
    order_id: number;
    symbol: string;
    order_side: string;
    total_quantity: number;
    limit_price: number;
    order_status: string;
    matched_quantity: number;
    matched_price?: number;
}) => ({
    orderId: String(order.order_id),
    symbol: order.symbol,
    filledQty: formatNumberVN(order.matched_quantity ?? 0, { decimals: 0 }),
    totalQty: formatNumberVN(order.total_quantity ?? 0, { decimals: 0 }),
    filledPrice: (order.matched_price ?? 0) > 0 ? formatBoardPrice(order.matched_price ?? 0) : '',
    placedPrice: formatBoardPrice(order.limit_price ?? 0),
    marketPrice: null,
    rawPrice: order.limit_price ?? 0,
    rawQty: order.total_quantity ?? 0,
    type: order.order_side === 'BUY' ? ORDER_TYPE.BUY : ORDER_TYPE.SELL,
    status: order.order_status ?? '',
    allowCancel: canCancelIcebergOrder(order.order_status ?? ''),
    allowAmend: false,
    orderConditionType: null,
    priceType: 'LO',
});

export const canCancelTwapLoOrder = (status: string) => !TWAP_LO_TERMINAL_STATUSES.has(status);

export const getTwapLoMatchedAvgPrice = (order: TwapLoOrderDto): number => {
    const slices = order.slices ?? [];
    let matchedQty = 0;
    let matchedValue = 0;

    for (const slice of slices) {
        const qty = slice.matchedQty ?? 0;
        const price = slice.matchedPrice ?? 0;
        if (qty <= 0 || price <= 0) continue;
        matchedQty += qty;
        matchedValue += qty * price;
    }

    return matchedQty > 0 ? matchedValue / matchedQty : 0;
};

export const mapTwapLoOrderToOrder = (order: TwapLoOrderDto) => {
    const matchedAvgPrice = getTwapLoMatchedAvgPrice(order);

    return {
        orderId: String(order.id ?? ''),
        symbol: order.symbol,
        filledQty: formatNumberVN(order.matchedQty ?? 0, { decimals: 0 }),
        totalQty: formatNumberVN(order.orderQty ?? 0, { decimals: 0 }),
        filledPrice: matchedAvgPrice > 0 ? formatBoardPrice(matchedAvgPrice) : '',
        placedPrice: formatBoardPrice(order.price ?? 0),
        marketPrice: null,
        rawPrice: order.price ?? 0,
        rawQty: order.orderQty ?? 0,
        type: order.side === 'BUY' ? ORDER_TYPE.BUY : ORDER_TYPE.SELL,
        status: order.status ?? '',
        allowCancel: canCancelTwapLoOrder(order.status ?? ''),
        allowAmend: false,
        orderConditionType: null,
        priceType: 'LO',
        twapLoOrder: order,
    };
};

export const buildTwapLoRequest = (
    symbol: string,
    order: PendingTwapLoOrder,
): CreateTwapLoOrderRequest => ({
    side: order.side,
    symbol,
    q_lo: order.quantity,
    limit_price: order.price,
    urgency: order.urgency,
    ...(order.startAt ? { start_at: dayjs(order.startAt).format('YYYY-MM-DDTHH:mm:ss') } : {}),
});

export const getTwapLoSliceQty = (slice: TwapLoSliceDto) => slice.orderQty ?? slice.plannedQty ?? 0;

export const isPendingTwapLoSlice = (slice: TwapLoSliceDto) => {
    const status = slice.status;
    return !status || TWAP_LO_SLICE_PENDING_STATUSES.has(status);
};

export const parsePrice = (raw: string): number => {
    if (!raw.trim()) return 0;
    const cleaned = raw.replace(/\./g, '').replace(',', '.');
    const val = parseFloat(cleaned);
    return isNaN(val) || val <= 0 ? 0 : Math.round(val * 1000);
};

export const getStepSize = (
    rawPrice: number,
    exchange: string,
    stockType: string,
    symbol: string,
): number => {
    const isSpecial = SPECIAL_FUND_SYMBOLS.includes(symbol);
    if (exchange === 'HCX') return 1;

    if (exchange === 'HOSE') {
        if (stockType === STOCK_TYPE.STOCK) {
            if (rawPrice < 10000) return 10;
            if (rawPrice < 50000) return 50;
            return 100;
        }
        if (stockType === STOCK_TYPE.FUND_CERTIFICATE) {
            if (isSpecial) return 10;
            if (rawPrice < 10000) return 10;
            if (rawPrice < 50000) return 50;
            return 100;
        }
        if (stockType === STOCK_TYPE.BOND) return 1;
        return 10;
    }

    if (stockType === STOCK_TYPE.STOCK) return 100;
    if (stockType === STOCK_TYPE.BOND) return 1;
    if (stockType === STOCK_TYPE.WARRANT) return 10;
    if (stockType === STOCK_TYPE.ETF) return 10;
    if (stockType === STOCK_TYPE.FUND_CERTIFICATE) return isSpecial ? 10 : 100;
    return 10;
};

export const makePriceValidator =
    (
        floor: number,
        ceiling: number,
        checkBounds: boolean,
        exchange: string,
        stockType: string,
        symbol: string,
    ) =>
    ({ value }: { value: string }) => {
        if (!value.trim()) return undefined;
        const price = parsePrice(value);
        if (price <= 0) return 'Giá không hợp lệ';
        if (checkBounds && floor > 0 && price < floor)
            return `Giá thấp hơn giá sàn (${formatBoardPrice(floor)})`;
        if (checkBounds && ceiling > 0 && price > ceiling)
            return `Giá cao hơn giá trần (${formatBoardPrice(ceiling)})`;
        if (checkBounds) {
            const step = getStepSize(price, exchange, stockType, symbol);
            if (step > 1 && price % step !== 0) {
                return `Bước giá không hợp lệ (bước ${formatBoardPrice(step)})`;
            }
        }
        return undefined;
    };

export const parseQuantity = (raw: string): number => {
    if (!raw.trim()) return 0;
    const cleaned = raw.replace(/\./g, '');
    const val = parseInt(cleaned, 10);
    return isNaN(val) || val < 0 ? 0 : val;
};

export const makeBuyQtyValidator =
    (maxQtty: number) =>
    ({ value }: { value: string }) => {
        if (!value.trim()) return undefined;
        const qty = parseQuantity(value);
        if (qty <= 0) return 'Khối lượng phải lớn hơn 0';
        if (maxQtty > 0 && qty > maxQtty)
            return `Vượt KL mua tối đa (${formatNumberVN(maxQtty, { decimals: 0 })})`;
        return undefined;
    };

export const makeTradePanelQtyValidator =
    (
        maxQtyValidator: (input: { value: string }) => string | undefined,
        isLOOrder: boolean,
        divisibleError: string,
    ) =>
    ({ value }: { value: string }) => {
        const qty = parseQuantity(value);
        const maxErr = maxQtyValidator({ value });
        if (maxErr) return maxErr;
        if (!isLOOrder && qty > 0 && qty % 100 !== 0) {
            return divisibleError;
        }
        return undefined;
    };

export const makeSellQtyValidator =
    (maxSell: number) =>
    ({ value }: { value: string }) => {
        if (!value.trim()) return undefined;
        const qty = parseQuantity(value);
        if (qty <= 0) return 'Khối lượng phải lớn hơn 0';
        if (maxSell > 0 && qty > maxSell)
            return `Vượt KL bán tối đa (${formatNumberVN(maxSell, { decimals: 0 })})`;
        return undefined;
    };

const splitLotQty = (qty: number): OrderLotSplit => {
    const oddLotQty = qty >= 100 ? qty % 100 : qty;
    const evenLotQty = qty >= 100 ? qty - oddLotQty : 0;
    return { evenLotQty, oddLotQty };
};

export const buildOrderLotSplits = (
    qty: number,
    maxChunk = TRADE_UI_CONFIG.MAX_ORDER_QTY_PER_REQUEST,
): OrderLotSplit[] => {
    if (qty <= maxChunk) {
        return [splitLotQty(qty)];
    }

    const chunkQtys: number[] = [];
    let remaining = qty;
    while (remaining > maxChunk) {
        chunkQtys.push(maxChunk);
        remaining -= maxChunk;
    }
    if (remaining > 0) {
        chunkQtys.push(remaining);
    }

    return chunkQtys.map((chunkQty) => splitLotQty(chunkQty));
};

export const buildPlacementOrders = (orderLots: OrderLotSplit[]): PlacementOrder[] =>
    orderLots.flatMap((lot) => {
        const orders: PlacementOrder[] = [];
        if (lot.evenLotQty > 0) orders.push({ kind: 'even', qty: lot.evenLotQty });
        if (lot.oddLotQty > 0) orders.push({ kind: 'odd', qty: lot.oddLotQty });
        return orders;
    });

export const calcQtyFromPercentage = (pct: number, max: number): number => {
    return pct >= 100 ? max : Math.round((pct / 100) * max);
};

export const stepIncreaseVolume = (volume: number) => {
    if (volume % 100 === 0) {
        return 100;
    } else {
        return 1;
    }
};

export const stepDecreaseVolume = (volume: number) => {
    if (volume === 0) {
        return 0;
    } else if (volume % 100 === 0 && volume > 100) {
        return 100;
    } else {
        return 1;
    }
};
