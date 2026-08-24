import { PAPER_LOT_SIZE } from '@/constants/paper-trading';
import { ORDER_TYPE, SPECIAL_FUND_SYMBOLS, STOCK_TYPE } from '@/constants/trading';
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
        enforceEvenLot: boolean,
        divisibleError: string,
    ) =>
    ({ value }: { value: string }) => {
        const qty = parseQuantity(value);
        const maxErr = maxQtyValidator({ value });
        if (maxErr) return maxErr;
        if (enforceEvenLot && qty > 0 && qty % PAPER_LOT_SIZE !== 0) {
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
