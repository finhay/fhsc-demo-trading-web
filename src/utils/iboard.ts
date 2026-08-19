import type { RowData, SortingFn } from '@tanstack/react-table';

import {
    IBOARD_COLUMN_WIDTH_PX,
    INDEX_EXCHANGES,
    LEAF_COLUMNS,
    ODD_LOT_EXCHANGES,
    TYPE_EXCHANGES,
} from '@/constants/iboard';
import { StockPriceMessage } from '@/proto/stock';
import type {
    ColumnKey,
    ExchangeTab,
    IboardDisplayRow,
    IboardRealtimeCellBgMap,
    LeafColumn,
} from '@/types/pages/iboard';
import { getFlashBgFromColor, getPriceColor } from '@/utils/common';
import { formatNumberVN } from '@/utils/format';

export const getVisibleLeafColumns = (totalMetric: string): LeafColumn[] =>
    LEAF_COLUMNS.filter((column) => {
        if (column.key === 'totalVol') return totalMetric === 'vol';
        if (column.key === 'totalVal') return totalMetric === 'val';
        return true;
    });

export const getIboardTableWidthPx = (totalMetric: string): number =>
    getVisibleLeafColumns(totalMetric).reduce(
        (sum, col) => sum + IBOARD_COLUMN_WIDTH_PX[col.key],
        0,
    );

export const getIboardColumnWidthPercents = (
    totalMetric: string,
): { key: ColumnKey; percent: number }[] => {
    const cols = getVisibleLeafColumns(totalMetric);
    const sumPx = getIboardTableWidthPx(totalMetric);
    if (sumPx <= 0) return cols.map((c) => ({ key: c.key, percent: 0 }));
    return cols.map((c) => ({
        key: c.key,
        percent: (IBOARD_COLUMN_WIDTH_PX[c.key] / sumPx) * 100,
    }));
};

export const buildRealtimeTopicsByExchange = (symbols: string[], exchange: string) => {
    const baseTopic = ODD_LOT_EXCHANGES.has(exchange) ? 'odd-stock-price' : 'stock-price';
    const uniqueSymbols = Array.from(new Set(symbols.filter(Boolean)));
    return uniqueSymbols.map((symbol) => `/${baseTopic}/${symbol}`);
};

export const getQueryForExchange = (exchange: string): { name: string; value: string } => {
    if (INDEX_EXCHANGES.has(exchange)) {
        return { name: 'index', value: exchange };
    }
    if (TYPE_EXCHANGES.has(exchange)) {
        return { name: 'type', value: exchange };
    }
    if (ODD_LOT_EXCHANGES.has(exchange)) {
        const mappedExchange = exchange.replace('LO-LE-', '');
        return { name: 'exchange', value: mappedExchange };
    }
    return { name: 'exchange', value: exchange };
};

export const getExchangeTabClass = (active: boolean) =>
    `flex items-center px-4 py-1.5 bg-secondary rounded-full transition-colors ${
        active ? 'font-body-3-highlight text-highlight' : 'font-body-3 text-secondary'
    }`;

export const getDropdownActiveLabel = (
    tab: Extract<ExchangeTab, { type: 'dropdown' }>,
    exchange: string,
) => tab.options.find((option) => option.value === exchange)?.label ?? tab.defaultLabel;

export const isDropdownActive = (
    tab: Extract<ExchangeTab, { type: 'dropdown' }>,
    exchange: string,
) => tab.options.some((option) => option.value === exchange);

const isIboardEmptySortValue = (value: unknown): boolean =>
    value === null || value === undefined || value === '';

const parseIboardNumericSortValue = (value: unknown): number => {
    if (isIboardEmptySortValue(value)) return NaN;
    if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;

    const cleaned = String(value).trim().replace(/%/g, '').replace(/\s/g, '');
    const hasComma = cleaned.includes(',');
    const normalized = hasComma
        ? cleaned.replace(/\./g, '').replace(',', '.')
        : cleaned.replace(/,/g, '');
    const parsed = parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : NaN;
};

const compareIboardEmptyLast = (emptyA: boolean, emptyB: boolean, desc: boolean): number | null => {
    if (emptyA && emptyB) return 0;
    if (emptyA) return desc ? -1 : 1;
    if (emptyB) return desc ? 1 : -1;
    return null;
};

