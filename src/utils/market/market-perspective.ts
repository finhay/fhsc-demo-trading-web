import type { StockPriceMessage } from '@/proto/stock';
import type {
    TopStockPriceChangeItem,
    TopStockPriceChangePeriod,
    TopStockPriceChangeTrend,
} from '@/types/datafeed/trading-data';

export const buildTopStockPriceChangesMqttTopic = (
    trend: TopStockPriceChangeTrend,
    period: TopStockPriceChangePeriod,
): string => `/top-stock-price-changes/${trend}/${period}`;

export const mapStockPriceMessagesToTopChangeItems = (
    stockPrices: StockPriceMessage[],
): TopStockPriceChangeItem[] =>
    stockPrices.map((item) => ({
        symbol: item.symbol,
        name: item.name,
        price: item.price,
        change: item.change,
        changePercent: item.changePercent,
        reference: item.reference,
        ceiling: item.ceiling,
        floor: item.floor,
    }));

export const mergeRealtimeTopChangeItems = (
    current: TopStockPriceChangeItem[],
    incoming: TopStockPriceChangeItem[],
): TopStockPriceChangeItem[] =>
    incoming.map((item) => {
        const existing = current.find((it) => it.symbol === item.symbol);
        return existing ? { ...existing, ...item } : item;
    });
