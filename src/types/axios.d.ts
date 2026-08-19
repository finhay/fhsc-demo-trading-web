import 'axios';

declare module 'axios' {
    export interface InternalAxiosRequestConfig {
        _retry?: boolean;
        skipRefreshRetry?: boolean;
    }

    export interface AxiosRequestConfig {
        _retry?: boolean;
        skipRefreshRetry?: boolean;
    }

    export interface HeadersDefaults {
        skipAutoAuth?: boolean;
        tokenType?: '2FA' | string;
    }
}
