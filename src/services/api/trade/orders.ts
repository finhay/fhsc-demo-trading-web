import { vnscService } from '@/services/interceptor';
import type {
    AvailableTradeResponse,
    CancelOrderResponse,
    CreateOrderResponse,
    OrderBookOrderDetailResponse,
    OrderBookResponse,
    OrderConditionsResponse,
    OrderTypesResponse,
    UpdateOrderResponse,
} from '@/types/trade/orders';

export const fetchSubAccountAvailableTrade = (
    subAccountId: string,
    side: string,
    symbol: string,
    price: number,
): Promise<AvailableTradeResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/trade/v2/accounts/${subAccountId}/available-trade`, {
                params: {
                    orderSide: side,
                    symbol,
                    quotePrice: price,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchOrderTypesAllowedForExchange = (exchange: string) => {
    return new Promise<OrderTypesResponse>((resolve, reject) => {
        vnscService
            .get(`/trade/market/session`, {
                params: {
                    exchange,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchSubAccountActiveOrderBook = (
    subAccountId: string,
): Promise<OrderBookResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/trade/v1/accounts/${subAccountId}/order-book`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const fetchOrderBookOrderDetail = (
    subAccountId: string,
    orderId: string | number,
): Promise<OrderBookOrderDetailResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/trade/v1/accounts/${subAccountId}/order-book/${orderId}`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
export const fetchSubAccountConditionalOrdersPage = (
    subAccountId: string,
    page: number,
): Promise<OrderConditionsResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/trade/accounts/${subAccountId}/order-conditions`, {
                params: {
                    page,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const placeSubAccountOrder = (subAccountId: string, data: any) => {
    if (data.type === 'LIMIT') {
        data.market_price = null;
    }

    if (data.type === 'MARKET') {
        data.limit_price = null;
    }

    const payLoad = {
        sub_account: data.sub_account,
        cus_id: data.cust_id,
        side: data.side,
        symbol: data.symbol,
        quantity: data.quantity,
        type: data.type,
        limit_price: data.limit_price,
        market_price: data.market_price,
        channel: 'ONLINE',
        stock_type: data.stock_type || 'STOCK',
        strategy_id: data.strategy_id || null,
        advance_amount: data.advance_amount || null,
        order_condition_type: data.order_condition_type,
        execution_date: data?.execution_date,
        expired_date: data?.expired_date,
        validation_type: data.validation_type,
    };

    return new Promise<CreateOrderResponse>((resolve, reject) => {
        vnscService
            .post(`/trade/v4/sub-accounts/${subAccountId}/orders`, payLoad, {
                params: {
                    tokenType: '2FA',
                },
                headers: {
                    tokenType: '2FA',
                    'validation-type': data.validation_type,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const updateSubAccountOrder247 = (subAccountId: string, orderId: string, data: any) => {
    const payLoad = {
        sub_account: data.sub_account,
        cus_id: data.cus_id,
        channel: 'ONLINE',
        quantity: Number(data.quantity),
        price: Number(data.price),
        expired_date: data.expired_date,
        execution_date: data.execution_date,
        order_condition_type: data.order_condition_type,
    };

    return new Promise<UpdateOrderResponse>((resolve, reject) => {
        vnscService
            .put(`/trade/sub-accounts/${subAccountId}/orders/${orderId}`, payLoad, {
                params: {
                    tokenType: '2FA',
                },
                headers: {
                    tokenType: '2FA',
                    'validation-type': data.validation_type,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const updateSubAccountStockOrder = (subAccountId: string, orderId: string, data: any) => {
    const payLoad = {
        sub_account: data.sub_account,
        cus_id: data.cus_id,
        quantity: Number(data.quantity),
        price: Number(data.price),
        channel: 'ONLINE',
    };

    return new Promise<UpdateOrderResponse>((resolve, reject) => {
        vnscService
            .put(`/trade/v2/sub-accounts/${subAccountId}/orders/${orderId}`, payLoad, {
                params: {
                    tokenType: '2FA',
                },
                headers: {
                    tokenType: '2FA',
                    'validation-type': data.validation_type,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const cancelSubAccountOrder247 = (subAccountId: string, orderId: string, data: any) => {
    const payLoad = {
        channel: 'ONLINE',
        order_condition_type: data.order_condition_type,
    };

    return new Promise<CancelOrderResponse>((resolve, reject) => {
        vnscService
            .delete(`/trade/sub-accounts/${subAccountId}/orders/${orderId}`, {
                params: {
                    tokenType: '2FA',
                },
                headers: {
                    tokenType: '2FA',
                    'validation-type': data.validation_type,
                },
                data: payLoad,
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const cancelSubAccountStockOrder = (subAccountId: string, orderId: string, data: any) => {
    const payLoad = {
        sub_account: data.sub_account,
        cus_id: data.cus_id,
        channel: 'ONLINE',
    };

    return new Promise<CancelOrderResponse>((resolve, reject) => {
        vnscService
            .delete(`/trade/v2/sub-accounts/${subAccountId}/orders/${orderId}`, {
                params: {
                    tokenType: '2FA',
                },
                headers: {
                    tokenType: '2FA',
                    'validation-type': data.validation_type,
                },
                data: payLoad,
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
