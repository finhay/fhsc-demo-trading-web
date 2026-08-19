export const AUTH_REGEX = {
    PHONE: /^(0[0-9]{8,11}|84[0-9]{7,10})$/,
    PHONE_NUMBER_ONLY: /^[0-9]+$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD_SPECIAL_CHAR: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
};

export const AUTH_TIME = {
    VERIFY_QR: 3000,
    CLEAR: 60000,
};

export const STATUS_QR = {
    APPROVED: 'APPROVED',
};

export const TYPE_OTP = {
    FORGOT_PASSWORD: 'FORGOT_PASSWORD',
    PHONE_VERIFICATION_OTP: 'PHONE_VERIFICATION_OTP',
};

export const STEPS_REGISTER = {
    CREATE_ACCOUNT: 'CREATE_ACCOUNT',
    VERIFY_OTP: 'VERIFY_OTP',
    CREATE_PASSWORD: 'CREATE_PASSWORD',
    SUCCESS: 'SUCCESS',
};

export const STEPS_RESET_PASSWORD = {
    ACCOUNT_INFO: 'ACCOUNT_INFO',
    VERIFY_OTP: 'VERIFY_OTP',
    CREATE_NEW_PASSWORD: 'CREATE_NEW_PASSWORD',
};

export const PASSWORD_REQUIREMENTS = [
    {
        key: 'minLength',
        translateKey: 'req_min_len',
        focusField: 'password',
    },
    {
        key: 'uppercase',
        translateKey: 'req_upper',
        focusField: 'password',
    },
    {
        key: 'lowercase',
        translateKey: 'req_lower',
        focusField: 'password',
    },
    {
        key: 'specialCharacter',
        translateKey: 'req_special',
        focusField: 'password',
    },
    {
        key: 'matchPassword',
        translateKey: 'req_match',
        focusField: 'confirmPassword',
    },
] as const;

export const ACCOUNT_TYPES = [
    { key: 'individual', translateKey: 'acct_individual' },
    { key: 'business', translateKey: 'acct_business' },
] as const;

export const REGISTER_PASSWORD_FIELDS = [
    {
        key: 'password',
        labelTranslateKey: 'pass_lbl',
        placeholderTranslateKey: 'input_pass_secure',
        showError: false,
    },
    {
        key: 'confirmPassword',
        labelTranslateKey: 'confirm_pass_lbl',
        placeholderTranslateKey: 'input_confirm_pass',
        showError: true,
    },
] as const;

export const LOGIN_ACCOUNT_FIELDS = {
    individual: [
        {
            key: 'username',
            type: 'tel',
            labelTranslateKey: 'phone_lbl',
            placeholderTranslateKey: 'input_phone',
            inputFilter: /[^0-9]/g,
        },
    ],
    business: [
        {
            key: 'username',
            type: 'text',
            labelTranslateKey: 'custody_lbl',
            placeholderTranslateKey: 'input_custody',
            inputFilter: null,
        },
    ],
} as const;

export const RESET_PASSWORD_ACCOUNT_FIELDS = {
    individual: {
        type: 'tel' as const,
        labelTranslateKey: 'phone_lbl',
        placeholderTranslateKey: 'input_phone',
        inputFilter: /[^0-9]/g,
    },
    business: {
        type: 'email' as const,
        labelTranslateKey: 'email',
        placeholderTranslateKey: 'input_email',
        inputFilter: null,
    },
};

export const SSO_PENDING_KEY = 'sso_pending';

export const SSO_PENDING_TTL_MS = 10 * 60 * 1000;

export const SSO_ERROR_CODE = {
    ACCESS_DENIED: 'access_denied',
    SESSION_EXPIRED: 'session_expired',
} as const;

export const SSO_ALLOWED_REDIRECT_URIS = (process.env.NEXT_PUBLIC_SSO_ALLOWED_REDIRECT_URIS ?? '')
    .split(',')
    .map((uri) => uri.trim())
    .filter(Boolean);

export const SSO_CONSENT_IMAGE_URL =
    'https://cdn1.finhay.com.vn/vnsc-prod/1777863552264.2024-Gemini_Generated_Image.png';

export const SSO_CONSENT_SHARED_ITEMS = [
    { translateKey: 'consent_shared_account' },
    { translateKey: 'consent_shared_personal' },
    { translateKey: 'consent_shared_bank' },
] as const;

export const AUTH_MODE = {
    LOGIN: 'login',
    REGISTER: 'register',
    RESET_PASSWORD: 'resetPassword',
    CHANGE_PASSWORD: 'changePassword',
    SSO_CONSENT: 'ssoConsent',
    SSO_ACCOUNT_CHOOSER: 'ssoAccountChooser',
};
