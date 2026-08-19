export type SupportedCountriesResponse = {
    error_code: string;
    message: string;
    result: {
        code: string;
        name: string;
        flag_url: string;
    }[];
};

export type SendOtpV1Response = {
    error_code: string;
    message: string;
    result: {
        remain_second: number;
        message: string;
        otp_status: string;
    };
};

export type SendOtpResponse = {
    error_code: string;
    message: string;
    data: {
        remain_second: number;
        message: string;
        otp_status: string;
    };
};

export type SendOtpV4Response = {
    error_code: string;
    message: string;
    data: {
        remain_second: number;
    };
};

export type VerifyOtpResponse = {
    error_code: string;
    message: string;
    result: {
        token: string;
    };
};

export type AnonymousIdentityResponse = {
    error_code: string;
    message: string;
    data: string;
};

export type ValidationType = {
    minLength: boolean;
    uppercase: boolean;
    lowercase: boolean;
    specialCharacter: boolean;
    matchPassword: boolean;
};

export type RequestOtpV3Payload = {
    email: string;
    type: string;
    otp?: string;
};

export type RequestOtpV3Response = {
    error_code: string;
    message: string;
    result: {
        remain_second: number;
    };
};

export type VerifyOtpV3Response = {
    error_code: string;
    message: string;
    result: {
        token: string;
    };
};
