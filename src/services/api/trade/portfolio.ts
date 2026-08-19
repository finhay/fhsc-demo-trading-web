import { vnscService } from '@/services/interceptor';
import type { AccountPortfolioResponse, SellOrdersPnlResponse } from '@/types/trade/portfolio';

export const fetchSubAccountStockPortfolio = (
    accountId: string,
): Promise<AccountPortfolioResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/trade/v2/sub-accounts/${accountId}/portfolio`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchSubAccountSellOrdersPnl = (
    subAccountId: string,
    page: number,
): Promise<SellOrdersPnlResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/trade/sub-accounts/${subAccountId}/sell-orders-pnl`, {
                params: { page },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
