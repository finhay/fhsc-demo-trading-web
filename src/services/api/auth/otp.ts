import { vnscService } from '@/services/interceptor';
import type {
    AnonymousIdentityResponse,
    RequestOtpV3Payload,
    RequestOtpV3Response,
    SendOtpResponse,
    SendOtpV1Response,
    SendOtpV4Response,
    VerifyOtpResponse,
    VerifyOtpV3Response,
} from '@/types/auth/otp';

export const postVerifyOtp = (
    type: string,
    otp: string,
    phone: string,
    email: string,
): Promise<VerifyOtpResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post(`/auth/v1/otp/verification`, {
                type,
                otp,
                phone,
                email,
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const postSendOtpPublic = (
    type: string,
    captcha_token: string,
    phone: string,
    email: string,
): Promise<SendOtpV1Response> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post(`/auth/public/v1/otp`, {
                type,
                phone,
                email,
                captcha_token,
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const postAnonymousIdentity = (): Promise<AnonymousIdentityResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post(`/auth/v1/users/anonymous-identity`)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const postSendOtpV4 = (
    type: string,
    phone: string,
    captcha_token: string,
    otp_key: string,
): Promise<SendOtpV4Response> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post(
                `/auth/v4/otp`,
                {
                    type,
                    phone,
                    captcha_token,
                },
                {
                    headers: {
                        'otp-key': otp_key,
                    },
                },
            )
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const postVerifyOtpV4 = (
    type: string,
    phone: string,
    otp: string,
    otp_key: string,
): Promise<VerifyOtpResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post(
                `/auth/v4/otp/verification`,
                {
                    type,
                    phone,
                    otp,
                },
                {
                    headers: {
                        'otp-key': otp_key,
                    },
                },
            )
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const postSendOtpV2 = (
    type: string,
    phone?: string,
    email?: string,
): Promise<SendOtpResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post(`/auth/v2/otp`, {
                type,
                phone: phone ? phone : '',
                email: email ? email : '',
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const postVerifyOtpV2 = (
    type: string,
    otp: string,
    phone?: string,
    email?: string,
): Promise<VerifyOtpResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post(`/auth/v2/otp/verification`, {
                type,
                otp,
                phone: phone ? phone : '',
                email: email ? email : '',
                channel: 'ONLINE',
                device_type: 'WEB',
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const postRequestOtpV3 = (data: RequestOtpV3Payload): Promise<RequestOtpV3Response> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post('auth/v3/otp', data)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const postVerifyOtpV3 = (data: RequestOtpV3Payload): Promise<VerifyOtpV3Response> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post('auth/v3/otp/verification', data)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
