import { vnscService, vnscServiceDatafeed } from '@/services/interceptor';
import type {
    BankInterestRatesResponse,
    CompanyFinancialAnalysisResponse,
    CryptoResponse,
    ExchangeRateChartResponse,
    ExchangeRatePeriod,
    ExchangeRateValueType,
    FetchFinancialStatementParams,
    FinanceNewsResponse,
    FinanceOverviewResponse,
    FinancialStatementApiResponse,
    GlobalIndexResponse,
    GoldChartResponse,
    GoldResponse,
    LoanRatesResponse,
    MacroExportResponse,
    MacroIndicatorType,
    MacroResponse,
    MetalChartDays,
    MetalProvidersResponse,
    OilResponse,
    OmoHistoryResponse,
    SilverChartResponse,
    SilverResponse,
} from '@/types/datafeed/finance';

export const fetchCompanyFinancialOverview = (symbol: string): Promise<FinanceOverviewResponse> => {
    return new Promise<FinanceOverviewResponse>((resolve, reject) => {
        vnscServiceDatafeed
            .get(`/company-financial/overview`, {
                params: { symbol: symbol.toUpperCase() },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchFinancialNewsBySymbol = (symbol: string): Promise<FinanceNewsResponse> => {
    return new Promise<FinanceNewsResponse>((resolve, reject) => {
        vnscServiceDatafeed
            .get(`/v3/financial-news/${encodeURIComponent(symbol.toUpperCase())}`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchFinancialStatement = (
    params: FetchFinancialStatementParams,
): Promise<FinancialStatementApiResponse> => {
    return new Promise<FinancialStatementApiResponse>((resolve, reject) => {
        vnscServiceDatafeed
            .get(`/v2/financial-statement/statement`, {
                params: {
                    symbol: params.symbol.toUpperCase(),
                    type: params.type,
                    period: 'quarterly',
                    limit: 5,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchCompanyFinancialAnalysis = (
    symbol: string,
    period = 'annual',
): Promise<CompanyFinancialAnalysisResponse> => {
    return new Promise((resolve, reject) => {
        vnscServiceDatafeed
            .get(`/company-financial/analysis`, {
                params: {
                    symbol: symbol.toUpperCase(),
                    period,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchExchangeRateChart = (
    currency: string,
    period: ExchangeRatePeriod = 'YTD',
    valueType: ExchangeRateValueType = 'NUMBER',
): Promise<ExchangeRateChartResponse> => {
    return new Promise((resolve, reject) => {
        vnscServiceDatafeed
            .get('/financial-data/exchange-rate-chart', {
                params: { currency, value_type: valueType, period },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchMacroIndicator = (
    type: MacroIndicatorType,
    country: string = 'VN',
): Promise<MacroResponse> => {
    return new Promise((resolve, reject) => {
        vnscServiceDatafeed
            .get('/financial-data/macro', { params: { type, country } })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchMacroExport = (): Promise<MacroExportResponse> => {
    return new Promise((resolve, reject) => {
        vnscServiceDatafeed
            .get('/financial-data/macro/export')
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchOmoHistory = (): Promise<OmoHistoryResponse> => {
    return new Promise((resolve, reject) => {
        vnscServiceDatafeed
            .get('/financial-data/omo/history')
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchBankInterestRates = (): Promise<BankInterestRatesResponse> => {
    return new Promise((resolve, reject) => {
        vnscServiceDatafeed
            .get('/financial-data/bank-interest-rates')
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchLoanRates = (): Promise<LoanRatesResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get('/datafeed-v2/v1/loan-rates')
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchGlobalIndex = (area: string): Promise<GlobalIndexResponse> => {
    return new Promise((resolve, reject) => {
        vnscServiceDatafeed
            .get('/global-stock-markets', { params: { area, type: 'MARKET' } })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchGold = (): Promise<GoldResponse> => {
    return new Promise((resolve, reject) => {
        vnscServiceDatafeed
            .get('/financial-data/gold')
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchGoldChart = (days: MetalChartDays = 30): Promise<GoldChartResponse> => {
    return new Promise((resolve, reject) => {
        vnscServiceDatafeed
            .get('/financial-data/gold-chart', { params: { days } })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchSilver = (): Promise<SilverResponse> => {
    return new Promise((resolve, reject) => {
        vnscServiceDatafeed
            .get('/financial-data/silver')
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchSilverChart = (days: MetalChartDays = 30): Promise<SilverChartResponse> => {
    return new Promise((resolve, reject) => {
        vnscServiceDatafeed
            .get('/financial-data/silver-chart', { params: { days } })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchMetalProviders = (): Promise<MetalProvidersResponse> => {
    return new Promise((resolve, reject) => {
        vnscServiceDatafeed
            .get('/financial-data/metal-providers')
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchOil = (): Promise<OilResponse> => {
    return new Promise((resolve, reject) => {
        vnscServiceDatafeed
            .get('/financial-data/oil')
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchCryptoTopTrending = (): Promise<CryptoResponse> => {
    return new Promise((resolve, reject) => {
        vnscServiceDatafeed
            .get('/financial-data/cryptos/top-trending')
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
