import type {
    EXCHANGE_RATE_CURRENCIES,
    MACRO_INDICATOR_ROW_CONFIGS,
    PORTFOLIO_CHART_PALETTE,
    TRADING_FLOW_BLOCK_TABS,
} from '@/constants/market';
import type {
    BankInterestRatesData,
    ExchangeRateChartData,
    LoanRateItem,
    MacroExportPoint,
    MacroPoint,
    OmoHistoryItem,
} from '@/types/datafeed/finance';

export type TradingFlowTab = (typeof TRADING_FLOW_BLOCK_TABS)[number];
export type TradingFlowTopNetTab = 'symbol' | 'sector';

export type TopNetPriceLimit = {
    ceiling: number;
    floor: number;
};

export type TopNetRealtimeQuote = {
    price?: number;
    changePercent?: number | null;
    ceiling?: number;
    floor?: number;
};

export type TopNetDisplayItem = {
    key: string;
    name: string;
    companyName?: string;
    changePercent?: number | null;
    netValue: number;
    netValueBillion: number;
    price?: number;
    ceiling?: number;
    floor?: number;
};
export type TradingFlowTopNetSide = 'buy' | 'sell';

export type TradingFlowTreemapColorMode = 'price-limit' | 'change-percent';

export type TradingFlowTreemapCell = TopNetDisplayItem & {
    value: number;
    percent: number;
};
export type TradingFlowSession = { date: string; net_value: number };

export type ForeignTradeRealtimeMessage = {
    exchange: string;
    tradingDate: string;
    totalBuyValue: number;
    totalSellValue: number;
    totalBuyVol: number;
    totalSellVol: number;
};

export type InfluenceBubbleDirection = 'increase' | 'decrease';

export type InfluenceBubblePoint = {
    value: [number, number];
    symbolSize: number;
    itemStyle: { color: string; borderColor: string; borderWidth: number };
    code: string;
    changeLabel: string;
};

export type TradingFlowBarPoint = {
    value: number;
    itemStyle: { color: string; borderRadius: [number, number, number, number] };
};

export type HeatmapSectorStockItem = {
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

export type HeatmapSector = {
    sector: string;
    name: string;
    totalValue: number;
    stocks: HeatmapSectorStockItem[];
};

type HeatmapTreemapStockNode = {
    name: string;
    value: number;
    symbol: string;
    stockName: string;
    changePercent: number;
    price: number;
    ceiling: number;
    floor: number;
    totalValue: number;
    totalVolume: number;
    itemStyle: { color: string };
    emphasis: { itemStyle: { color: string } };
};

export type HeatmapTreemapNode = {
    name: string;
    value: number;
    itemStyle: { color: string };
    children: HeatmapTreemapStockNode[];
};

type MacroIndicatorKey = (typeof MACRO_INDICATOR_ROW_CONFIGS)[number]['key'];

export type MacroRow = {
    key: MacroIndicatorKey;
    isPercent: boolean;
    values: Record<string, number | null>;
};

export type MacroIndicatorState = {
    months: string[];
    rows: MacroRow[];
};

export type MacroCountryTab = 'vn' | 'us';

export type MacroVnRawState = {
    iip: MacroPoint[];
    pmi: MacroPoint[];
    serviceRetail: MacroPoint[];
    goodsRetail: MacroPoint[];
    cpi: MacroPoint[];
    exportData: MacroExportPoint[];
};

export type MacroUsRawState = {
    pce: MacroPoint[];
    corePce: MacroPoint[];
    nfp: MacroPoint[];
    unemployment: MacroPoint[];
};

export type MacroTrend = 'up' | 'down' | 'flat';

export type MacroLiquidityOmoView = { value: string };
export type MacroLiquidityDepositRateView = { value: string };

export type MacroLiquidityExchangeRateView = {
    value: string;
    changePercent: string;
    trend: MacroTrend;
};

export type MacroLiquidityInterbankRateView = {
    value: string;
    bps: number;
    trend: MacroTrend;
};

export type MacroLiquidityLoanRateView = {
    value: string;
    durationMonths: number;
    bankName: string;
};

export type MacroLiquidityState = {
    exchangeRate: MacroLiquidityExchangeRateView | null;
    interbank: MacroLiquidityInterbankRateView | null;
    omo: MacroLiquidityOmoView | null;
    deposit: MacroLiquidityDepositRateView | null;
    loan: MacroLiquidityLoanRateView | null;
};

export type MacroLiquidityRawState = {
    exchangeChart: ExchangeRateChartData | null;
    interbank: MacroPoint[];
    omo: OmoHistoryItem[];
    deposit: BankInterestRatesData | null;
    loan: LoanRateItem[];
};

export type ExchangeRateCurrency = (typeof EXCHANGE_RATE_CURRENCIES)[number];

export type OmoChartTab = 'outstanding' | 'net';

export type ChartAxisDateStyle = 'day' | 'month';

type MacroLiquidityStatRowIcon = 'coins' | 'building' | 'omo';

export type MacroLiquidityStatRow = {
    key: string;
    icon?: MacroLiquidityStatRowIcon;
    iconClassName?: string;
    title: string;
    subtitle: string;
    value: string;
    valueSuffix?: string;
    change?: { text: string; trend: MacroTrend };
};

export type MarketIndexMiniData = {
    values: number[];
    times: number[];
    reference: number;
};

export type MarketBreadthSeriesKey = 'floors' | 'declines' | 'nochanges' | 'advances' | 'ceilings';

export type MarketBreadthChartData = {
    times: number[];
    floors: number[];
    declines: number[];
    nochanges: number[];
    advances: number[];
    ceilings: number[];
};

export type InvestmentPerformanceBarItem = {
    channel: string;
    channelName: string;
    returnPercent: number;
};

export type GlobalIndexTab = 'us' | 'asia';

export type GlobalIndexPoint = {
    index: string;
    name: string;
    indexValue: number;
    change: number;
    changePercent: number;
    values: number[];
};

export type PerspectiveColMeta = {
    align?: 'left' | 'right';
    thClass?: string;
    tdClass?: string;
};

export type MarketPortfolioTheme = 'green' | 'red';

export type MarketPortfolioChartItem = {
    symbol: string;
    ratio: number;
    isUp: boolean;
};

export type MarketPortfolioRow = {
    symbol: string;
    price: number;
    reference: number;
    floor: number;
    ceiling: number;
    marketValue: number;
    change: number;
    changePercent: number;
    impactPercent: number;
    weightPercent: number;
};

export type MarketPortfolioView = {
    rows: MarketPortfolioRow[];
    chartItems: MarketPortfolioChartItem[];
    portfolioChangePercent: number;
};

export type MarketPortfolioChartSegment = MarketPortfolioChartItem & {
    start: number;
    end: number;
    mid: number;
};

export type MarketPortfolioPaletteColors = (typeof PORTFOLIO_CHART_PALETTE)[MarketPortfolioTheme];
