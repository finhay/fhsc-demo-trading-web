import { vnscService } from '@/services/interceptor';
import type { CheckPhoneResponse, RegisterV3Response } from '@/types/accounts/register';

export const registerAccountV3 = (
    phone: string,
    password: string,
    otp: string,
    options?: {
        channel?: string;
        source?: string;
    },
): Promise<RegisterV3Response> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post(
                '/accounts/public/v3/register',
                {
                    phone,
                    password,
                    otp,
                },
                {
                    headers: {
                        ...(options?.channel && { channel: options.channel }),
                        ...(options?.source && { source: options.source }),
                    },
                },
            )
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const checkPhoneRegisteredStatus = (phone: string): Promise<CheckPhoneResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/accounts/v1/register`, {
                params: {
                    phone,
                },
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
