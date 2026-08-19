import { vnscService } from '@/services/interceptor';
import type {
    FundCertificateDetailResponse,
    FundCertificatesResponse,
    FundListingResponse,
    FundMarketSummaryResponse,
    FundNavChartPeriod,
    FundNavHistoriesResponse,
    FundSuggestionsResponse,
    FundTopFundFlowResponse,
    FundTopGrowthResponse,
    FundTopGrowthSortBy,
    FundType,
} from '@/types/pages/fund';

export const fetchFundCertificates = (fundType: FundType): Promise<FundCertificatesResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get('/fund/public/fund-certificates', { params: { 'fund-type': fundType } })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchFundCertificateList = (): Promise<FundCertificatesResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get('/fund/v2/fund-certificates', { skipRefreshRetry: true })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchFundTopGrowth = (
    sortBy: FundTopGrowthSortBy,
    fundType?: FundType,
): Promise<FundTopGrowthResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get('/fund/public/fund-certificates/top-growth', {
                params: {
                    'sort-by': sortBy,
                    ...(fundType ? { 'fund-type': fundType } : {}),
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchFundTopFundFlow = (fundType?: FundType): Promise<FundTopFundFlowResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get('/fund/public/fund-certificates/top-fund-flow', {
                params: fundType ? { 'fund-type': fundType } : undefined,
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchFundMarketSummary = (): Promise<FundMarketSummaryResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get('/fund/public/fund-certificates/market-summary')
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchFundCertificateDetail = (
    fundName: string,
): Promise<FundCertificateDetailResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/fund/v1/fund-certificates/${fundName}`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchFundNavHistories = (
    fundName: string,
    period: FundNavChartPeriod = 'ONE_YEAR',
): Promise<FundNavHistoriesResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/fund/v1/fund-certificates/${fundName}/nav-histories`, { params: { period } })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchFundListing = (fundName: string): Promise<FundListingResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/fund/public/v1/fund-listings/${fundName}`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchFundSuggestions = (fundName: string): Promise<FundSuggestionsResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/fund/public/fund-certificates/${fundName}/suggestions`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
