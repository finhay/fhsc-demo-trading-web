import { vnscService } from '@/services/interceptor';
import { getUserId } from '@/services/localStorage';
import type {
    CancelTwapLoOrderRequest,
    CancelTwapLoOrderResponse,
    CreateTwapLoOrderRequest,
    TwapLoCreatedResponse,
    TwapLoOrderListResponse,
    TwapLoOrderResponse,
    TwapLoReportResponse,
    TwapLoStatus,
} from '@/types/trade/twap-lo';

const buildTwapLoPayload = (data: CreateTwapLoOrderRequest) => ({
    side: data.side,
    symbol: data.symbol,
    q_lo: data.q_lo,
    limit_price: data.limit_price,
    urgency: data.urgency,
    start_at: data.start_at,
    risk_acknowledged: data.risk_acknowledged,
});

export const previewTwapLoOrder = (
    accountId: string,
    data: CreateTwapLoOrderRequest,
): Promise<TwapLoOrderResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post(
                `/trade/v1/sub-accounts/${accountId}/orders/twap-lo/preview`,
                buildTwapLoPayload(data),
            )
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const createTwapLoOrder = (
    accountId: string,
    data: CreateTwapLoOrderRequest,
): Promise<TwapLoCreatedResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post(`/trade/v1/sub-accounts/${accountId}/orders/twap-lo`, buildTwapLoPayload(data), {
                params: {
                    tokenType: '2FA',
                },
                headers: {
                    tokenType: '2FA',
                    uid: String(getUserId()),
                    'x-validation-type': data.validation_type,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const cancelTwapLoOrder = (
    accountId: string,
    id: number | string,
    data?: CancelTwapLoOrderRequest,
): Promise<CancelTwapLoOrderResponse> => {
    const payLoad = data?.reason ? { reason: data.reason } : undefined;

    return new Promise((resolve, reject) => {
        vnscService
            .delete(`/trade/v1/sub-accounts/${accountId}/orders/twap-lo/${id}`, {
                params: {
                    tokenType: '2FA',
                },
                headers: {
                    tokenType: '2FA',
                    uid: String(getUserId()),
                    'x-validation-type': data?.validation_type,
                },
                data: payLoad,
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchSubAccountTwapLoOrders = (
    accountId: string,
    status?: TwapLoStatus,
): Promise<TwapLoOrderListResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/trade/v1/sub-accounts/${accountId}/orders/twap-lo`, {
                params: status ? { status } : undefined,
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchTwapLoOrderHistory = (
    accountId: string,
    from: string,
    to: string,
    status?: TwapLoStatus,
): Promise<TwapLoOrderListResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/trade/v1/sub-accounts/${accountId}/orders/twap-lo/history`, {
                params: {
                    from,
                    to,
                    ...(status ? { status } : {}),
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchTwapLoOrderDetail = (
    accountId: string,
    id: number | string,
): Promise<TwapLoOrderResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/trade/v1/sub-accounts/${accountId}/orders/twap-lo/${id}`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchTwapLoOrderById = (id: number | string): Promise<TwapLoOrderResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/trade/v1/orders/twap-lo/${id}`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchTwapLoOrderReport = (id: number | string): Promise<TwapLoReportResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/trade/v1/orders/twap-lo/${id}/report`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
