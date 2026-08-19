export type LoginPayload = {
    username: string;
    password: string;
};

export type LoginIndividualResponse = {
    error_code: string;
    message: string;
    result: {
        access_token: string;
        access_key: string;
        refresh_token: string;
        user_id: string;
        cust_id: string;
        required_change_password?: boolean;
    };
};

export type LoginEnterpriseResponse = {
    error_code: string;
    message: string;
    data: {
        access_token: string;
        access_key: string;
        refresh_token: string;
        user_id: string;
        cust_id: string;
        required_change_password?: boolean;
    };
};

export type LogoutResponse = {
    error_code: string;
    message: string;
};
