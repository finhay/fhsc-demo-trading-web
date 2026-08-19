import type { FinancialStatementRow } from '@/types/datafeed/finance';

export type TradingChartPoint = {
    dateLabel: string;
    fullDateLabel: string;
    netValueInBillion: number;
};

export type StockInfoSparklineData = number[] | { x: number; y: number }[];

export type StockInfoSparklineOpts = {
    height?: number;
    smooth?: boolean;
    gridPadding?: number;
    enableTooltip?: boolean;
    categories?: string[];
    tooltipSuffix?: string;
};

export type StockInfoMultiLineSeries = {
    name: string;
    color: string;
    data: number[] | { x: number; y: number }[];
};

export type StockInfoMultiLineOpts = {
    gridPadding?: number;
    enableTooltip?: boolean;
    categories?: string[];
};

export type StockInfoPercentTooltipItem = {
    label: string;
    dotColor: string;
};

export type SymbolInfoStatItem = {
    label: string;
    value: number;
    ddClassName: string;
};

export type SymbolInfoRealtimeSnapshot = {
    price: number;
    changePercent: number;
    floor: number;
    ceiling: number;
    reference: number;
    high: number;
    low: number;
    average: number;
};

export type SymbolValuationRankMeta = {
    code?: string;
    name?: string;
    total_symbol?: number;
};

export type SymbolValuationDetail = {
    score?: number;
    valuation_percent?: number | null;
    valuation_type?: string;
    industry_ranking?: number;
    sector_ranking?: number;
    country_ranking?: number;
    total_symbol?: number;
    industry?: SymbolValuationRankMeta;
    sector?: SymbolValuationRankMeta;
};

export type SymbolMarketInfoStats = {
    totalVolume?: number;
    totalValue?: number;
    roe?: number;
    pe?: number;
    pb?: number;
};

export type TradingStatsSnapshot = {
    trading_date?: string;
    delta_buy_sell?: number;
    previous_session_details?: unknown[];
};

export type TradeReportDividerVariant = 'base' | 'textTertiary' | 'green';

export type TradeReportMetricStyle =
    | 'sectionTitle'
    | 'header'
    | 'sub'
    | 'negativeDesc1'
    | 'negativeDesc2';

export type TradeReportSchemaRow =
    | { kind: 'section'; label: string }
    | { kind: 'divider'; variant: TradeReportDividerVariant }
    | { kind: 'data'; metricKey: string; style: TradeReportMetricStyle; uiLabel?: string };

export type ReportTab = 'income-statement' | 'balance-sheet' | 'cash-flow';

export type FinancialStatementData = Record<ReportTab, FinancialStatementRow[]>;

export type StockStatisticsPriceHistoryRow = {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    change: number;
    changePercent: number;
    prevClose: number | null;
};

export type CompanyType = 'BANK' | 'INSURANCE' | 'SECURITIES' | 'NON_FINANCIAL';

export type AnalysisRow = {
    id: string;
    labelKey: string;
    field: string;
};

export type ProfitRow = {
    id: string;
    labelKey: string;
    field: string;
    kind: string;
};

export type SecuritiesGrowthRow = {
    id: string;
    labelKeyYoY: string;
    labelKeySo: string;
    yoyField: string;
    soField: string;
    soUnit?: string;
};

export type PlanItem = {
    labelKey: string;
    key: string;
    value: number;
    isZero: boolean;
    textColor: string;
    bgColor: string;
};

export type StockInfoTabKey =
    | 'CHART'
    | 'OVERVIEW'
    | 'NEWS'
    | 'FINANCE'
    | 'STATISTICS'
    | 'EVENTS'
    | 'PROFILE';

export type FinanceOverviewValuationLabelKey = 'metric_pe' | 'metric_pb' | 'metric_ev_ebitda';

export type FinanceOverviewValuationRow = {
    labelKey: FinanceOverviewValuationLabelKey;
    min: number;
    max: number;
    current: number;
    industry: number;
    valueTone: 'green' | 'orange';
};