type SortDescGetter = (columnId: string) => boolean;

export const createNumericSortFn = <TData extends RowData>(
    getDesc: SortDescGetter,
): SortingFn<TData> => {
    return (rowA, rowB, columnId) => {
        const rawA = rowA.getValue(columnId);
        const rawB = rowB.getValue(columnId);
        const emptyA = isIboardEmptySortValue(rawA);
        const emptyB = isIboardEmptySortValue(rawB);
        const desc = getDesc(columnId);
        const emptyCompare = compareIboardEmptyLast(emptyA, emptyB, desc);
        if (emptyCompare !== null) return emptyCompare;

        const valueA = parseIboardNumericSortValue(rawA);
        const valueB = parseIboardNumericSortValue(rawB);
        if (!Number.isFinite(valueA) && !Number.isFinite(valueB)) return 0;
        if (!Number.isFinite(valueA)) return desc ? -1 : 1;
        if (!Number.isFinite(valueB)) return desc ? 1 : -1;
        return valueA - valueB;
    };
};

export const createAlphanumericSortFn = <TData extends RowData>(
    getDesc: SortDescGetter,
): SortingFn<TData> => {
    return (rowA, rowB, columnId) => {
        const rawA = rowA.getValue(columnId);
        const rawB = rowB.getValue(columnId);
        const emptyA = isIboardEmptySortValue(rawA);
        const emptyB = isIboardEmptySortValue(rawB);
        const desc = getDesc(columnId);
        const emptyCompare = compareIboardEmptyLast(emptyA, emptyB, desc);
        if (emptyCompare !== null) return emptyCompare;

        return String(rawA).localeCompare(String(rawB), 'vi', { numeric: true });
    };
};

const PRICE_DIV_1000_KEYS = new Set<ColumnKey>([
    'reference',
    'ceiling',
    'floor',
    'bid1',
    'bid2',
    'bid3',
    'offer1',
    'offer2',
    'offer3',
    'high',
    'medium',
    'low',
]);

export const renderIboardValue = (key: ColumnKey, value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === '') return '';
    if (typeof value === 'number') {
        if (key === 'changePercent') return `${formatNumberVN(value)}%`;
        if (key === 'change' || key === 'price' || PRICE_DIV_1000_KEYS.has(key))
            return formatNumberVN(value / 1000);
        if (key === 'totalVal') return formatNumberVN(value, { trimTrailingZeros: true });
        return formatNumberVN(value, { decimals: 0 });
    }
    return value;
};

export const normalizeIboardRow = (stock: StockPriceMessage): IboardDisplayRow => {
    const n = (v: number): number | null => v || null;
    const vol0 = !stock.vol;
    const total0 = !stock.totalVol;
    return {
        _raw: stock,
        symbol: stock.symbol,
        reference: stock.reference,
        ceiling: stock.ceiling,
        floor: stock.floor,
        totalVol: total0 ? null : stock.totalVol,
        totalVal: total0 ? null : stock.totalVal,
        high: total0 ? null : stock.high,
        medium: total0 ? null : stock.medium,
        low: total0 ? null : stock.low,
        bid3: stock.bid3Vol ? stock.bid3 : null,
        bid3Vol: n(stock.bid3Vol),
        bid2: stock.bid2Vol ? stock.bid2 : null,
        bid2Vol: n(stock.bid2Vol),
        bid1: stock.bid1Vol ? stock.bid1 : null,
        bid1Vol: n(stock.bid1Vol),
        price: vol0 ? null : stock.price,
        vol: vol0 ? null : stock.vol,
        change: vol0 ? null : stock.change,
        changePercent: vol0 ? null : stock.changePercent,
        offer1: stock.offer1Vol ? stock.offer1 : null,
        offer1Vol: n(stock.offer1Vol),
        offer2: stock.offer2Vol ? stock.offer2 : null,
        offer2Vol: n(stock.offer2Vol),
        offer3: stock.offer3Vol ? stock.offer3 : null,
        offer3Vol: n(stock.offer3Vol),
        foreignBought: n(stock.foreignBought),
        foreignSold: n(stock.foreignSold),
        foreignRemain: n(stock.foreignRemain),
    };
};

