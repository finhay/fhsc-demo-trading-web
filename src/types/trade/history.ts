export type OrderHistory = {
    order_id: string;
    account_id: string;
    tx_date: string;
    symbol: string;
    side: string;
    order_qtty: number;
    quote_price: number;
    exec_qtty: number;
    exec_price: number;
    status: string;
    fee_amt: number;
    tax_amt: number;
    exec_amt: number;
    orderType: string;
};

export type CashAdvance = {
    order_date: string;
    account_id: string;
    tx_date: string;
    clear_date: string;
    amt: number;
    advanced_amt: number;
    fee_amt: number;
    receive_amt: number;
    advanced_days: number;
    advanced_status: string;
    advanced_place: string;
};

export type OrderHistoryResponse = {
    error_code: string;
    message: string;
    result: {
        data: OrderHistory[];
        next_page: number;
    };
};

export type CashAdvanceResponse = {
    error_code: string;
    message: string;
    result: CashAdvance[];
};

export type MatchedOrderHistoryItem = {
    quantity_matched: number;
    price_matched: number;
    order_side: string;
    transaction_date: string;
    volume: number;
    order_id: string;
};

export type MatchedOrderSymbol = {
    symbol: string;
    total_quantity: number;
    total_volume: number;
    average_price: number;
    history: MatchedOrderHistoryItem[];
};

export type MatchedOrdersResponse = {
    error_code: string;
    message: string;
    data?: MatchedOrderSymbol[];
};
