import type { SSO_ERROR_CODE } from '@/constants/auth';

export type SsoErrorCode = (typeof SSO_ERROR_CODE)[keyof typeof SSO_ERROR_CODE];

export type SsoAuthorizeByTokenRequest = {
    client_id: string;
    redirect_uri: string;
    state: string;
};

export type SsoAuthorizeResponse = {
    error_code: string;
    request_id?: string;
    message: string;
    data?: {
        redirect_to: string;
        auth_code: string;
        expires_in: number;
    };
};

export type SsoCheckConsentResponse = {
    error_code: string;
    message: string;
    data?: {
        is_consented: boolean;
        consented_at: string | null;
    };
};

export type SsoSubmitConsentResponse = {
    error_code: string;
    message: string;
    data?: {
        is_success: boolean;
    };
};
