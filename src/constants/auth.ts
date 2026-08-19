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

export const ACCOUNT_TYPES = [
    { key: 'individual', label: 'Cá nhân' },
    { key: 'business', label: 'Doanh nghiệp' },
] as const;

export const LOGIN_ACCOUNT_FIELDS = {
    individual: {
        key: 'username',
        type: 'tel',
        label: 'Số điện thoại',
        placeholder: 'Nhập số điện thoại của bạn',
        inputFilter: /[^0-9]/g as RegExp | null,
    },
    business: {
        key: 'username',
        type: 'text',
        label: 'Số lưu ký',
        placeholder: 'Nhập số lưu ký của bạn',
        inputFilter: null as RegExp | null,
    },
} as const;

export const RESET_PASSWORD_ACCOUNT_FIELDS = {
    individual: {
        type: 'tel' as const,
        label: 'Số điện thoại',
        placeholder: 'Nhập số điện thoại của bạn',
        inputFilter: /[^0-9]/g as RegExp | null,
    },
    business: {
        type: 'email' as const,
        label: 'Email',
        placeholder: 'Nhập email của bạn',
        inputFilter: null as RegExp | null,
    },
};

export const AUTH_MODE = {
    LOGIN: 'login',
    REGISTER: 'register',
    RESET_PASSWORD: 'resetPassword',
    CHANGE_PASSWORD: 'changePassword',
};

export const AUTH_VALIDATE = {
    phone_required: 'Vui lòng nhập số điện thoại',
    phone_digits_only: 'Số điện thoại chỉ được nhập số',
    phone_invalid: 'Số điện thoại không hợp lệ',
    email_invalid: 'Email không hợp lệ',
    password_required: 'Vui lòng nhập mật khẩu',
    password_min_8: 'Mật khẩu phải có tối thiểu 8 ký tự',
    password_need_upper: 'Mật khẩu phải có ký tự viết hoa',
    password_need_lower: 'Mật khẩu phải có ký tự viết thường',
    password_need_special: 'Mật khẩu phải có ký tự đặc biệt',
    confirm_password_required: 'Vui lòng nhập lại mật khẩu',
    confirm_password_mismatch: 'Mật khẩu không khớp',
    custody_required: 'Vui lòng nhập số lưu ký',
    reset_account_required: 'Vui lòng nhập thông tin tài khoản',
};

export const PASSWORD_REQUIREMENT_LABELS: Record<string, string> = {
    req_min_len: 'Có tối thiểu 08 ký tự',
    req_upper: 'Có ký tự viết hoa',
    req_lower: 'Có ký tự viết thường',
    req_special: 'Có ký tự đặc biệt (@#$%...)',
    req_match: 'Trùng với mật khẩu đã tạo',
};
