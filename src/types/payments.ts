export type WithdrawPayload = {
    sub_account_id: string;
    amount: string;
    otp: string;
    phone?: string;
    email?: string;
};

export type WithdrawalAvailableBalanceResponse = {
    error_code: string;
    message: string;
    result: {
        availableBalance: number;
    };
};

export type WithdrawMoneyResponse = {
    error_code: string;
    message: string;
    data: {
        transaction_id: string;
        status: string;
    };
};

export type SubAccountItem = {
    balance: number;
    blocked_balance: number;
    customer_id: string;
    product_type_name: string;
    sub_account_ext: string;
    sub_account_id: string;
    total_balance: number;
    type: string;
};

export type SubAccountResponse = {
    error_code: string;
    message: string;
    result: SubAccountItem[];
};

export type CiBalanceResponse = {
    error_code: string;
    message: string;
    result: {
        amount: number;
    };
};

export type TransferFeeResponse = {
    error_code: string;
    message: string;
    result: {
        amount: number;
        fee: number;
        vat: number;
    };
};

export type TransferMoneyResponse = {
    error_code: string;
    message: string;
    result: {
        amount: number;
    };
};

export type SubAccountTransactionItem = {
    id: string;
    sub_account_id: string;
    transaction_date: string;
    bus_date: string;
    transaction_number: string;
    transaction_type: string;
    transaction_flow: string;
    transaction_status: string;
    amount: string;
    title: string;
    description: string;
    code: string;
    flex_tx_num: string;
    flex_tx_date: string;
};

export type SubAccountTransactionResponse = {
    error_code: string;
    message: string;
    data: {
        transactions: SubAccountTransactionItem[];
        next_page: number;
    };
};

export type WithdrawalQueryResponse = {
    error_code: string;
    message: string;
    result: {
        fee: number;
        amount: number;
        net_amount: number;
        fast_withdrawal: boolean;
    };
};
