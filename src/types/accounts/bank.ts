export type BankItem = {
    id: string;
    bank_code: string;
    bank_name: string;
    bank_short_name: string;
    logo_url: string;
    vietqr_bank_id: string;
};

export type BanksResponse = {
    error_code: string;
    message: string;
    result: BankItem[];
};

export type CheckBankAccountResponse = {
    error_code: string;
    message: string;
    result: {
        is_valid: boolean;
        bank_account_name: string;
    };
};

export type DepositBankAccountItem = {
    user_id: string | null;
    bank_id: string;
    bank_account: string;
    bank_name: string;
    bank_account_name: string;
    bank_branch_id: string | null;
    bank_branch: string | null;
    bank_city: string | null;
    license_code: string | null;
    priority: number;
    is_interruption: boolean;
    interruption_waring_message: string;
    vietqr_bank_id: string;
};

export type DepositAccountInfo = {
    custodycd: string;
    user_id: string | null;
    full_name: string;
    status: string | null;
    vsd_status: string | null;
    deposit_bank_accounts: DepositBankAccountItem[];
};

export type BankAccountDepositResponse = {
    error_code: string;
    message: string;
    data: Array<{
        custodycd: string;
        user_id: string | null;
        full_name: string;
        status: string | null;
        vsd_status: string | null;
        deposit_bank_accounts: Array<{
            user_id: string | null;
            bank_id: string;
            bank_account: string;
            bank_name: string;
            bank_account_name: string;
            bank_branch_id: string | null;
            bank_branch: string | null;
            bank_city: string | null;
            license_code: string | null;
            priority: number;
            is_interruption: boolean;
            interruption_waring_message: string;
            vietqr_bank_id: string;
        }>;
    }>;
};
