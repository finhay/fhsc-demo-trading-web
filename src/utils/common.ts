import FingerprintJS from '@fingerprintjs/fingerprintjs';

import {
    ERROR_CODES,
    INDEX_LIST,
    MARKET_TITLE_DISPLAY_NAME_MAP,
    NETWORK_HEALTH,
    SUB_ACCOUNT_PERMISSION,
} from '@/constants/common';
import { StockPriceMessage } from '@/proto/stock';
import { getDeviceId, setDeviceId } from '@/services/localStorage';
import type { SubAccount } from '@/types/accounts/profile';
import type { WatchlistStockItem } from '@/types/accounts/watchlist';
import type { BuildMarketPageTitleParams } from '@/types/pages/common';
import { formatNumberVN } from '@/utils/format';

let cachedDeviceId: string | null = null;

export const getCurrentLocation = () => {
    return typeof window !== 'undefined' ? window.location.href : '';
};

export const isSuccessApi = (error_code: string) => {
    return error_code === ERROR_CODES.SUCCESS;
};

export const getApiErrorMessage = (err: unknown, fallback: string): string => {
    const e = err as {
        message?: string;
        error_code?: string;
        response?: { data?: { message?: string } };
    };
    if (e?.response?.data?.message) return e.response.data.message;
    if (e?.error_code && e?.message) return e.message;
    return fallback;
};

export const hasSubAccountPermission = (
    account: SubAccount | null | undefined,
    permission: string,
): boolean => {
    const permissions = account?.permissions ?? [];
    return permissions.includes(SUB_ACCOUNT_PERMISSION.ALL) || permissions.includes(permission);
};

export const getPriceColor = (
    price: number,
    reference: number,
    floor: number,
    ceiling: number,
): string => {
    if (price === floor) {
        return 'text-blue';
    }

    if (price === ceiling) {
        return 'text-purple';
    }

    if (price === reference) {
        return 'text-orange';
    } else if (price < reference) {
        return 'text-red';
    } else if (price > reference) {
        return 'text-highlight';
    }

    return 'text-primary';
};

export const getNetColor = (value: number): string => {
    if (value > 0) return 'text-green';
    if (value < 0) return 'text-red';
    return 'text-primary';
};

export const getChangeColor = (change: number): string => {
    if (change > 0) return 'text-green';
    if (change < 0) return 'text-red';
    return 'text-orange';
};

export const getMarketPriceColor = (
    price: number,
    reference: number,
    floor: number,
    ceiling: number,
): string => {
    const color = getPriceColor(price, reference, floor, ceiling);
    return color === 'text-highlight' ? 'text-green' : color;
};

export const sortSearchResults = <T extends { symbol: string }>(
    keyword: string,
    results: T[],
): T[] => {
    if (!keyword.trim()) return results;

    const searchKey = keyword.toUpperCase().trim();

    return [...results].sort((a, b) => {
        const aSymbol = a.symbol.toUpperCase();
        const bSymbol = b.symbol.toUpperCase();

        const aStartsWith = aSymbol.startsWith(searchKey);
        const bStartsWith = bSymbol.startsWith(searchKey);

        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;

        const aIndex = aSymbol.indexOf(searchKey);
        const bIndex = bSymbol.indexOf(searchKey);

        if (aIndex !== bIndex) return aIndex - bIndex;

        if (aSymbol.length !== bSymbol.length) return aSymbol.length - bSymbol.length;

        return aSymbol.localeCompare(bSymbol);
    });
};

export const getSessionText = (sessionInExchange: string): string => {
    if (!sessionInExchange) return '';
    switch (sessionInExchange) {
        case 'LO':
            return 'Liên tục';
        case 'Break':
            return 'Tạm nghỉ';
        case 'ATC':
            return 'Phiên ATC';
        case 'ATO':
            return 'Phiên ATO';
        case 'PutThrough':
            return 'GDTT';
        case 'PLO':
            return 'PLO';
        default:
            return 'Đóng cửa';
    }
};

export const getFlashBgFromColor = (textColorClass: string): string => {
    if (textColorClass.includes('text-red')) return 'bg-red/70';
    if (textColorClass.includes('text-orange')) return 'bg-orange/70';
    if (textColorClass.includes('text-highlight')) return 'bg-highlight/70';
    if (textColorClass.includes('text-blue')) return 'bg-blue/70';
    if (textColorClass.includes('text-purple')) return 'bg-purple/70';
    return 'bg-orange/70';
};

export const buildMarketPageTitle = ({
    exchange,
    marketIndexes,
    pageSuffix,
    fallbackTitle,
    fallbackDisplayName = INDEX_LIST[0],
}: BuildMarketPageTitleParams): string => {
    const indexCode = MARKET_TITLE_DISPLAY_NAME_MAP[exchange] ?? INDEX_LIST[0];
    const displayName = MARKET_TITLE_DISPLAY_NAME_MAP[exchange] ?? fallbackDisplayName;
    const matchedIndex = (marketIndexes ?? []).find((item) => item?.index === indexCode);

    if (!matchedIndex) {
        return fallbackTitle;
    }

    const changePercent = Number(matchedIndex.changePercent ?? 0);
    const changePercentSign = changePercent > 0 ? '+' : changePercent < 0 ? '-' : '';

    return `${displayName} ${formatNumberVN(matchedIndex.indexValue)} ${changePercentSign}${formatNumberVN(Math.abs(changePercent))}% - ${pageSuffix}`;
};

