import { paperTradingService } from '@/services/interceptor';
import type {
    PaperOrderBookResponse,
    PaperOrderHistoryParams,
    PaperOrderHistoryResponse,
    PaperOrderResponse,
    PlacePaperOrderPayload,
    UpdatePaperOrderPayload,
} from '@/types/paper-trading/orders';

export const placePaperOrder = (
    subAccountId: string,
    payload: PlacePaperOrderPayload,
): Promise<PaperOrderResponse> => {
    return new Promise((resolve, reject) => {
        paperTradingService
            .post(`/v1/accounts/${subAccountId}/orders`, payload)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchPaperOrderBook = (
    subAccountId: string,
    date?: string,
): Promise<PaperOrderBookResponse> => {
    return new Promise((resolve, reject) => {
        paperTradingService
            .get(`/v1/accounts/${subAccountId}/orders`, {
                params: {
                    date,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchPaperOrderDetail = (
    subAccountId: string,
    orderId: string,
): Promise<PaperOrderResponse> => {
    return new Promise((resolve, reject) => {
        paperTradingService
            .get(`/v1/accounts/${subAccountId}/orders/${orderId}`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const updatePaperOrder = (
    subAccountId: string,
    orderId: string,
    payload: UpdatePaperOrderPayload,
): Promise<PaperOrderResponse> => {
    return new Promise((resolve, reject) => {
        paperTradingService
            .patch(`/v1/accounts/${subAccountId}/orders/${orderId}`, payload)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const cancelPaperOrder = (
    subAccountId: string,
    orderId: string,
): Promise<PaperOrderResponse> => {
    return new Promise((resolve, reject) => {
        paperTradingService
            .delete(`/v1/accounts/${subAccountId}/orders/${orderId}`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchPaperOrderHistory = (
    subAccountId: string,
    params: PaperOrderHistoryParams,
): Promise<PaperOrderHistoryResponse> => {
    return new Promise((resolve, reject) => {
        paperTradingService
            .get(`/v1/accounts/${subAccountId}/orders/history`, { params })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
