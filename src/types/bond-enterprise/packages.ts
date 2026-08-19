export type HaybondPackageItem = {
    icon_url: string;
    interest_rate: number;
    most_used: boolean;
    id: number;
    name: string;
    description: string;
};

export type HaybondPackagesResponse = {
    error_code: string;
    message: string;
    title?: string;
    data: HaybondPackageItem[];
};

export type HaybondPackageDetail = {
    icon_url: string;
    interest_rate: number;
    chart_url: string;
    id: number;
    name: string;
    description: string;
    additionalInfo: string[];
    term: number;
    unit: string;
};

export type HaybondPackageDetailResponse = {
    error_code: string;
    message: string;
    title?: string;
    data: HaybondPackageDetail;
};

export type HaybondBuyPriceData = {
    bondId: number;
    bondSymbol: string;
    buyPrice: number;
};

export type HaybondBuyPriceResponse = {
    error_code: string;
    message: string;
    title?: string;
    data: HaybondBuyPriceData;
};

export type HaybondTermBuyPriceResponse = {
    error_code: string;
    message: string;
    title?: string;
    data: {
        price: number;
    };
};

export type HaybondInvestmentHistoryItem = {
    date: string;
    description: string;
    displayAmount: string;
    status: string;
    subOrders: {
        title: string;
        displayAmount: string;
    }[];
    title: string;
    type: string;
};

export type HaybondInvestmentHistoriesResponse = {
    error_code: string;
    message: string;
    title?: string;
    data: HaybondInvestmentHistoryItem[];
};

export type HaybondPreviewPayload = {
    flexible_package_id: number;
    bond_id: number;
    amount: number;
};

export type HaybondAgreementItem = {
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
    id?: number;
    warning_code?: string;
    warning_message?: string;
    symbol?: string;
};

export type HaybondDynamicOrdersPreviewData = {
    contract: {
        path_file: string;
        title: string;
    };
    agreement_data: HaybondAgreementItem[];
    symbol: string;
    start: string;
    has_accepted_tc: boolean;
};

export type HaybondDynamicOrdersPreviewResponse = {
    error_code: string;
    message: string;
    title?: string;
    data: HaybondDynamicOrdersPreviewData;
};
