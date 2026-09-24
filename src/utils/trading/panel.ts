import {
    ORDER_TYPE,
    SPECIAL_FUND_SYMBOLS,
    STOCK_TYPE,
    TRADE_LITERAL,
    TRADE_UI_CONFIG,
} from '@/constants/trading';
import type { StockPrice } from '@/types/datafeed/stock-info';
import type { OrderLotSplit, PlacementOrder } from '@/types/pages/trading';
import { formatBoardPrice, formatNumberVN } from '@/utils/format';

export const getTradingFieldBg = (
    hasValue: boolean,
    side?: 'buy' | 'sell',
    disabled?: boolean,
): string => {
    if (disabled) return 'base-tertiary opacity-50';
    if (!hasValue) return 'base-tertiary';
    if (side === 'buy') return 'bg-green/20';
    if (side === 'sell') return 'bg-red/20';
    return 'base-tertiary';
};

export const getActiveColor = (active: boolean | undefined) => {
    if (active === true) return 'base-green';
    if (active === false) return 'base-red';
    return 'base-highlight';
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

/**
 * Bảng giá realtime có mã chỉ trả đủ 3 mức, có mã chỉ có 1 mức, và thứ tự mức giá
 * (`*Price1` hay `*Price3` là mức sát giá khớp) không thống nhất giữa các nguồn.
 * Vì vậy lấy mức tốt nhất theo giá trị: mua cao nhất / bán thấp nhất trong 3 mức.
 */
export const getBestBidPrice = (stock?: StockPrice | null) => {
    const prices = [stock?.buyPrice1, stock?.buyPrice2, stock?.buyPrice3].filter(
        (price): price is number => !!price && price > 0,
    );
    return prices.length > 0 ? Math.max(...prices) : 0;
};

export const getBestAskPrice = (stock?: StockPrice | null) => {
    const prices = [stock?.sellPrice1, stock?.sellPrice2, stock?.sellPrice3].filter(
        (price): price is number => !!price && price > 0,
    );
    return prices.length > 0 ? Math.min(...prices) : 0;
};

/**
 * Lệnh MUA lấy giá bán tốt nhất, lệnh BÁN lấy giá mua tốt nhất. Ngoài phiên khớp
 * lệnh liên tục bảng giá có thể trống, khi đó lùi về giá khớp rồi tới giá tham chiếu
 * để không bao giờ gửi giá 0 lên API sức mua.
 */
export const getBestPriceForSide = (stock: StockPrice | null | undefined, side: string) => {
    const best = side === TRADE_LITERAL.BUY ? getBestAskPrice(stock) : getBestBidPrice(stock);
    return best || stock?.price || stock?.reference || 0;
};