const getStockPriceColor = (price: number, stock: StockPriceMessage) =>
    getPriceColor(price, stock.reference, stock.floor, stock.ceiling);

export const getIboardCellColor = (key: ColumnKey, stock: StockPriceMessage) => {
    switch (key) {
        case 'symbol':
            return getStockPriceColor(stock.price, stock);
        case 'reference':
            return 'text-orange';
        case 'ceiling':
            return 'text-purple';
        case 'floor':
            return 'text-blue';
        case 'bid1':
        case 'bid1Vol':
            return getStockPriceColor(stock.bid1, stock);
        case 'bid2':
        case 'bid2Vol':
            return getStockPriceColor(stock.bid2, stock);
        case 'bid3':
        case 'bid3Vol':
            return getStockPriceColor(stock.bid3, stock);
        case 'offer1':
        case 'offer1Vol':
            return getStockPriceColor(stock.offer1, stock);
        case 'offer2':
        case 'offer2Vol':
            return getStockPriceColor(stock.offer2, stock);
        case 'offer3':
        case 'offer3Vol':
            return getStockPriceColor(stock.offer3, stock);
        case 'price':
        case 'vol':
        case 'change':
        case 'changePercent':
            return getStockPriceColor(stock.price, stock);
        case 'high':
            return getStockPriceColor(stock.high, stock);
        case 'medium':
            return getStockPriceColor(stock.medium, stock);
        case 'low':
            return getStockPriceColor(stock.low, stock);
        default:
            return 'text-primary';
    }
};

export const getIboardCellBg = (
    key: ColumnKey,
    stock: StockPriceMessage,
    realtimeCellBgMap: IboardRealtimeCellBgMap,
) => {
    if (key === 'price') return realtimeCellBgMap[stock.symbol]?.price ?? '';
    if (key === 'vol') return realtimeCellBgMap[stock.symbol]?.vol ?? '';
    if (key === 'totalVol') return realtimeCellBgMap[stock.symbol]?.totalVol ?? '';
    if (key === 'totalVal') return realtimeCellBgMap[stock.symbol]?.totalVal ?? '';
    if (key === 'change' || key === 'changePercent')
        return realtimeCellBgMap[stock.symbol]?.changePct ?? '';

    if (key === 'bid1') return realtimeCellBgMap[stock.symbol]?.bid1 ?? '';
    if (key === 'bid1Vol') return realtimeCellBgMap[stock.symbol]?.bid1Vol ?? '';
    if (key === 'bid2') return realtimeCellBgMap[stock.symbol]?.bid2 ?? '';
    if (key === 'bid2Vol') return realtimeCellBgMap[stock.symbol]?.bid2Vol ?? '';
    if (key === 'bid3') return realtimeCellBgMap[stock.symbol]?.bid3 ?? '';
    if (key === 'bid3Vol') return realtimeCellBgMap[stock.symbol]?.bid3Vol ?? '';

    if (key === 'offer1') return realtimeCellBgMap[stock.symbol]?.offer1 ?? '';
    if (key === 'offer1Vol') return realtimeCellBgMap[stock.symbol]?.offer1Vol ?? '';
    if (key === 'offer2') return realtimeCellBgMap[stock.symbol]?.offer2 ?? '';
    if (key === 'offer2Vol') return realtimeCellBgMap[stock.symbol]?.offer2Vol ?? '';
    if (key === 'offer3') return realtimeCellBgMap[stock.symbol]?.offer3 ?? '';
    if (key === 'offer3Vol') return realtimeCellBgMap[stock.symbol]?.offer3Vol ?? '';

    if (key === 'foreignBought') return realtimeCellBgMap[stock.symbol]?.foreignBought ?? '';
    if (key === 'foreignSold') return realtimeCellBgMap[stock.symbol]?.foreignSold ?? '';

    return '';
};

