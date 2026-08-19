export type MarketLeaderboardItem = {
    symbol: string;
    price: number;
    close: number;
    ceiling: number;
    volume: number;
    change: number;
    floor: number;
    reference: number;
    average: number;
    high: number;
    low: number;
    open: number;
    totalVolume: number;
    totalValue: number;
    foreignBought: number;
    foreignSold: number;
    foreignRemain: number | null;
    remainBid: number | null;
    remainAsk: number | null;
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
    changePercent: number;
    stockType: string;
    exchange: string;
    name: string;
    createdAt: number;
    hasNewestNews: boolean;
    stockSummary: unknown | null;
    symbolStatus: string;
    symbolStatusCode: string;
    floorCode: string;
    pe: number;
    pb: number;
    roe: number;
    influenceScore: number;
    marketCap: number;
    marketCapCategory: string;
};

export type MarketLeaderboardResponse = {
    error_code: string;
    message: string;
    result: MarketLeaderboardItem[];
    traceId?: string;
};

export type MarketLiquidityItem = {
    time: string;
    accumulated_val: number;
};

export type MarketLiquiditySession = {
    trading_date: string;
    index: string;
    items: MarketLiquidityItem[];
};

export type MarketLiquidityStatsData = {
    latest: MarketLiquiditySession;
    previous: MarketLiquiditySession;
};

export type MarketLiquidityStatsResponse = {
    error_code: string;
    message: string;
    data: MarketLiquidityStatsData;
    traceId?: string;
};

export type TradingNetPositionItem = {
    symbol: string;
    net_value: number;
};

export type TradingFlowStockInfoItem = {
    symbol: string;
    name: string;
    exchange: string;
    stock_type: string;
    floor: number;
    ceiling: number;
    reference: number;
    price: number;
    price_change: number;
    price_change_percent: number;
    volume: number;
    total_volume: number;
};

export type TradingStatsPeriod = 'YTD' | '1Y' | '3Y' | '5Y';
export type TradingStatsExchange = 'HOSE' | 'HNX' | 'UPCOM';

export type TradingBySectorItem = {
    sector: string;
    sector_name: string;
    net_value: number;
    buy_value: number;
    sell_value: number;
};

export type TradingBySectorData = {
    exchange: TradingStatsExchange;
    trading_date: string;
    top_net_buy: TradingBySectorItem[];
    top_net_sell: TradingBySectorItem[];
};

export type ForeignTradingBySectorResponse = {
    error_code: string;
    message: string;
    data: TradingBySectorData;
    traceId?: string;
};

export type ProprietaryTradingBySectorResponse = {
    error_code: string;
    message: string;
    data: TradingBySectorData;
    traceId?: string;
};

export type ForeignTradingStatsData = {
    exchange: string;
    total_buy_value: number;
    total_sell_value: number;
    delta_buy_sell: number;
    trading_date: string;
    top_net_buy: TradingNetPositionItem[];
    top_net_sell: TradingNetPositionItem[];
    stocks_info: TradingFlowStockInfoItem[];
    total_buy_volume: number;
    total_sell_volume: number;
    delta_volume: number;
    previous_session_details: {
        date: string;
        net_value: number;
    }[];
};

export type ProprietaryTradingStatsData = ForeignTradingStatsData;

export type ForeignTradingStatsResponse = {
    error_code: string;
    message: string;
    data: ForeignTradingStatsData;
    traceId?: string;
};

export type ProprietaryTradingStatsResponse = {
    error_code: string;
    message: string;
    data: ProprietaryTradingStatsData;
    traceId?: string;
};

export type TopStockPriceChangePeriod = 'session' | '15m' | '1h' | '2h';
export type TopStockPriceChangeTrend = 'increase' | 'decrease';

export type TopStockPriceChangeItem = {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    reference: number;
    ceiling: number;
    floor: number;
};

export type TopStockPriceChangeResponse = {
    error_code: string;
    message: string;
    data: TopStockPriceChangeItem[];
};

export type InvestmentChannelPeriod = 'YTD' | '1Y' | '5Y' | '10Y';

export type InvestmentChannelItem = {
    channel: string;
    channel_name: string;
    return_percent: number;
    from_date: string;
    to_date: string;
    from_value: number | string;
    to_value: number | string;
};

export type IndexComparisonData = {
    period: InvestmentChannelPeriod;
    indices: InvestmentChannelItem[];
};

export type InvestmentChannelPerformanceData = {
    period: InvestmentChannelPeriod;
    channels: InvestmentChannelItem[];
};

export type IndexComparisonResponse = {
    error_code: string;
    message: string;
    data: IndexComparisonData;
    traceId?: string;
};

export type InvestmentChannelPerformanceResponse = {
    error_code: string;
    message: string;
    data: InvestmentChannelPerformanceData;
    traceId?: string;
};
