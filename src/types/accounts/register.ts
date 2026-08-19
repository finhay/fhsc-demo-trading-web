export type RegisterV3Response = {
    error_code: string;
    message: string;
    data: {
        access_token: string;
        access_key: string;
        refresh_token: string;
        user_id: string;
        cust_id: string;
    };
};

export type CheckPhoneResponse = {
    error_code: string;
    message: string;
    result: {
        registered: boolean;
    };
};

export type CheckEmailEnterpriseExistResponse = {
    error_code: string;
    message: string;
    result: {
        registered: boolean;
    };
};

export type UpdateEmailResponse = {
    error_code: string;
    message: string;
    result?: any;
};

export type CheckEmailExistResponse = {
    error_code: string;
    message: string;
    result: {
        registered: boolean;
    };
};

export type RegisterAccountResponse = {
    error_code: string;
    message: string;
    data: {
        access_token: string;
        access_key: string;
        refresh_token: string;
        user_id: string;
        cust_id: string;
    };
};
