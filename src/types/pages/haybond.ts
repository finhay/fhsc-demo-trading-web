export type HaybondPaginatedState<T> = {
    isLoading: boolean;
    isLoadMore: boolean;
    content: T[];
    page: number;
    totalPages: number;
};

export type HaybondTermBuyFlowStep =
    | 'order'
    | 'confirm'
    | 'list-command'
    | 'otp'
    | 'success'
    | 'not-trade';

export type HaybondTermSellFlowStep = 'warning' | 'confirm' | 'otp' | 'success';

export type HaybondFlexibleBuyFlowStep = 'order' | 'confirm' | 'list-command' | 'otp' | 'success';

export type HaybondFlexibleSellFlowStep =
    | 'form'
    | 'warning'
    | 'confirm'
    | 'list-command'
    | 'otp'
    | 'success'
    | 'process';

export type HaybondSellOrderConfirmStep = 'summary' | 'otp' | 'success';

export type HaybondClosingPreviewUi = {
    id: string;
    name: string;
    start_date: string;
    execute_date: string;
    amount: number;
    early_profit: number;
    profit: number;
    trading_fee: number;
    net_amount: number;
    symbol: string;
    quantity: number;
    price: number;
};

export type HaybondTermBuyData = {
    symbol: string;
    bondAmount: number;
    price: number;
    start: string;
    status: string;
    packageInfo: {
        id: number;
        name: string;
        interest_rate: number;
    };
    estimateInfo: {
        estimated_quantity: number;
        total_amount: number;
        estimated_profit: number;
        execute_at: string;
        fee: number;
    };
    agreementData: {
        price: number;
        order_side: string;
        execute_date: string;
        amount: number;
        quantity: number;
        fee: number;
        is_receive_coupon: boolean;
        coupon_received_times: number;
        net_amount: number;
        vendor_id: number;
        max_coupon_amount: number;
        tax: number;
        buyer: string;
        seller: string;
    }[];
    contract: {
        pathFile: string;
        signed: boolean;
        title: string;
    };
    isOrderList: boolean;
};
