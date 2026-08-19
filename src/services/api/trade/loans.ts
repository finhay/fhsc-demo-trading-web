import { vnscService } from '@/services/interceptor';
import type { LoansResponse } from '@/types/trade/loans';

export const fetchSubAccountLoanRepaymentHistory = (
    accountId: string,
    fromDate: string,
    toDate: string,
): Promise<LoansResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/trade/sub-accounts/${accountId}/repayment-history`, {
                params: {
                    fromDate,
                    toDate,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchSubAccountOutstandingLoans = (
    accountId: string,
    fromDate: string,
    toDate: string,
): Promise<LoansResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/trade/sub-accounts/${accountId}/loans`, {
                params: {
                    fromDate,
                    toDate,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
