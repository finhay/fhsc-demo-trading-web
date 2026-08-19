export type ReferralInfo = {
    code: string;
    name: string;
    phone: string;
    email: string;
    status: string;
};

export type ReferralResponse = {
    error_code: string;
    message: string;
    result: ReferralInfo;
};

export type AffiliateInfo = {
    code: string;
    name: string;
    partner_id: string;
    status: string;
};

export type AffiliateResponse = {
    error_code: string;
    message: string;
    result: AffiliateInfo;
};

export type ReferralTermResponse = {
    error_code: string;
    message: string;
    result: {
        content: string;
        version: string;
    };
};
