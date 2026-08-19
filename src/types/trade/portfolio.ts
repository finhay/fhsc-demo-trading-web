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

export type AccountSummary = {
    accountId: string;
    balance: number;
    available_balance: number;
    buying_power: number;
    total_asset: number;
    total_market_value: number;
    profit_loss: number;
    profit_loss_percent: number;
};

export type AccountSummaryResponse = {
    error_code: string;
    message: string;
    result: AccountSummary;
};

export type PortfolioItem = {
    sub_account_id: string;
    symbol: string;
    securities_type: string;
    total: number;
    available: number;
    blocked: number;
    mortgage: number;
    vsd_mortgage: number;
    restrict: number;
    receiving_right: number;
    receiving_t0: number;
    receiving_t1: number;
    receiving_t2: number;
    matching_amount: number;
    withdraw: number;
    cost_price: number;
    basic_price: number;
    is_sellable: boolean;
    custodycd: string;
    pnl_amount: number;
    pnl_rate: number;
    close_price: number;
    cost_price_amount: number;
    basic_price_amount: number;
    total_pnl: number;
    sending_t0: number;
    sending_t1: number;
    sending_t2: number;
    has_newest_news: boolean;
    trade: number;
};

export type AccountPortfolioResponse = {
    error_code: string;
    message: string;
    data: {
        portfolio: PortfolioItem[];
    };
};

export type SellOrderPnlItem = {
    orderId: string;
    subAccountId: string;
    symbol: string;
    sellingDate: string;
    costPrice: number;
    matchedPrice: number;
    percentPNL: number;
    value: number;
};

export type SellOrdersPnlResponse = {
    error_code: string;
    message: string;
    data: {
        data: SellOrderPnlItem[];
        nextPage: number | null;
    };
};
