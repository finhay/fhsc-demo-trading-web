import { DEFAULT_PARAMS } from '@/constants/haypoint';
import { vnscService } from '@/services/interceptor';
import type {
    ClaimRewardBody,
    ClaimRewardResponse,
    GetListingBrandResponse,
    GetListingCategoryResponse,
    GetListingRewardResponse,
    GetOwnedRewardOfficesResponse,
    GetOwnedRewardsResponse,
    GetPointHistoriesResponse,
    GetPointResponse,
    PatchOwnedRewardMarkUsedResponse,
} from '@/types/reward';

export const fetchRewardsByBrandId = (brand_id: string): Promise<GetListingRewardResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/reward/v1/reward/listing-reward`, {
                params: {
                    partner_id: DEFAULT_PARAMS.PARTNER_ID,
                    size: DEFAULT_PARAMS.PAGE_SIZE,
                    page: DEFAULT_PARAMS.PAGE,
                    brand_id,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchUserHaypoint = (): Promise<GetPointResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/reward/v1/point`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchRewardBrandList = (
    page: number,
    category_id?: string,
    keyword?: string,
): Promise<GetListingBrandResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/reward/v1/reward/listing-brand`, {
                params: {
                    partner_id: DEFAULT_PARAMS.PARTNER_ID,
                    size: DEFAULT_PARAMS.PAGE_SIZE,
                    page,
                    category_id,
                    keyword,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchRewardCategoryList = (page: number): Promise<GetListingCategoryResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/reward/v1/reward/listing-category`, {
                params: {
                    partner_id: DEFAULT_PARAMS.PARTNER_ID,
                    size: DEFAULT_PARAMS.PAGE_SIZE,
                    page,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchHaypointTransactionHistory = (
    type: string,
    next_offset?: number,
): Promise<GetPointHistoriesResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/reward/v1/point-histories`, {
                params: {
                    size: DEFAULT_PARAMS.PAGE_SIZE,
                    type,
                    ...(next_offset && { next_offset }),
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchOwnedVouchers = (): Promise<GetOwnedRewardsResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/reward/v1/reward/owned-rewards`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchVoucherAcceptanceStores = (
    reward_id: string,
    page: number,
    keyword?: string,
): Promise<GetOwnedRewardOfficesResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/reward/v1/reward/offices`, {
                params: {
                    partner_id: DEFAULT_PARAMS.PARTNER_ID,
                    reward_id,
                    page,
                    size: DEFAULT_PARAMS.PAGE_SIZE,
                    keyword,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const redeemRewardWithPoints = (
    body: ClaimRewardBody,
    token: string,
): Promise<ClaimRewardResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post(`/reward/v1/reward/claim`, body, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    skipAutoAuth: true,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const markOwnedVoucherAsUsed = (id: number): Promise<PatchOwnedRewardMarkUsedResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .patch(`/reward/v1/reward/owned-reward/${id}/mark-used`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
