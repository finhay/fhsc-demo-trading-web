export type StockEventType =
    | 'RIGHT_TO_GENERAL_MEETING'
    | 'CASH_DIVIDEND'
    | 'STOCK_DIVIDEND'
    | 'STOCK_SPLIT'
    | 'RIGHT_ISSUE'
    | string;

export interface StockEvent {
    id: number;
    path: string;
    title: string;
    stock: string;
    body: string;
    createdDate: string;
    actionDate: string;
    gdkhqDate: string;
    eventType: StockEventType;
    eventTypeName: string;
    createdAt: string;
    updatedAt: string;
    url: string;
}

export interface StockNewsParams {
    stock: string;
    from_date: string;
    to_date: string;
}

export interface StockNewsResponse {
    error_code: string;
    message: string;
    result: StockEvent[];
}
