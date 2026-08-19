export type AgreementsResponse = {
    error_code: string;
    message: string;
    title?: string;
    data: unknown;
};

export type UpdateSellOrderBody = {
    newSellDate: string;
    newSellAmount: number;
};

export type PreviewChangeDataItem = {
    id: string;
    amount: number;
    price: number;
    quantity: number;
    fee: number;
    execute_date: string;
    max_coupon_amount: string;
    seller: string;
    symbol: string;
};

export type PreviewChangeResponse = {
    error_code: string;
    message: string;
    title?: string;
    data: unknown;
};

export type HaybondUpdateSellOrderResponse = {
    error_code: string;
    message: string;
    title?: string;
    data?: {
        status: string;
    };
};

export type HaybondFlexibleSummaryData = {
    hasAnySavingAccount: boolean;
    totalEstimatedInterest: number;
    totalReceivedInterest: number;
    totalSavingAmount: number;
    canSell: boolean;
    isHoldingSavings: boolean;
};

export type HaybondFlexibleSummaryResponse = {
    error_code: string;
    message: string;
    title?: string;
    data: HaybondFlexibleSummaryData;
};

export type HaybondOwnershipHistoryItem = {
    interest_rate: number;
    saving_amount: number;
    name: string;
    end_date: string;
    icon_url: string;
    id: number;
    status: string;
    quantity: number;
    sell_early: boolean;
    end_early_interest_rate: number;
};

export type HaybondOwnershipHistoriesResponse = {
    error_code: string;
    message: string;
    title?: string;
    data: {
        content: HaybondOwnershipHistoryItem[];
        page: number;
        totalPages: number;
    };
};

export type HaybondDynamicOwnershipHistoryItem = {
    icon_url: string;
    interest_amount: number;
    name: string;
    saving_amount: number;
    end_date: string;
    status: string;
};

export type HaybondDynamicOwnershipHistoriesResponse = {
    error_code: string;
    message: string;
    title?: string;
    data: HaybondDynamicOwnershipHistoryItem[];
};

export type HaybondCashHistoryItem = {
    execute_date: string;
    type: string;
    amount: number;
    tax: number;
    fee: number;
    name: string;
    flow: string;
};

export type HaybondSavingBookDetailData = {
    total_amount: number;
    interest_rate: number;
    estimate_date_receive_coupon: string;
    gross_profit: number;
    delta_buy_sell: number;
    coupon_amount: number;
    days_in_period: number;
    sell_early: boolean;
    cash_histories: HaybondCashHistoryItem[];
    start: string;
    end: string;
    symbol: string;
    status: string;
    term: {
        term_name: string;
        term: number;
    };
    fee: number;
    tax: number;
};

export type HaybondSavingBookDetailResponse = {
    error_code: string;
    message: string;
    title?: string;
    data: HaybondSavingBookDetailData;
};

export type HaybondBondOwnershipItem = {
    bondId: number;
    symbol: number | string;
    totalPendingQuantity: string;
    totalOwnershipQuantity: string;
    totalPendingAmount: string;
    totalOwnershipAmount: string;
    totalCouponReceived: number;
    totalCouponPending: number;
    estimateCouponReceiveDate: string;
};

export type HaybondBondOwnershipResponse = {
    error_code: string;
    message: string;
    title?: string;
    data: HaybondBondOwnershipItem[];
};

export type HaybondInvestmentDetailData = {
    deltaBuySellAmount: number;
    interestRate: number;
    packageName: string;
    startDate: string;
    totalCouponAmount: number;
    totalInvestmentAmount: number;
    totalReceivedInterest: number;
    totalWithdrawAmount: number;
    pendingSaleAmount: number;
};

export type HaybondInvestmentDetailResponse = {
    error_code: string;
    message: string;
    title?: string;
    data: HaybondInvestmentDetailData;
};

export type HaybondClosingData = {
    allow_close: boolean;
};

export type HaybondClosingResponse = {
    error_code: string;
    message: string;
    title?: string;
    data: HaybondClosingData;
};

export type HaybondClosingPreviewData = {
    package_info: {
        name: string;
    };
    start: string;
    agreement_data: {
        execute_date: string;
        amount: number;
        fee: number;
        net_amount: number;
        quantity: number;
        price: number;
    };
    end_early_interest_rate: number;
    symbol: string;
};

export type HaybondClosingPreviewResponse = {
    error_code: string;
    message: string;
    title?: string;
    data: HaybondClosingPreviewData;
};

export type HaybondUpdateClosingResponse = {
    error_code: string;
    message: string;
    title?: string;
    data?: {
        status?: string;
        allow_close?: boolean;
    };
};
