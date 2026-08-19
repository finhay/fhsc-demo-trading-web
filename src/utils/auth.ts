import { AUTH_REGEX } from '@/constants/auth';
import type { ValidationType } from '@/types/auth/otp';
import type { AuthValidationMessages } from '@/types/pages/auth';

export const getPasswordRequirements = (
    password: string,
    confirmPassword: string,
): ValidationType => ({
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    specialCharacter: AUTH_REGEX.PASSWORD_SPECIAL_CHAR.test(password),
    matchPassword: password.length > 0 && password === confirmPassword,
});

export const validateRequired = (value: string | undefined, message: string) => {
    if (!value || value.trim().length === 0) {
        return message;
    }
    return undefined;
};

const validatePhoneFormat = (value: string, m: AuthValidationMessages) => {
    if (!AUTH_REGEX.PHONE_NUMBER_ONLY.test(value)) {
        return m.phone_digits_only;
    }
    if (!AUTH_REGEX.PHONE.test(value)) {
        return m.phone_invalid;
    }
    return undefined;
};

export const validatePhone = (value: string | undefined, m: AuthValidationMessages) => {
    if (!value || value.length === 0) {
        return m.phone_required;
    }
    return validatePhoneFormat(value, m);
};

const validateEmailFormat = (value: string, m: AuthValidationMessages) => {
    if (!AUTH_REGEX.EMAIL.test(value)) {
        return m.email_invalid;
    }
    return undefined;
};

export const validatePassword = (value: string | undefined, m: AuthValidationMessages) => {
    if (!value || value.length === 0) {
        return m.password_required;
    }
    if (value.length < 8) {
        return m.password_min_8;
    }
    if (!/[A-Z]/.test(value)) {
        return m.password_need_upper;
    }
    if (!/[a-z]/.test(value)) {
        return m.password_need_lower;
    }
    if (!AUTH_REGEX.PASSWORD_SPECIAL_CHAR.test(value)) {
        return m.password_need_special;
    }
    return undefined;
};

export const validateConfirmPassword = (
    value: string | undefined,
    password: string | undefined,
    m: AuthValidationMessages,
) => {
    if (!value || value.length === 0) {
        return m.confirm_password_required;
    }
    if (value !== password) {
        return m.confirm_password_mismatch;
    }
    return undefined;
};

export const validateLoginUsername = (
    value: string | undefined,
    accountType: string,
    m: AuthValidationMessages,
) => {
    if (accountType === 'individual') {
        return validatePhone(value, m);
    }
    if (!value || value.length === 0) {
        return m.custody_required;
    }
    return undefined;
};

export const validateResetPasswordUsername = (
    value: string | undefined,
    accountType: string,
    m: AuthValidationMessages,
) => {
    if (!value || value.length === 0) {
        return m.reset_account_required;
    }
    if (accountType === 'individual') {
        return validatePhoneFormat(value, m);
    }
    return validateEmailFormat(value, m);
};
