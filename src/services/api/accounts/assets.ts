import { vnscService } from '@/services/interceptor';
import type { AssetSnapshotResponse, AssetsSummaryResponse } from '@/types/accounts/assets';
import type { BankAccountDepositResponse } from '@/types/accounts/bank';

export const getAssetsSummaryV3 = (): Promise<AssetsSummaryResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/accounts/v3/users/:user_id/assets/summary`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const getAssetsSummaryV4 = (): Promise<AssetsSummaryResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/accounts/v4/users/:user_id/assets/summary`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const getSubAccountDeposit = (subAccountId: string): Promise<BankAccountDepositResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/accounts/v3/users/:user_id/sub-accounts/${subAccountId}/deposit`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const getAssetSnapshot = (
    limitDays: number = 365,
    isSample: boolean = false,
    sampleSize: number = 8,
): Promise<AssetSnapshotResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/accounts/v2/users/:user_id/asset-snapshot`, {
                params: {
                    limit_days: limitDays,
                    is_sample: isSample,
                    sample_size: sampleSize,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
