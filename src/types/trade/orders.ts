export type OrderTypesData = {
    available_order_types: string[];
    exchange_session: string;
    exchange: string;
};

export type OrderTypesResponse = {
    error_code: string;
    message: string;
    result: OrderTypesData;
};

export type OrderBook = {
    custodycd: string | null;
    txdate: string;
    custid: string;
    afacctno: string | null;
    orderid: string | null;
    odorderid: string | null;
    txtime: string;
    symbol: string;
    allowcancel: string;
    allowamend: string;
    side_code: string | null;
    side: string | null;
    price: number;
    pricetype: string | null;
    via_code: string | null;
    via: string | null;
    qtty: number;
    execqtty: number;
    execamt: number;
    execprice: number;
    remainqtty: number;
    remainamt: number;
    status_code: string;
    status: string;
    tlname: string | null;
    username: string | null;
    hosesession: string | null;
    cancelqtty: number | null;
    adjustqtty: number | null;
    isdisposal: string | null;
    rootorderid: string | null;
    timetype: string | null;
    timetypevalue: string | null;
    feedbackmsg: string | null;
    quoteqtty: number | null;
    limitprice: number | null;
    odtimestamp: string | null;
    matchtype_code: string | null;
    producttypename: string | null;
    afacctno_ext: string | null;
    side_: string | null;
    via_: string | null;
    status_: string | null;
    matchtype_: string | null;
    strategy_id: string | null;
};

export type OrderBookResponse = {
    popup_message: string | null;
    error_code: string;
    message: string;
    result: OrderBook[];
    title: string | null;
};

export type OrderItem = {
    order_id: string;
    account_id: string;
    transaction_date: string;
    symbol: string;
    order_side: string;
    order_quantity: number;
    limit_price: number | null;
    market_price: number | null;
    execute_quantity: number;
    execute_price: number;
    order_status: string;
    fee_amount: number;
    tax_amount: number;
    execute_amount: number;
    order_type: string;
    order_condition_type: string | null;
    rejected_reason: string | null;
    code: string;
    lot: string;
};

export type CreateOrderResponse = {
    error_code: string;
    message: string;
    data: OrderItem[];
};

export type UpdateOrderResponse = {
    error_code: string;
    message: string;
    data: OrderItem[];
};

export type CancelOrderResponse = {
    error_code: string;
    message: string;
    data: OrderItem[];
};

export type OrderConditionItem = {
    order_id: string | null;
    sub_account: string;
    account_id: string;
    market_price: number | null;
    order_condition_type: string;
    request_id: string;
    group_id: string;
    created_at: string;
    updated_at: string;
    execution_date: string;
    expired_date: string;
    place_time: string | null;
    strategy_id: string | null;
    id: number;
    side: string;
    symbol: string;
    quantity: number;
    price: number;
    status: string;
    message: string | null;
    version: number;
};

export type OrderConditionsResponse = {
    error_code: string;
    message: string;
    data: {
        data: OrderConditionItem[];
        nextPage: number;
    };
};

export type AvailableTrade = {
    ppse: number;
    maxqtty: number;
    trade: number;
    mrratioloan: string;
    pp0: number;
    balance: number;
    cash_pending_send: number;
    mortgage: number;
    marginrate: number;
};

export type AvailableTradeResponse = {
    error_code: string;
    message: string;
    result: AvailableTrade;
};

export type OrderBookHistoryItem = {
    custodycd: string | null;
    txdate: string;
    custid: string;
    afacctno: string | null;
    orderid: string | null;
    odorderid: string | null;
    txtime: string;
    symbol: string;
    allowcancel: 'Y' | 'N' | string;
    allowamend: 'Y' | 'N' | string;
    side_code: string;
    side: string;
    price: number;
    pricetype: string;
    via_code: string | null;
    via: string | null;
    qtty: number;
    execqtty: number;
    execamt: number;
    execprice: number;
    remainqtty: number;
    remainamt: number;
    status_code: string;
    status: string;
    tlname: string | null;
    username: string | null;
    hosesession: string | null;
    cancelqtty: number | null;
    adjustqtty: number | null;
    isdisposal: boolean | null;
    rootorderid: string | null;
    timetype: string | null;
    timetypevalue: string | null;
    feedbackmsg: string | null;
    quoteqtty: number | null;
    limitprice: number | null;
    odtimestamp: string;
    matchtype_code: string | null;
    producttypename: string | null;
    afacctno_ext: string | null;
    side_: string | null;
    via_: string | null;
    status_: string | null;
    matchtype_: string | null;
    strategy_id: string | null;
    reports: OrderBookHistoryReportItem[];
};

export type OrderBookHistoryReportItem = {
    account_id: string;
    order_status: string;
    leave_quantity: number;
    price_secure: number;
    order_type: string;
    fill_quantity: number;
    average_price: number;
    created_date: string;
    id: number;
    price: number;
    quantity: number;
};

export type OrderBookOrderDetailResponse = {
    error_code: string;
    message: string;
    data: OrderBookHistoryItem;
};