const mergeIboardRowCellBg = (
    target: StockPriceMessage,
    update: StockPriceMessage,
): Partial<Record<string, string>> => {
    const nextCellBgForSymbol: Partial<Record<string, string>> = {};
    const merged = { ...target, ...update } as StockPriceMessage;

    const bgFromKey = (key: ColumnKey) => getFlashBgFromColor(getIboardCellColor(key, merged));

    if (update.price !== undefined && update.price !== target.price) {
        nextCellBgForSymbol.price = bgFromKey('price');
    }
    if (update.vol !== undefined && update.vol !== target.vol) {
        nextCellBgForSymbol.vol = bgFromKey('vol');
    }
    if (update.change !== undefined && update.change !== target.change) {
        nextCellBgForSymbol.changePct = bgFromKey('change');
    }
    if (update.totalVol !== undefined && update.totalVol !== target.totalVol) {
        nextCellBgForSymbol.totalVol = 'bg-orange/70';
    }
    if (update.totalVal !== undefined && update.totalVal !== target.totalVal) {
        nextCellBgForSymbol.totalVal = 'bg-orange/70';
    }

    if (update.bid1 !== undefined && update.bid1 !== target.bid1) {
        nextCellBgForSymbol.bid1 = bgFromKey('bid1');
    }
    if (update.bid1Vol !== undefined && update.bid1Vol !== target.bid1Vol) {
        nextCellBgForSymbol.bid1Vol = bgFromKey('bid1Vol');
    }
    if (update.bid2 !== undefined && update.bid2 !== target.bid2) {
        nextCellBgForSymbol.bid2 = bgFromKey('bid2');
    }
    if (update.bid2Vol !== undefined && update.bid2Vol !== target.bid2Vol) {
        nextCellBgForSymbol.bid2Vol = bgFromKey('bid2Vol');
    }
    if (update.bid3 !== undefined && update.bid3 !== target.bid3) {
        nextCellBgForSymbol.bid3 = bgFromKey('bid3');
    }
    if (update.bid3Vol !== undefined && update.bid3Vol !== target.bid3Vol) {
        nextCellBgForSymbol.bid3Vol = bgFromKey('bid3Vol');
    }

    if (update.offer1 !== undefined && update.offer1 !== target.offer1) {
        nextCellBgForSymbol.offer1 = bgFromKey('offer1');
    }
    if (update.offer1Vol !== undefined && update.offer1Vol !== target.offer1Vol) {
        nextCellBgForSymbol.offer1Vol = bgFromKey('offer1Vol');
    }
    if (update.offer2 !== undefined && update.offer2 !== target.offer2) {
        nextCellBgForSymbol.offer2 = bgFromKey('offer2');
    }
    if (update.offer2Vol !== undefined && update.offer2Vol !== target.offer2Vol) {
        nextCellBgForSymbol.offer2Vol = bgFromKey('offer2Vol');
    }
    if (update.offer3 !== undefined && update.offer3 !== target.offer3) {
        nextCellBgForSymbol.offer3 = bgFromKey('offer3');
    }
    if (update.offer3Vol !== undefined && update.offer3Vol !== target.offer3Vol) {
        nextCellBgForSymbol.offer3Vol = bgFromKey('offer3Vol');
    }

    if (update.foreignBought !== undefined && update.foreignBought !== target.foreignBought) {
        nextCellBgForSymbol.foreignBought = 'bg-orange/70';
    }
    if (update.foreignSold !== undefined && update.foreignSold !== target.foreignSold) {
        nextCellBgForSymbol.foreignSold = 'bg-orange/70';
    }

    return nextCellBgForSymbol;
};

export const applyIboardMqttBatch = (
    prevStocks: StockPriceMessage[],
    batch: Map<string, StockPriceMessage>,
): {
    nextStocks: StockPriceMessage[];
    bgMerge: IboardRealtimeCellBgMap;
    timerSpecs: { symbol: string; field: string }[];
} => {
    const timerSpecs: { symbol: string; field: string }[] = [];
    const bgMerge: IboardRealtimeCellBgMap = {};
    let working = prevStocks;

    batch.forEach((update, symbol) => {
        const target = working.find((s) => s.symbol === symbol);
        if (!target) return;

        const cellBg = mergeIboardRowCellBg(target, update);
        if (Object.keys(cellBg).length > 0) {
            bgMerge[symbol] = { ...(bgMerge[symbol] ?? {}), ...cellBg };
            for (const field of Object.keys(cellBg)) {
                timerSpecs.push({ symbol, field });
            }
        }
        working = working.map((stock) =>
            stock.symbol === symbol ? { ...stock, ...update } : stock,
        );
    });

    return { nextStocks: working, bgMerge, timerSpecs };
};
