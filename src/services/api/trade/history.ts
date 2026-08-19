import { vnscService } from '@/services/interceptor';
import type {
    CashAdvanceResponse,
    MatchedOrdersResponse,
    OrderHistoryResponse,
} from '@/types/trade/history';

export const fetchSubAccountOrderHistoryPage = (
    accountId: string,
    fromDate: string,
    toDate: string,
    page: number,
): Promise<OrderHistoryResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/trade/accounts/${accountId}/order-history`, {
                params: {
                    from_date: fromDate,
                    to_date: toDate,
                    page,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchSubAccountMatchedOrdersReport = (
    subAccountId: string,
    side: string,
    tradingDate: string,
): Promise<MatchedOrdersResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/trade/reports/trading/sub-accounts/${subAccountId}`, {
                params: { side, trading_date: tradingDate },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchSubAccountCashAdvanceHistory = (
    accountId: string,
    fromDate: string,
    toDate: string,
): Promise<CashAdvanceResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/trade/accounts/${accountId}/cash-advance`, {
                params: {
                    from_date: fromDate,
                    to_date: toDate,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
