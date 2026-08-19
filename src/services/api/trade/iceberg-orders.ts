import { vnscService } from '@/services/interceptor';
import type {
    CancelIcebergOrderRequest,
    CancelIcebergOrderResponse,
    CreateIcebergOrderRequest,
    IcebergOrderListResponse,
    IcebergOrderPreviewResponse,
    IcebergOrderResponse,
    IcebergOrderStatus,
} from '@/types/trade/iceberg-orders';

export const previewIcebergOrder = (
    accountId: string,
    data: CreateIcebergOrderRequest,
): Promise<IcebergOrderPreviewResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post(`/trade/v1/sub-accounts/${accountId}/iceberg-orders/preview`, data)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const createIcebergOrder = (
    accountId: string,
    data: CreateIcebergOrderRequest,
): Promise<IcebergOrderResponse> => {
    const payLoad: CreateIcebergOrderRequest = {
        sub_account: data.sub_account,
        side: data.side,
        symbol: data.symbol,
        total_quantity: data.total_quantity,
        display_size: data.display_size,
        limit_price: data.limit_price,
    };

    return new Promise((resolve, reject) => {
        vnscService
            .post(`/trade/v1/sub-accounts/${accountId}/iceberg-orders`, payLoad, {
                params: {
                    tokenType: '2FA',
                },
                headers: {
                    tokenType: '2FA',
                    'x-validation-type': data.validation_type,
                    'x-channel': 'INTERNAL',
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchSubAccountIcebergOrders = (
    accountId: string,
    status?: IcebergOrderStatus,
): Promise<IcebergOrderListResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/trade/v1/sub-accounts/${accountId}/iceberg-orders`, {
                params: status ? { status } : undefined,
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchIcebergOrderDetail = (
    accountId: string,
    id: number | string,
): Promise<IcebergOrderResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/trade/v1/sub-accounts/${accountId}/iceberg-orders/${id}`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const cancelIcebergOrder = (
    accountId: string,
    id: number | string,
    data: CancelIcebergOrderRequest,
): Promise<CancelIcebergOrderResponse> => {
    const payLoad = data.sub_account != null ? { sub_account: data.sub_account } : undefined;

    return new Promise((resolve, reject) => {
        vnscService
            .delete(`/trade/v1/sub-accounts/${accountId}/iceberg-orders/${id}`, {
                params: {
                    tokenType: '2FA',
                },
                headers: {
                    tokenType: '2FA',
                    'x-validation-type': data?.validation_type,
                    'x-channel': 'INTERNAL',
                },
                data: payLoad,
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
