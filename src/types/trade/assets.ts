export type SubAccountAsset = {
    sub_account_id: string;
    balance: number;
    ci_balance: number;
    td_balance: number;
    interest_balance: number;
    ca_receiving: number;
    receiving_t1: number;
    receiving_t2: number;
    receiving_t3: number;
    securities_amount: number;
    total_debt_amount: number;
    secure_amount: number;
    margin_amount: number;
    t0_debt_amount: number;
    advanced_amount: number;
    cidepo_fee_acr: number;
    net_asset_value: number;
    mrcr_limit: number;
    debt_amount: number;
    advance_max_amount_fee: number;
    receiving_amount: number;
    margin_rate: number;
    sms_fee_amount: number;
    hold_balance: number;
    mri_rate: number;
    mrm_rate: number;
    cidepo_fee: number;
    tdint_amount: number;
    add_vnd: number;
    add_vnd_1: number;
    core_bank: string;
    bankacct_no: string;
    bank_name: string;
    emk_amount: number;
    baldefovd: string;
    mrcr_limit_max: number;
};

export type SubAccountAssetSummaryResponse = {
    error_code: string;
    message: string;
    data: {
        asset: SubAccountAsset;
        is_snapshot: boolean;
    };
};