type StockPriceMessageSource = {
    symbol: string;
    name: string;
    exchange: string;
    price: number;
    change: number | null;
    changePercent: number | null;
    reference: number;
    ceiling: number;
    floor: number;
    volume: number;
    totalVolume: number;
    totalValue: number;
    high: number;
    low: number;
    average: number;
    remainBid: number | null;
    remainAsk: number | null;
    foreignBought: number;
    foreignSold: number;
    foreignRemain: number;
    buyPrice1: number;
    buyPrice2: number;
    buyPrice3: number;
    sellPrice1: number;
    sellPrice2: number;
    sellPrice3: number;
    buyVol1: number;
    buyVol2: number;
    buyVol3: number;
    sellVol1: number;
    sellVol2: number;
    sellVol3: number;
};

export const toStockPriceMessage = (item: StockPriceMessageSource): StockPriceMessage => ({
    symbol: item.symbol,
    name: item.name,
    exchange: item.exchange,
    price: item.price ?? 0,
    change: item.change ?? 0,
    changePercent: item.changePercent ?? 0,
    reference: item.reference ?? 0,
    ceiling: item.ceiling ?? 0,
    floor: item.floor ?? 0,
    vol: item.volume ?? 0,
    totalVol: item.totalVolume ?? 0,
    totalVal: item.totalValue ?? 0,
    high: item.high ?? 0,
    low: item.low ?? 0,
    medium: item.average ?? 0,
    remainBid: item.remainBid ?? 0,
    remainAsk: item.remainAsk ?? 0,
    foreignBought: item.foreignBought ?? 0,
    foreignSold: item.foreignSold ?? 0,
    foreignRemain: item.foreignRemain ?? 0,
    bid1: item.buyPrice1 ?? 0,
    bid2: item.buyPrice2 ?? 0,
    bid3: item.buyPrice3 ?? 0,
    offer1: item.sellPrice1 ?? 0,
    offer2: item.sellPrice2 ?? 0,
    offer3: item.sellPrice3 ?? 0,
    bid1Vol: item.buyVol1 ?? 0,
    bid2Vol: item.buyVol2 ?? 0,
    bid3Vol: item.buyVol3 ?? 0,
    offer1Vol: item.sellVol1 ?? 0,
    offer2Vol: item.sellVol2 ?? 0,
    offer3Vol: item.sellVol3 ?? 0,
});

export const makeWatchlistItem = (
    partial: Partial<WatchlistStockItem> & { symbol: string },
): WatchlistStockItem => ({
    id: 0,
    price: 0,
    change: 0,
    changePercent: 0,
    name: '',
    reference: 0,
    ceiling: 0,
    floor: 0,
    close: 0,
    volume: 0,
    average: 0,
    high: 0,
    low: 0,
    open: 0,
    totalVolume: 0,
    totalValue: 0,
    foreignBought: 0,
    foreignSold: 0,
    foreignRemain: 0,
    remainBid: null,
    remainAsk: null,
    buyPrice1: 0,
    buyPrice2: 0,
    buyPrice3: 0,
    sellPrice1: 0,
    sellPrice2: 0,
    sellPrice3: 0,
    buyVol1: 0,
    buyVol2: 0,
    buyVol3: 0,
    sellVol1: 0,
    sellVol2: 0,
    sellVol3: 0,
    stockType: '',
    exchange: '',
    hasNewestNews: false,
    ...partial,
    symbol: partial.symbol.trim().toUpperCase(),
});

export const getAvatarUrl = (symbol: string) => {
    return `https://cdn1.finhay.com.vn/app-assets/images/vnsc/prod/${symbol}.png`;
};

export const buildStockPriceTopics = (symbols: string[]): string[] => {
    const uniqueSymbols = Array.from(new Set(symbols.filter(Boolean)));
    return uniqueSymbols.map((symbol) => `/stock-price/${symbol}`);
};

export const getPriceFlashBg = (
    price: number,
    reference: number,
    floor: number,
    ceiling: number,
): string => {
    const textColor = getPriceColor(price, reference, floor, ceiling);
    const bg =
        textColor.includes('text-red') || textColor.includes('text-blue')
            ? 'bg-red'
            : textColor.includes('text-orange')
              ? 'bg-orange'
              : 'bg-green';
    return `${bg} text-primary`;
};

export const getFlashBgBySign = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '';
    if (value > 0) return 'bg-green';
    if (value < 0) return 'bg-red';
    return 'bg-orange';
};

export const buildChartUrl = (symbol: string): string =>
    `https://chart.vnsc.vn/chart-fhsc?symbol=${symbol}`;

export const generateDeviceId = async (): Promise<string> => {
    if (cachedDeviceId) {
        return cachedDeviceId;
    }

    try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();

        cachedDeviceId = result.visitorId;

        if (typeof window !== 'undefined') {
            setDeviceId(result.visitorId);
        }

        return result.visitorId;
    } catch {
        return getDeviceId() || 'unknown-device';
    }
};

export type NetworkStatus = 'stable' | 'unstable' | 'offline';

type ResolveNetworkStatusParams = {
    avgLatencyMs: number;
    successRate: number;
    consecutiveFails: number;
    isOnline?: boolean;
};

export const resolveNetworkStatus = ({
    avgLatencyMs,
    successRate,
    consecutiveFails,
    isOnline = true,
}: ResolveNetworkStatusParams): NetworkStatus => {
    if (!isOnline || consecutiveFails >= NETWORK_HEALTH.CONSECUTIVE_FAIL_OFFLINE) {
        return 'offline';
    }

    if (
        avgLatencyMs <= NETWORK_HEALTH.STABLE_MAX_LATENCY_MS &&
        successRate >= NETWORK_HEALTH.STABLE_MIN_SUCCESS_RATE
    ) {
        return 'stable';
    }

    return 'unstable';
};
