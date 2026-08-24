import type { PaperTradingResponse } from '@/types/paper-trading/common';

export type PaperOrderSide = 'NB' | 'NS';

export type PaperOrderType = 'LO';

export type PlacePaperOrderPayload = {
    /** Để rỗng → server tự sinh UUID */
    cl_ord_id: string;
    side: PaperOrderSide;
    symbol: string;
    /** Lô chẵn — bội số của 100 */
    quantity: number;
    type: PaperOrderType;
    limit_price: number;
    channel: string;
};

export type UpdatePaperOrderPayload = {
    limit_price?: number;
    quantity?: number;
};

export type PaperOrder = {
    id: string;
    cl_ord_id: string;
    account_id: string;
    symbol: string;
    side: PaperOrderSide;
    type: PaperOrderType;
    order_status: string;
    quantity: number;
    price: number;
    fill_quantity: number;
    leave_quantity: number;
    fee_amount: number;
    created_date: string;
};

export type PaperOrderResponse = PaperTradingResponse<PaperOrder>;

export type PaperOrderBookResponse = PaperTradingResponse<PaperOrder[]>;

export type PaperOrderHistoryParams = {
    /** YYYY-MM-DD — bắt buộc */
    from_date: string;
    /** YYYY-MM-DD — bắt buộc */
    to_date: string;
    symbol?: string;
    page?: number;
};

/** Shape phân trang suy ra từ nghiệp vụ — BE chưa trả mẫu response trong Postman collection. */
export type PaperOrderHistoryData = {
    data: PaperOrder[];
    nextPage: number;
};

export type PaperOrderHistoryResponse = PaperTradingResponse<PaperOrderHistoryData>;
