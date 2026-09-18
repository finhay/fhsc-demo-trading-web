import type { PaperTradingResponse } from '@/types/paper-trading/common';

export type PaperRightEventType =
    | 'STOCK_DIVIDEND'
    | 'BONUS_SHARE'
    | 'RIGHTS_OFFERING'
    | 'CASH_DIVIDEND';

export type PaperRightItem = {
    camast_id: string;
    symbol: string;
    event_type: PaperRightEventType;
    status_code: string;
    status: string;
    ex_date: string;
    record_date: string | null;
    deliver_at: string;
    received_at: string | null;
    ratio: string | null;
    owned_quantity: number;
    entitled_quantity: number;
    /** Đơn giá mua 1 CP của quyền mua (VND); loại khác 0; null ở quyền chốt trước khi có field */
    exercise_price: number | null;
    exercise_amount: number;
    dividend_amount: number;
};

export type PaperRightsListParams = {
    /** YYYY-MM-DD — bắt buộc */
    from_date: string;
    /** YYYY-MM-DD — bắt buộc */
    to_date: string;
    page?: number;
};

export type PaperRightsListData = {
    data: PaperRightItem[];
    page: number;
    size: number;
    total: number;
    totalPages: number;
};

export type PaperRightsListResponse = PaperTradingResponse<PaperRightsListData>;
