import { vnscService } from '@/services/interceptor';
import { getCustId } from '@/services/localStorage';
import type { SubAccountAssetSummaryResponse } from '@/types/trade/assets';

export const getSubAccountAssetSummary = (
    subAccountId: string,
): Promise<SubAccountAssetSummaryResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/trade/sub-accounts/${subAccountId}/asset-summary`, {
                params: { 'cache-control': 'NOCACHE' },
                headers: { 'cust-id': getCustId() || '' },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
