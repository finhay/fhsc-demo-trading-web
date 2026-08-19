export type OrderSide = 'BUY' | 'SELL';

export type IcebergOrderStatus =
    | 'RECEIVED'
    | 'WAITING_TO_SEND'
    | 'SENDING'
    | 'SENT'
    | 'MATCHED'
    | 'MATCHED_ALL'
    | 'CANCELLING'
    | 'CANCELLED'
    | 'FAILED'
    | 'COMPLETED';

export type IcebergSliceStatus = 'PENDING' | 'PLACED' | 'MATCHED' | 'CANCELLED' | 'FAILED';

export type IcebergSliceDto = {
    id: number;
    slice_index: number;
    quantity: number;
    order_status: IcebergSliceStatus;
    order_id: string | null;
    matched_quantity: number;
    matched_price: number;
    placed_at: string | null;
};

export type IcebergOrderDto = {
    order_id: number;
    account_id: string;
    symbol: string;
    order_side: OrderSide;
    total_quantity: number;
    display_size: number;
    limit_price: number;
    order_status: IcebergOrderStatus;
    placed_quantity: number;
    matched_quantity: number;
    matched_price: number;
    slices: IcebergSliceDto[];
};

export type SlicePreview = {
    index: number;
    quantity: number;
    limitPrice: number;
};

export type IcebergOrderPreview = {
    symbol: string;
    side: OrderSide;
    totalQuantity: number;
    displaySize: number;
    limitPrice: number;
    sliceCount: number;
    slices: SlicePreview[];
};

export type CreateIcebergOrderRequest = {
    sub_account?: string;
    side: OrderSide;
    symbol: string;
    total_quantity: number;
    display_size: number;
    limit_price: number;
    validation_type?: string;
};

export type CancelIcebergOrderRequest = {
    sub_account?: string;
    validation_type?: string;
};

export type IcebergOrderPreviewResponse = {
    error_code: string;
    message: string;
    data: IcebergOrderPreview;
};

export type IcebergOrderResponse = {
    error_code: string;
    message: string;
    data: IcebergOrderDto;
};

export type IcebergOrderListResponse = {
    error_code: string;
    message: string;
    data: IcebergOrderDto[];
};

export type CancelIcebergOrderResponse = {
    error_code: string;
    message: string;
    data: null;
};
