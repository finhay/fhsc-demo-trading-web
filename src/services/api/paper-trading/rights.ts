import { paperTradingService } from '@/services/interceptor';
import type {
    PaperRightsListParams,
    PaperRightsListResponse,
} from '@/types/paper-trading/rights';

export const fetchPaperAccountRights = (
    subAccountId: string,
    params: PaperRightsListParams,
): Promise<PaperRightsListResponse> => {
    return new Promise((resolve, reject) => {
        paperTradingService
            .get(`/v1/accounts/${subAccountId}/rights`, { params })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
