export type TermAndConditionResponse = {
    error_code: string;
    popup_message: string | null;
    message: string;
    data: {
        confirm: boolean;
        totalPayment: number;
        sharePrice: number;
        allocatedShares: number;
    };
};

export type TermAndConditionViewTemplateResponse = {
    error_code: string;
    popup_message: string | null;
    message: string;
    data: string;
};

export type IpoAuthorityMethod = {
    method: string;
    primary: boolean;
};

export type IpoContractCondition = {
    name: string;
    type: string;
};

export type IpoRegistrationBuyInfoData = {
    company_name: string;
    min_quantity: number;
    max_quantity: number | null;
    step_quantity: number;
    min_price: number;
    max_price: number | null;
    step_price: number;
    start_at: string;
    end_at: string;
    authorities_method: IpoAuthorityMethod[];
    authority_at: string;
    conditions_description: string[];
    info_url: string;
    is_fix_price: boolean;
    is_fix_quantity: boolean;
    require_digital_signature: boolean;
    deposit_rate: number;
    contractConditions: IpoContractCondition[];
};

export type IpoRegistrationBuyInformationResponse = {
    error_code: string;
    popup_message: string | null;
    message: string;
    data: IpoRegistrationBuyInfoData;
};

export type IpoRegistrationBuyItem = {
    id: number;
    created_at: string;
    symbol: string;
    company_name: string;
    status: string;
    statusAsText: string;
    amount: number;
    quantity: number;
    price: number;
    logo_url: string;
};

export type IpoRegistrationBuyAllResponse = {
    error_code: string;
    popup_message: string | null;
    message: string;
    data: IpoRegistrationBuyItem[];
};

export type OpportunityItem = {
    banner_url: string;
    start: string;
    end: string;
    introduce: string;
    name: string;
    symbol: string;
    expired: boolean;
    require_digital_signature: boolean;
};

export type OpportunitiesResponse = {
    error_code: string;
    popup_message: string | null;
    message: string;
    data: {
        total: number;
        items: OpportunityItem[];
    };
};

export type IpoRegistrationBuyPayload = {
    quantity: number;
    price: number;
    symbol: string;
};

export type IpoRegistrationBuyResponse = {
    error_code: string;
    popup_message: string | null;
    message: string;
    data: {
        pay_in_advance: number;
        info_url: string;
        id: number;
        quantity: number;
        price: number;
        status: string;
        result: string | null;
    };
};

export type ConfirmingTermAndConditionResponse = {
    error_code: string;
    popup_message: string | null;
    message: string;
    data: null;
};

export type OtpClaimingPayload = {
    method: string;
    orderId: number;
};

export type OtpClaimingResponse = {
    error_code: string;
    popup_message: {
        title: string;
        desc: string;
    } | null;
    message: string;
    data: {
        retry_remain_seconds: number;
        retry_remain_times: number;
        token: string;
    };
};

export type AuthoritySessionStateResponse = {
    error_code: string;
    popup_message: string | null;
    message: string;
    data: {
        status: string;
        method: string;
        execute_at: string | null;
    };
};

export type IpoRegistrationBuyPreviewOrderResponse = {
    error_code: string;
    popup_message: string | null;
    message: string;
    data: string;
};

export type IpoRegistrationBuyDetailData = {
    id: number;
    quantity: number;
    price: number;
    status: string;
    pay_in_advance: number;
    info_url: string;
    result: {
        distribution_price: number;
        spent_amount: number;
        final_payment_amount: number;
        bonus: number;
        quantity: number;
        note: string;
        payment_due_date: string;
        require_final_payment: boolean;
    };
};

export type IpoRegistrationBuyDetailResponse = {
    error_code: string;
    popup_message: string | null;
    message: string;
    data: IpoRegistrationBuyDetailData;
};

export type IpoPayRemainingBalanceResponse = {
    error_code: string;
    popup_message: string | null;
    message: string;
    data: {
        status: string;
        payment_url?: string;
    };
};
