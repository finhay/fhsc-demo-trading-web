export type GenerateQRResponse = {
    error_code: string;
    message: string;
    result: {
        id: string;
    };
};

export type VerifyQRResponse = {
    error_code: string;
    message: string;
    result: {
        status: string;
        access_token?: string;
        access_key?: string;
        refresh_token?: string;
        user_id?: string;
        uid?: string;
        cust_id?: string;
    };
};

export type RefreshTokenResponse = {
    error_code: string;
    message: string;
    result: {
        access_token: string;
    };
};
