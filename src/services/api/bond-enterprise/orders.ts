import { vnscService } from '@/services/interceptor';
import type {
    HaybondBuyingPayload,
    HaybondBuyingResponse,
    HaybondCashFlowPreviewResponse,
    HaybondEstimatePayload,
    HaybondEstimateResponse,
    HaybondFlexibleBuyingPayload,
    HaybondFlexibleBuyingResponse,
    HaybondFlexibleEstimatePayload,
    HaybondFlexibleEstimateResponse,
    HaybondFlexibleOrderDetailResponse,
    HaybondOrderDetailResponse,
    HaybondOrderPreviewResponse,
    HaybondOrdersHistoriesResponse,
    HaybondSellEstimateResponse,
    HaybondSellPreviewResponse,
} from '@/types/bond-enterprise/orders';

export const fetchHayBondFlexibleOrderDetail = (
    id: string,
): Promise<HaybondFlexibleOrderDetailResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/bond-enterprise/v1/orders/${id}/command`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchHayBondOrdersHistories = (params: {
    page: number;
    status: string;
}): Promise<HaybondOrdersHistoriesResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get('/bond-enterprise/v1/orders/histories', {
                params: params.status
                    ? { page: params.page, status: params.status }
                    : { page: params.page },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const postHayBondOrdersEstimate = (
    data: HaybondEstimatePayload,
): Promise<HaybondEstimateResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post('/bond-enterprise/v1/orders/estimate', data)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const postHayBondDynamicOrdersEstimate = (
    data: HaybondFlexibleEstimatePayload,
): Promise<HaybondFlexibleEstimateResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post('/bond-enterprise/v1/flexible-packages/estimate', data)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const getHayBondDynamicSellOrdersEstimate = (): Promise<HaybondSellEstimateResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get('/bond-enterprise/v1/flexible-saving-books/closing/estimate')
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const getHayBondDynamicCashFlow = (
    amount: number,
): Promise<HaybondCashFlowPreviewResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(
                `/bond-enterprise/v1/flexible-saving-books/closing/preview-cash-flow?amount=${amount}`,
            )
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const getHayBondSellOrdersPreview = (
    amount: number,
): Promise<HaybondSellPreviewResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/bond-enterprise/v1/flexible-saving-books/closing/preview?amount=${amount}`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const postHayBondOrdersPreview = (
    data: HaybondEstimatePayload,
): Promise<HaybondOrderPreviewResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post('/bond-enterprise/v1/orders/preview', data)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const postHayBondPackagesBuying = (
    data: HaybondBuyingPayload,
    token: string,
): Promise<HaybondBuyingResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post('/bond-enterprise/v1/packages/buying', data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    skipAutoAuth: true,
                },
                skipRefreshRetry: true,
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const postHayBondDynamicPackagesBuying = (
    data: HaybondFlexibleBuyingPayload,
    token: string,
): Promise<HaybondFlexibleBuyingResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post('/bond-enterprise/v1/flexible-packages/buying', data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    skipAutoAuth: true,
                },
                skipRefreshRetry: true,
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchHayBondOrdersDetail = (id: string): Promise<HaybondOrderDetailResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/bond-enterprise/v1/orders/${id}`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
