import axios, { AxiosInstance } from 'axios';

import { ERROR_CODES, STATUS_CODES } from '@/constants/common';
import { refreshAccessToken } from '@/services/api/auth/qr';
import {
    clearLocalStorage,
    getAccessKey,
    getAccessToken,
    getAccessToken2FA,
    getDeviceId,
    getUserId,
} from '@/services/localStorage';
import type { RefreshTokenResponse } from '@/types/auth/qr';
import { generateDeviceId, isSuccessApi } from '@/utils/common';

type BaseInterceptorOptions = {
    baseURL?: string;
    timeout?: number;
    withAuth?: boolean;
    withRefreshToken?: boolean;
    withDeviceId?: boolean;
    withLanguage?: boolean;
};

type RefreshFn = () => Promise<RefreshTokenResponse>;

let inflight: Promise<string> | null = null;

function runOrWaitRefresh(refreshFn: RefreshFn): Promise<string> {
    if (inflight) return inflight;

    inflight = refreshFn()
        .then((res) => {
            if (!isSuccessApi(res.error_code)) {
                throw new Error(`Refresh failed: ${res.error_code}`);
            }
            return res.result.access_token;
        })
        .finally(() => {
            inflight = null;
        });

    return inflight;
}

export const createBaseInterceptor = (options: BaseInterceptorOptions): AxiosInstance => {
    const instance = axios.create({
        baseURL: options.baseURL,
        headers: { 'Content-Type': 'application/json' },
        timeout: options.timeout || 30000,
    });

    instance.interceptors.request.use(
        async (req) => {
            if (options.withAuth && !req.headers?.skipAutoAuth) {
                req.url = req.url?.replace(':user_id', String(getUserId()));
                const token = getAccessToken();
                const token2FA = getAccessToken2FA();

                if (req.headers?.tokenType === '2FA') {
                    if (token2FA) {
                        req.headers['Authorization'] = `Bearer ${token2FA}`;
                    } else if (token) {
                        req.headers['Authorization'] = `Bearer ${token}`;
                    }
                } else if (token) {
                    req.headers['Authorization'] = `Bearer ${token}`;
                }
            }

            if (req.headers?.skipAutoAuth) {
                delete req.headers.skipAutoAuth;
            }

            req.headers['device-type'] = 'WEB';

            req.headers['device-id'] = getDeviceId() || (await generateDeviceId());

            req.headers['x-device-type'] = 'WEB';

            req.headers['x-device-id'] = getDeviceId() || (await generateDeviceId());

            req.headers['x-channel'] = 'ONLINE';

            req.headers['x-access-key'] = getAccessKey() || '';

            if (options.withLanguage !== false) {
                req.headers['Accept-Language'] = 'vi';
            }

            return req;
        },
        (error) => Promise.reject(error),
    );

    instance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalConfig = error.config;
            const canRetry =
                options.withRefreshToken &&
                error.response?.data?.error_code !== ERROR_CODES.FAILED_2FA_TOKEN_EXPIRED &&
                error.response?.status === STATUS_CODES.UNAUTHORIZED &&
                !originalConfig._retry &&
                !originalConfig.skipRefreshRetry;

            if (canRetry) {
                originalConfig._retry = true;

                try {
                    const newToken = await runOrWaitRefresh(refreshAccessToken);
                    originalConfig.headers.Authorization = `Bearer ${newToken}`;
                    return instance(originalConfig);
                } catch (refreshErr) {
                    clearLocalStorage();
                    window.location.href = '/';
                    return Promise.reject(refreshErr);
                }
            }

            if (error.response?.status === STATUS_CODES.FORBIDDEN && error.response.data) {
                return Promise.reject(error.response.data);
            }

            return Promise.reject(error);
        },
    );

    return instance;
};

export const vnscService = createBaseInterceptor({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 60000,
    withAuth: true,
    withRefreshToken: true,
    withDeviceId: true,
    withLanguage: true,
});

export const vnscServiceDatafeed = createBaseInterceptor({
    baseURL: process.env.NEXT_PUBLIC_DATAFEED_URL,
    timeout: 60000,
    withAuth: true,
    withDeviceId: true,
});
