import type { StockPriceMessage } from '@/proto/stock';
import type {
    StockScreenerItem,
    StockScreenerParams,
    StocksInfoItem,
} from '@/types/datafeed/stock-info';
import type { ForeignTradingStatsData, TradingStatsPeriod } from '@/types/datafeed/trading-data';
import type {
    ForeignTradeRealtimeMessage,
    TopNetDisplayItem,
    TopNetPriceLimit,
    TopNetRealtimeQuote,
    TradingFlowTreemapCell,
} from '@/types/pages/market';

export const toTradingFlowBillions = (netValue: number): number => netValue / 1_000_000_000;

export const buildForeignTradingMqttTopic = (exchange: string): string =>
    `foreign-trading/exchange/${exchange}`;

export const mergeForeignTradingRealtimeStats = (
    prev: ForeignTradingStatsData,
    update: ForeignTradeRealtimeMessage,
): ForeignTradingStatsData => {
    const netValue = update.totalBuyValue - update.totalSellValue;
    const netVolume = update.totalBuyVol - update.totalSellVol;

    const sessions = [...prev.previous_session_details];
    if (sessions.length > 0) {
        sessions[sessions.length - 1] = { date: update.tradingDate, net_value: netValue };
    }

    return {
        ...prev,
        total_buy_value: update.totalBuyValue,
        total_sell_value: update.totalSellValue,
        total_buy_volume: update.totalBuyVol,
        total_sell_volume: update.totalSellVol,
        delta_buy_sell: netValue,
        delta_volume: netVolume,
        trading_date: update.tradingDate,
        previous_session_details: sessions,
    };
};

export const buildTopNetScreenerParams = (
    exchange: string,
    isForeign: boolean,
    side: 'buy' | 'sell',
    period?: TradingStatsPeriod,
): Omit<StockScreenerParams, 'page'> => {
    const params: Omit<StockScreenerParams, 'page'> = {
        exchange,
        page_size: 50,
        ...(period ? { window: period } : {}),
    };

    if (isForeign) {
        if (side === 'buy') {
            params.foreign_net_value_gt = 0;
        } else {
            params.foreign_net_value_lt = 0;
        }
    } else if (side === 'buy') {
        params.proprietary_net_value_gt = 0;
    } else {
        params.proprietary_net_value_lt = 0;
    }

    return params;
};

export const mapStockScreenerToDisplayItems = (
    items: StockScreenerItem[],
    isForeign: boolean,
): TopNetDisplayItem[] =>
    items.map((item) => {
        const netValue = isForeign
            ? (item.foreign_net_value ?? 0)
            : (item.proprietary_net_value ?? 0);
        return {
            key: item.symbol,
            name: item.symbol,
            companyName: item.name,
            changePercent: item.change_percent,
            netValue,
            netValueBillion: toTradingFlowBillions(netValue),
            price: item.price,
        };
    });

export const buildPriceLimitMap = (items: StocksInfoItem[]): Record<string, TopNetPriceLimit> =>
    items.reduce<Record<string, TopNetPriceLimit>>((acc, item) => {
        if (!item.symbol) return acc;
        acc[item.symbol] = { ceiling: item.ceiling, floor: item.floor };
        return acc;
    }, {});

export const applyPriceLimitsToTopNetItems = (
    items: TopNetDisplayItem[],
    limits: Record<string, TopNetPriceLimit>,
): TopNetDisplayItem[] =>
    items.map((item) => {
        const limit = limits[item.key];
        if (!limit) return item;
        return { ...item, ceiling: limit.ceiling, floor: limit.floor };
    });

export const mergeTopNetRealtimeQuote = (
    prev: TopNetRealtimeQuote | undefined,
    update: StockPriceMessage,
): TopNetRealtimeQuote => ({
    price: update.price || prev?.price,
    changePercent: Number.isFinite(update.changePercent)
        ? update.changePercent
        : prev?.changePercent,
    ceiling: update.ceiling || prev?.ceiling,
    floor: update.floor || prev?.floor,
});

export const applyRealtimeQuotesToTopNetItems = (
    items: TopNetDisplayItem[],
    quotes: Record<string, TopNetRealtimeQuote>,
): TopNetDisplayItem[] =>
    items.map((item) => {
        const quote = quotes[item.key];
        if (!quote) return item;
        return {
            ...item,
            price: quote.price ?? item.price,
            changePercent: quote.changePercent ?? item.changePercent,
            ceiling: quote.ceiling ?? item.ceiling,
            floor: quote.floor ?? item.floor,
        };
    });

export const sumTopNetAbsValues = (items: TopNetDisplayItem[]): number =>
    items.reduce((sum, item) => sum + Math.abs(item.netValue), 0);

export const toTreemapCells = (
    items: TopNetDisplayItem[],
    totalValue?: number,
): TradingFlowTreemapCell[] => {
    const totalAbsNetValue = (totalValue ?? sumTopNetAbsValues(items)) || 1;

    return items
        .map((item) => {
            const absNetValue = Math.abs(item.netValue);
            return {
                ...item,
                value: absNetValue,
                percent: (absNetValue / totalAbsNetValue) * 100,
            };
        })
        .filter((item) => item.value > 0)
        .sort((a, b) => b.value - a.value);
};
