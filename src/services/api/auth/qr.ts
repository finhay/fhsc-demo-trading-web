import { vnscService } from '@/services/interceptor';
import type { GenerateQRResponse, RefreshTokenResponse, VerifyQRResponse } from '@/types/auth/qr';

import {
    getRefreshToken,
    setAccessKey,
    setAccessToken,
    setCustId,
    setRefreshToken,
    setUserId,
} from '../../localStorage';

export const createQrLoginChallenge = (scope = 'LOGIN'): Promise<GenerateQRResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post('/auth/v1/qr', {
                scope,
            })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const pollQrLoginChallengeStatus = (
    id: string,
    scope: string,
): Promise<VerifyQRResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/auth/v1/qr/${id}`, {
                params: { scope },
            })
            .then((res) => {
                if (res.data.result.status === 'APPROVED') {
                    setAccessToken(res.data.result.access_token);
                    setAccessKey(res.data.result.access_key);
                    setUserId(res.data.result.uid || res.data.result.user_id);
                    if (res.data.result.cust_id) {
                        setCustId(res.data.result.cust_id);
                    }
                    if (res.data.result.refresh_token) {
                        setRefreshToken(res.data.result.refresh_token);
                    }
                }
                resolve(res.data);
            })
            .catch((err) => reject(err.response?.data || err));
    });
};

export const refreshAccessToken = (): Promise<RefreshTokenResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get(`/auth/v1/authentication`, {
                params: {
                    scope: 'refresh_token_v1',
                    token: getRefreshToken() || '',
                },
                skipRefreshRetry: true,
            })
            .then((res) => {
                const accessToken = res.data.result.access_token;
                setAccessToken(accessToken);
                resolve(res.data);
            })
            .catch((err) => reject(err.response?.data || err));
    });
};
