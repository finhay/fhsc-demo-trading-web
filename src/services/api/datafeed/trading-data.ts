import { EXCHANGE_TO_INDEX } from '@/constants/common';
import { vnscServiceDatafeed } from '@/services/interceptor';
import type {
    ForeignTradingBySectorResponse,
    ForeignTradingStatsResponse,
    IndexComparisonResponse,
    InvestmentChannelPerformanceResponse,
    InvestmentChannelPeriod,
    MarketLeaderboardResponse,
    MarketLiquidityStatsResponse,
    ProprietaryTradingBySectorResponse,
    ProprietaryTradingStatsResponse,
    TopStockPriceChangePeriod,
    TopStockPriceChangeResponse,
    TopStockPriceChangeTrend,
    TradingStatsExchange,
    TradingStatsPeriod,
} from '@/types/datafeed/trading-data';

type IndustryPriceChangeItem = {
    sector: string;
    name: string;
    price_change_percent: number;
    total_volume: number;
    total_value: number;
    positive_money_flow: number;
    negative_money_flow: number;
    neutral_money_flow: number;
    index_close: number;
};

type IndustryPriceChangeResponse = {
    error_code: string;
    message: string;
    data: IndustryPriceChangeItem[];
};

type SectorStockItem = {
    symbol: string;
    price: number;
    close: number;
    ceiling: number;
    floor: number;
    reference: number;
    changePercent: number;
    totalValue: number;
    totalVolume: number;
    name: string;
    exchange: string;
};

type SectorStocksResponse = {
    error_code: string;
    message: string;
    data: SectorStockItem[];
};

export const fetchMarketLeaderboardV2 = (
    value: string,
    influence: string,
): Promise<MarketLeaderboardResponse> => {
    return new Promise<MarketLeaderboardResponse>((resolve, reject) => {
        vnscServiceDatafeed
            .get(`/v2/stock-info`, {
                params: {
                    exchange: value,
                    influence,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchForeignTradingStats = (
    exchange: string,
    period?: TradingStatsPeriod,
): Promise<ForeignTradingStatsResponse> => {
    return new Promise<ForeignTradingStatsResponse>((resolve, reject) => {
        vnscServiceDatafeed
            .get('/v2/foreign-trading', {
                params: { exchange, ...(period ? { period } : {}) },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchProprietaryTradingStats = (
    exchange: string,
    period?: TradingStatsPeriod,
): Promise<ProprietaryTradingStatsResponse> => {
    return new Promise<ProprietaryTradingStatsResponse>((resolve, reject) => {
        vnscServiceDatafeed
            .get('/v2/proprietary-trading', {
                params: { exchange, ...(period ? { period } : {}) },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchForeignTradingBySector = (
    exchange: TradingStatsExchange,
    period: TradingStatsPeriod,
): Promise<ForeignTradingBySectorResponse> => {
    return new Promise<ForeignTradingBySectorResponse>((resolve, reject) => {
        vnscServiceDatafeed
            .get('/foreign-trading/by-sector', { params: { exchange, period } })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchProprietaryTradingBySector = (
    exchange: TradingStatsExchange,
    period: TradingStatsPeriod,
): Promise<ProprietaryTradingBySectorResponse> => {
    return new Promise<ProprietaryTradingBySectorResponse>((resolve, reject) => {
        vnscServiceDatafeed
            .get('/proprietary-trading/by-sector', { params: { exchange, period } })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchIndexComparison = (
    period: InvestmentChannelPeriod,
): Promise<IndexComparisonResponse> => {
    return new Promise<IndexComparisonResponse>((resolve, reject) => {
        vnscServiceDatafeed
            .get('/investment-channels/index-comparison', { params: { period } })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchInvestmentChannelPerformance = (
    period: InvestmentChannelPeriod,
): Promise<InvestmentChannelPerformanceResponse> => {
    return new Promise<InvestmentChannelPerformanceResponse>((resolve, reject) => {
        vnscServiceDatafeed
            .get('/investment-channels/performance', { params: { period } })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchMarketLiquidityStats = (
    exchange: string,
): Promise<MarketLiquidityStatsResponse> => {
    const index = EXCHANGE_TO_INDEX[exchange] ?? exchange;
    return new Promise<MarketLiquidityStatsResponse>((resolve, reject) => {
        vnscServiceDatafeed
            .get('/market-liquidity', { params: { index, number_previous_sessions: 5 } })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchIndustryPriceChange = (): Promise<IndustryPriceChangeResponse> => {
    return new Promise((resolve, reject) => {
        vnscServiceDatafeed
            .get('/stock-industry-price-change')
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchSectorStocks = (sectorId: string): Promise<SectorStocksResponse> => {
    return new Promise((resolve, reject) => {
        vnscServiceDatafeed
            .get(`/v2/stock-sectors/${sectorId}`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchTopStockPriceChange = (
    trend: TopStockPriceChangeTrend,
    period: TopStockPriceChangePeriod,
): Promise<TopStockPriceChangeResponse> => {
    return new Promise<TopStockPriceChangeResponse>((resolve, reject) => {
        vnscServiceDatafeed
            .get('/top-stock-price-change', { params: { trend, period } })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
