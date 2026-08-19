export type SubAccount = {
    sub_account_ext: string;
    product_type_name: string;
    sub_account_id: string;
    account_type: string;
    account_type_as_text: string;
    fee_rate: number;
    loan_interest_rate_on_time?: number;
    permissions: string[];
    account_type_name: string;
};

export type ExtAccounts = {
    has_finhay: boolean;
};

export type UserProfile = {
    user_id: string;
    full_name: string;
    dob: string;
    gender: string | null;
    identity_number: string;
    id_issue_date: string;
    expired_date: string;
    id_issue_address: string;
    identity_type: string | null;
    address: string;
    full_address: string;
    district: string | null;
    ward: string | null;
    job: string | null;
    job_title: string | null;
    bank_account_name: string;
    bank_account_number: string;
    bank_name: string;
    bank_location: string | null;
    bank_branch: string | null;
    finhay_user_id: string | null;
    tax_number: string;
    id_image_verify_tier: number | null;
    has_id_image: number | null;
    has_id_selfie: boolean | null;
    status: string;
    note: string | null;
    depository_number: string;
    cust_id: string;
    sub_accounts: SubAccount[];
    city: string;
    created_at: string;
    phone?: string;
    email: string;
    next_action: string;
    ext_accounts?: ExtAccounts;
    ekyc_level: string;
    user_type: string;
    did_sign_contracts: boolean;
    is_depository_in_vnsc: boolean;
    explicity_user_type: string;
    monthly_income: string | null;
    investment_capital: string | null;
    id_type_integration: string | null;
    privacy_policy_agreed?: boolean;
    country_code?: string;
    need_update_ekyc_status?: string;
};

export type UserProfileResponse = {
    error_code: string;
    message: string;
    data: UserProfile;
};

export type UserPreferences = {
    user_id: number;
    notification_setting: string;
    display_setting: string;
    language_preference: string;
    member_groups: string[];
    avatar_url?: string;
};

export type PreferencesResponse = {
    error_code: string;
    message: string;
    data: UserPreferences;
};

export type UsersDepositResponse = {
    error_code: string;
    message: string;
    data: {
        custodycd: string;
        user_id: string | null;
        full_name: string;
        status: string | null;
        vsd_status: string | null;
        deposit_bank_accounts: {
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
        }[];
    }[];
};

export type TradingStatusResponse = {
    error_code: string;
    message: string;
    result: {
        is_insider: boolean;
        trading_status: string;
    };
};

export type LatestMonthlyReportResponse = {
    error_code: string;
    message: string;
    data: string;
};

export type SignatureResponse = {
    error_code: string;
    message: string;
    result: { signature_url: string };
};

export type IdentityCardImagesResponse = {
    error_code: string;
    message: string;
    data: {
        has_id_card_images: boolean;
    };
};
