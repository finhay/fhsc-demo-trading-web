import { paperTradingService } from '@/services/interceptor';
import type {
    PaperAccountAssetResponse,
    PaperBuyingPowerResponse,
    PaperPortfolioResponse,
} from '@/types/paper-trading/account';

export const registerPaperAccount = (accountId: string): Promise<PaperAccountAssetResponse> => {
    return new Promise((resolve, reject) => {
        paperTradingService
            .post('/v1/accounts', { account_id: accountId })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchPaperAccountAsset = (
    subAccountId: string,
): Promise<PaperAccountAssetResponse> => {
    return new Promise((resolve, reject) => {
        paperTradingService
            .get(`/v1/accounts/${subAccountId}/asset`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchPaperAccountPortfolio = (
    subAccountId: string,
): Promise<PaperPortfolioResponse> => {
    return new Promise((resolve, reject) => {
        paperTradingService
            .get(`/v1/accounts/${subAccountId}/portfolio`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchPaperAccountBuyingPower = (
    subAccountId: string,
    symbol: string,
    price: number,
): Promise<PaperBuyingPowerResponse> => {
    return new Promise((resolve, reject) => {
        paperTradingService
            .get(`/v1/accounts/${subAccountId}/buying-power`, {
                params: {
                    symbol,
                    price,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
