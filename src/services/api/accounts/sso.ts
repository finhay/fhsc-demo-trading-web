import { vnscService } from '@/services/interceptor';
import type {
    SsoAuthorizeByTokenRequest,
    SsoAuthorizeResponse,
    SsoCheckConsentResponse,
    SsoSubmitConsentResponse,
} from '@/types/accounts/sso';

export const loginSsoByToken = (
    payload: SsoAuthorizeByTokenRequest,
): Promise<SsoAuthorizeResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post('/accounts/v1/sso/authorize', payload)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const checkSsoConsent = (authCode: string): Promise<SsoCheckConsentResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .get('/accounts/public/sso/consent/check', { params: { auth_code: authCode } })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};

export const submitSsoConsent = (authCode: string): Promise<SsoSubmitConsentResponse> => {
    return new Promise((resolve, reject) => {
        vnscService
            .post('/accounts/public/sso/consent', { auth_code: authCode })
            .then((res) => resolve(res.data))
            .catch((err) => reject(err.response?.data || err));
    });
};
