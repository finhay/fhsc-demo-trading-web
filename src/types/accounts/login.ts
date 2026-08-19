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
    };
};

export type LogoutResponse = {
    error_code: string;
    message: string;
};
