export type HaybondEstimatePayload = {
    amount: number;
    package_id: number;
};

export type HaybondEstimateData = {
    estimated_quantity: number;
    total_amount: number;
    estimated_profit: number;
    execute_at: string;
    fee: number;
};

export type HaybondEstimateResponse = {
    error_code: string;
    message: string;
    title?: string;
    data: HaybondEstimateData;
};

export type HaybondFlexibleEstimatePayload = {
    flexible_package_id: number;
    amount: number;
    bond_id: number;
};

export type HaybondFlexibleEstimateResponse = HaybondEstimateResponse;

export type HaybondSellEstimateResponse = {
    error_code: string;
    message: string;
    title?: string;
    data: {
        maxSellAmount: number;
    };
};

export type HaybondCashFlowItem = {
    title: string;
    amountDisplay: string;
    date: string;
    description: string;
};

export type HaybondCashFlowPreviewResponse = {
    error_code: string;
    message: string;
    title?: string;
    data: {
        cashFlows: HaybondCashFlowItem[];
        receiveSellAmountDisplay: string;
    };
};

export type HaybondSellAgreementItem = {
    amount: number;
    buyer: string;
    coupon_received_times: number;
    execute_date: string;
    fee: number;
    id: number;
    is_receive_coupon: boolean;
    max_coupon_amount: number;
    net_amount: number;
    order_side: string;
    price: number;
    quantity: number;
    seller: string;
    tax: number;
    vendor_id: number;
    warning_code: string;
    warning_message: string;
    symbol: string;
};

export type HaybondSellPreviewResponse = {
    error_code: string;
    message: string;
    title?: string;
    data: {
        agreement_data: HaybondSellAgreementItem[];
        receive_sell_amount: number;
        sell_amount: number;
        fee_sell_amount: string;
        tax_sell_amount: string;
        avg_sell_price: number;
        total_quantity: number;
        is_selling_all: boolean;
        total_coupon_received: number | null;
    };
};

export type HaybondOrderPreviewData = {
    package_info: {
        id: number;
        name: string;
        interest_rate: number;
    };
    agreement_data: {
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
    symbol: string;
    start: string;
};

export type HaybondOrderPreviewResponse = {
    error_code: string;
    message: string;
    title?: string;
    data: HaybondOrderPreviewData;
};

export type HaybondBuyingPayload = {
    amount: number;
    package_id: number;
    vendor_id: number;
};

export type HaybondBuyingResponse = {
    error_code: string;
    message: string;
    title?: string;
};

export type HaybondFlexibleBuyingPayload = {
    amount: number;
    flexible_package_id: number;
    bond_id: number;
    vendor_id: number;
};

export type HaybondFlexibleBuyingResponse = {
    error_code: string;
    message: string;
    title?: string;
    data: {
        interest_rate: number;
        saving_amount: number;
        end_date: string;
        icon_url: string;
        order_id: number;
        id: number;
        status: string;
        quantity: number;
    };
};

export type HaybondOrderDetailData = {
    interest_rate: number;
    total_amount: number;
    order_date: string;
    estimate_date_receive_coupon: string;
    end_early_interest_rate: number;
    coupon_amount: number;
    order_status: string;
    sell_early: boolean;
    order_side: string;
    delta_buy_sell: number;
    gross_profit: number;
    symbol: string;
    start: string;
    fee: number;
    tax: number;
    end_date: string;
    days_in_periods: number;
    term: {
        term_name: string;
        term: number;
    };
};

export type HaybondOrderDetailResponse = {
    error_code: string;
    message: string;
    title?: string;
    data: HaybondOrderDetailData;
};

export type HaybondFlexibleOrderDetailData = {
    agreementId: number;
    title: string;
    symbol: string;
    price: number;
    orderSide: string;
    totalAmount: number;
    orderDate: string;
    executeAt: string;
    quantity: number;
    fee: number;
    tax: number;
    buyer: string;
    seller: string;
    orderStatus: string;
    progress: {
        title: string;
        status: string;
    }[];
};

export type HaybondFlexibleOrderDetailResponse = {
    error_code: string;
    message: string;
    title?: string;
    data: HaybondFlexibleOrderDetailData;
};

export type HaybondOrdersHistoryItem = {
    id: number;
    order_side: string;
    status_as_text: string;
    total_amount: number;
    tax_amount: number;
    is_receive_coupon: boolean;
    coupon_received_times: number;
    execute_date: string;
    term_value: number;
    name: string;
    symbol: string;
    price: number;
    status: string;
    quantity: number;
    fee: number;
    sell_early: boolean;
    saving_book_type: string;
};

export type HaybondOrdersHistoriesResponse = {
    error_code: string;
    message: string;
    title?: string;
    data: {
        content: HaybondOrdersHistoryItem[];
        page: number;
        totalPages: number;
    };
};
