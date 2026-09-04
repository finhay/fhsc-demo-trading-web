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

/** Item sổ lệnh từ `GET /v1/accounts/{id}/orders`. */
export type PaperOrderBookItem = {
    side_code: string;
    status_code: string;
    lot_type: string;
    fee_amount: number;
    tax_amount: number;
    odorderid: string;
    symbol: string;
    /** Nhãn hiển thị: "Mua" | "Bán" */
    side: string;
    price: number;
    pricetype: string;
    qtty: number;
    execqtty: number;
    execamt: number;
    execprice: number | null;
    remainqtty: number;
    remainamt: number;
    /** Nhãn trạng thái hiển thị từ BE */
    status: string;
    allowcancel: string;
    allowamend: string;
    feedbackmsg: string | null;
    txdate: string;
    txtime: string;
};

export type PaperOrderBookResponse = PaperTradingResponse<PaperOrderBookItem[]>;

export type PaperOrderBookItemResponse = PaperTradingResponse<PaperOrderBookItem>;

/** Item lịch sử lệnh từ `GET /v1/accounts/{id}/orders/history`. */
export type PaperOrder = {
    id: string;
    account_id: string;
    symbol: string;
    side: PaperOrderSide;
    order_type: PaperOrderType;
    lot_type: string;
    /** Mã trạng thái tiếng Anh: New | Filled | Expired | … */
    order_status: string;
    status_code: string;
    /** Nhãn trạng thái hiển thị từ BE */
    status: string;
    quantity: number;
    price: number;
    fill_quantity: number;
    leave_quantity: number;
    last_price: number | null;
    average_price: number | null;
    fill_value: number;
    fee_amount: number;
    tax_amount: number;
    board_code: string | null;
    exec_type: string | null;
    created_date: string;
    error: string | null;
    text: string | null;
};

export type PaperOrderResponse = PaperTradingResponse<PaperOrder>;

export type PaperOrderHistoryParams = {
    /** YYYY-MM-DD — bắt buộc */
    from_date: string;
    /** YYYY-MM-DD — bắt buộc */
    to_date: string;
    symbol?: string;
    page?: number;
};

export type PaperOrderHistoryData = {
    data: PaperOrder[];
    page: number;
    size: number;
    total: number;
    totalPages: number;
};

export type PaperOrderHistoryResponse = PaperTradingResponse<PaperOrderHistoryData>;
