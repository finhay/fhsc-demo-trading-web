import type { OrderSide } from '@/types/trade/iceberg-orders';

export type TwapLoUrgency = 'SLOW' | 'NORMAL' | 'FAST';

export type TwapLoDetailView = 'detail' | 'cancel_confirm';

export type PendingTwapLoOrder = {
    side: 'BUY' | 'SELL';
    price: number;
    quantity: number;
    urgency: TwapLoUrgency;
    startAt: string;
};

export type TwapLoStatus =
    | 'RECEIVED'
    | 'PENDING'
    | 'ACTIVE'
    | 'CANCELLING'
    | 'COMPLETED'
    | 'PARTIALLY_MATCHED'
    | 'EXPIRED'
    | 'CANCELLED';

export type TwapLoSliceStatus =
    | 'PENDING'
    | 'DISPATCHING'
    | 'PLACED'
    | 'MATCHED'
    | 'CANCELLING'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'FAILED'
    | 'CARRIED_OVER';

export type TwapLoSliceDto = {
    id?: number;
    seq: number;
    plannedQty: number;
    orderQty?: number;
    matchedQty?: number;
    matchedPrice?: number;
    scheduledAt: string;
    status?: TwapLoSliceStatus;
    exchangeOrderRef?: string | null;
    placedAt?: string | null;
    reason?: string | null;
};

export type TwapLoOrderDto = {
    id?: number;
    accountId?: string;
    symbol: string;
    side: OrderSide;
    orderQty: number;
    price: number;
    urgency: TwapLoUrgency;
    startAt: string;
    endAt: string;
    status?: TwapLoStatus;
    n: number;
    matchedQty?: number;
    leavesQty?: number;
    createdAt?: string;
    reason?: string | null;
    slices: TwapLoSliceDto[];
};

export type CreateTwapLoOrderRequest = {
    side: OrderSide;
    symbol: string;
    q_lo: number;
    limit_price: number;
    urgency: TwapLoUrgency;
    start_at?: string;
    risk_acknowledged?: boolean;
    validation_type?: string;
};

export type CancelTwapLoOrderRequest = {
    reason?: string;
    validation_type?: string;
};

export type TwapLoReportOrder = {
    id: number;
    accountId: string;
    depositoryNumber?: string;
    symbol: string;
    side: OrderSide;
    price: number;
    orderQty: number;
    matchedQty: number;
    startAt: string;
    endAt: string;
};

export type TwapLoReportMetrics = {
    matchedAvgPrice: number;
    marketAvgPrice: number;
};

export type TwapLoMarketPoint = {
    at: number;
    price: number;
};

export type TwapLoMatchedPoint = {
    at: number;
    price: number;
    qty: number;
};

export type TwapLoReportSeries = {
    stepMs: number;
    market: TwapLoMarketPoint[];
    matched: TwapLoMatchedPoint[];
};

export type TwapLoReport = {
    order: TwapLoReportOrder;
    metrics: TwapLoReportMetrics;
    series: TwapLoReportSeries;
};

export type TwapLoOrderResponse = {
    error_code: string;
    message: string;
    data: TwapLoOrderDto;
    traceId?: string;
};

export type TwapLoOrderListData = {
    total_page: number;
    total_element: number;
    content: TwapLoOrderDto[];
};

export type TwapLoOrderListResponse = {
    error_code: string;
    message: string;
    data: TwapLoOrderListData;
    traceId?: string;
};

export type TwapLoCreatedResponse = {
    error_code: string;
    message: string;
    data: {
        id: number;
    };
    traceId?: string;
};

export type CancelTwapLoOrderResponse = {
    error_code: string;
    message: string;
    data: null;
    traceId?: string;
};

export type TwapLoReportResponse = {
    error_code: string;
    message: string;
    data: TwapLoReport;
    traceId?: string;
};
