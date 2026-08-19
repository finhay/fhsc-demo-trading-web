export type FinanceOverviewData = {
    pe: number;
    pb: number;
    ev_ebitda: number;
    industry: { pe: number; pb: number; ev_ebitda: number };
    gross_margin: number;
    roe: number;
    eps: number;
    dividend_yield: number;
    nim: number;
    margin_loan_to_equity_ratio: number;
    roa: number;
};

export type FinanceOverviewResponse = {
    error_code: string;
    message: string;
    data: FinanceOverviewData;
};

export type FinanceNewsData = {
    created_at: number | null;
    content: string | null;
    extra_content: string | null;
    financial: { year: number; quarter: number; net_sale: number; profit: number }[];
};

export type FinanceNewsResponse = {
    error_code: string;
    message: string;
    data: FinanceNewsData;
};

export type FetchFinancialStatementParams = {
    symbol: string;
    type: string;
};

export type FinancialStatementRow = { year: number; quarter: number };

export type FinancialStatementApiResponse<T extends FinancialStatementRow = FinancialStatementRow> =
    {
        error_code: string;
        message: string;
        data: T[];
    };

export type CompanyFinancialAnalysisResponse = {
    error_code: string;
    message: string;
    data: any;
};

export type ExchangeRatePeriod = '1M' | '1Y' | 'YTD';

export type ExchangeRateValueType = 'NUMBER' | 'PERCENT';

export type ExchangeRateChartItem = {
    date: string;
    VCB: number;
    SBV: number;
    BLACK_MARKET: number;
};

export type ExchangeRateChartData = {
    last_updated: string;
    chart_items: ExchangeRateChartItem[];
};

export type ExchangeRateChartResponse = {
    error_code: string;
    message: string;
    data: ExchangeRateChartData;
};

export type MacroIndicatorType =
    | 'IIP'
    | 'GOODS_RETAIL'
    | 'SERVICE_RETAIL'
    | 'CPI'
    | 'FED_FUNDS_RATE'
    | 'INTERBANK_RATE'
    | 'PMI'
    | 'PCE'
    | 'CORE_PCE'
    | 'NFP'
    | 'UNEMPLOYMENT_RATE';

export type MacroPoint = {
    type: string;
    country: string;
    month: string;
    value: number;
    date: string;
};

export type MacroResponse = {
    error_code: string;
    message: string;
    data: MacroPoint[];
};

export type MacroExportPoint = {
    month: string;
    total: number;
    domestic: number;
    fdi: number;
};

export type MacroExportResponse = {
    error_code: string;
    message: string;
    data: MacroExportPoint[];
};

export type OmoHistoryItem = {
    date: string;
    issued_volume: number;
    matured_volume: number;
    outstanding_volume: number;
    net_injection: number;
    rate: number;
};

export type OmoHistoryResponse = {
    error_code: string;
    message: string;
    data: OmoHistoryItem[];
};

export type BankInterestRate = {
    duration_name: string;
    value: number;
};

export type BankInterestRateItem = {
    bank_id: string;
    bank_name: string;
    bank_icon_url: string;
    rates: BankInterestRate[];
};

export type BankInterestRatesData = {
    no_bank: number;
    effective_date: string;
    bank_interest_rates: BankInterestRateItem[];
};

export type BankInterestRatesResponse = {
    error_code: string;
    message: string;
    data: BankInterestRatesData;
};

export type LoanRateItem = {
    id: number;
    bank_name: string;
    rate_category: string;
    package_code: string;
    package_name: string;
    phase_order: number;
    phase_label: string;
    phase_duration_months: number;
    rate_type: string | null;
    fixed_rate_percent: number | null;
    float_base_reference: string | null;
    published_date: string;
};

export type LoanRatesResponse = {
    error_code: string;
    message: string;
    data: LoanRateItem[];
};

export type GlobalIndexOhlc = {
    close: number;
    change: string;
    change_pct: string;
    trading_date: string;
};

export type GlobalIndexRawItem = {
    index_name: string;
    name: string;
    current_ohlc: GlobalIndexOhlc;
    history_ohlc: GlobalIndexOhlc[];
};
export type GlobalIndexResponse = {
    error_code: string;
    message: string;
    data: {
        area: string;
        data: GlobalIndexRawItem[];
    };
};

export type GoldItem = {
    index: string;
    name: string;
    short_name: string;
    buy_value: number;
    sell_value: number;
    buy_value_change_percent: number | null;
    sell_value_change_percent: number | null;
    usd_value: number;
    vnd_value: number;
    change_percent?: number | null;
    date: string;
    updated_at: string;
    provider: string;
    provider_icon: string | null;
};

export type GoldResponse = {
    error_code: string;
    message: string;
    data: GoldItem[];
};

export type MetalChartDays = 30 | 60 | 180 | 365;

export type GoldChartItem = {
    date: string;
    gold_bar?: number;
    gold_ring?: number;
    gold_global?: number;
};

export type GoldChartResponse = {
    error_code: string;
    message: string;
    data: GoldChartItem[];
};

export type SilverItem = {
    index: string;
    name: string;
    short_name: string;
    buy_value: number;
    sell_value: number;
    buy_value_change_percent?: number | null;
    sell_value_change_percent?: number | null;
    usd_value: number;
    vnd_value: number;
    change_percent?: number | null;
    date: string;
    updated_at: string;
    provider: string;
    provider_icon: string | null;
};

export type SilverResponse = {
    error_code: string;
    message: string;
    data: SilverItem[];
};

export type SilverChartItem = {
    date: string;
    silver_bar?: number;
    silver_global?: number;
};

export type SilverChartResponse = {
    error_code: string;
    message: string;
    data: SilverChartItem[];
};

export type MetalProviderItem = {
    index: string;
    name: string;
    short_name: string;
    buy_value: number;
    sell_value: number;
    buy_value_change_percent?: number | null;
    sell_value_change_percent?: number | null;
    usd_value: number;
    vnd_value: number;
    change_percent?: number | null;
    date: string;
    updated_at: string;
    provider: string;
    provider_icon: string | null;
};

export type MetalProvidersResponse = {
    error_code: string;
    message: string;
    data: MetalProviderItem[];
};

export type OilItem = {
    index: string;
    name: string;
    usd_value: number;
    change_percent: number;
    updated_at: string;
};

export type OilResponse = {
    error_code: string;
    message: string;
    data: OilItem[];
};

export type CryptoItem = {
    name: string;
    symbol: string;
    icon_url: string;
    price: number;
    formatted_price: string;
    percent_change_1h: number;
    percent_change_24h: number;
    percent_change_7d: number;
    percent_change_30d: number;
    market_cap: number;
    last_30d_chart: string;
};

export type CryptoResponse = {
    error_code: string;
    message: string;
    data: CryptoItem[];
};
