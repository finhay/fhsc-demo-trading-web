import { create } from 'zustand';

import { STEPS_REGISTER, STEPS_RESET_PASSWORD, TYPE_OTP } from '@/constants/auth';
import { toast } from '@/hooks/lib/useToast';
import {
    postAnonymousIdentity,
    postSendOtpPublic,
    postSendOtpV4,
    postVerifyOtp,
    postVerifyOtpV4,
} from '@/services/api/auth/otp';
import { isSuccessApi } from '@/utils/common';

type AuthDialogMode = string | null;

type AuthDialogOpenMode = Exclude<AuthDialogMode, null>;

type RegisterState = {
    step: string;
    phone: string;
    verifiedOtp: string;
    otpKey: string;
};

type ResetState = {
    step: string;
    username: string;
    accountType: string;
    otpToken: string;
    isSuccess: boolean;
};

type AuthFlowState = {
    authDialogMode: AuthDialogMode;
    register: RegisterState;
    resetPassword: ResetState;
};

type AuthFlowActions = {
    setInitRegisterState: () => void;
    setInitResetState: () => void;
    registerSetStep: (step: string) => void;
    registerSetPhone: (phone: string) => void;
    resetPasswordSetStep: (step: string) => void;
    resetPasswordSetUsername: (username: string) => void;
    resetPasswordSetAccountType: (accountType: string) => void;
    resetPasswordSetIsSuccess: (isSuccess: boolean) => void;

    openAuthDialog: (mode: AuthDialogOpenMode) => void;
    closeAuthDialog: () => void;

    registerSendOtp: (captchaToken: string) => Promise<{ success: boolean; remainSecond?: number }>;
    registerVerifyOtp: (otp: string) => Promise<boolean>;
    resetPasswordSendOtp: (
        captchaToken: string,
    ) => Promise<{ success: boolean; remainSecond?: number }>;
    resetPasswordVerifyOtp: (otp: string) => Promise<boolean>;
};

const registerInitial: RegisterState = {
    step: STEPS_REGISTER.CREATE_ACCOUNT,
    phone: '',
    verifiedOtp: '',
    otpKey: '',
};

const resetPasswordInitial: ResetState = {
    step: STEPS_RESET_PASSWORD.ACCOUNT_INFO,
    username: '',
    accountType: 'individual',
    otpToken: '',
    isSuccess: false,
};

const initialState: AuthFlowState = {
    authDialogMode: null,
    register: { ...registerInitial },
    resetPassword: { ...resetPasswordInitial },
};

export const useAuthFlowStore = create<AuthFlowState & AuthFlowActions>()((set, get) => ({
    ...initialState,

    setInitRegisterState: () => set({ register: { ...registerInitial } }),

    setInitResetState: () => set({ resetPassword: { ...resetPasswordInitial } }),

    registerSetStep: (step) => set((s) => ({ register: { ...s.register, step } })),
    registerSetPhone: (phone) => set((s) => ({ register: { ...s.register, phone } })),

    resetPasswordSetStep: (step) => set((s) => ({ resetPassword: { ...s.resetPassword, step } })),
    resetPasswordSetUsername: (username) =>
        set((s) => ({ resetPassword: { ...s.resetPassword, username } })),
    resetPasswordSetAccountType: (accountType) =>
        set((s) => ({ resetPassword: { ...s.resetPassword, accountType } })),
    resetPasswordSetIsSuccess: (isSuccess) =>
        set((s) => ({ resetPassword: { ...s.resetPassword, isSuccess } })),

    openAuthDialog: (mode) => {
        get().setInitRegisterState();
        get().setInitResetState();
        set({ authDialogMode: mode });
    },

    closeAuthDialog: () => {
        get().setInitRegisterState();
        get().setInitResetState();
        set({ authDialogMode: null });
    },

    registerSendOtp: async (captchaToken: string) => {
        const { phone } = get().register;
        if (!captchaToken || !phone) return { success: false };

        try {
            const { error_code, message, data } = await postAnonymousIdentity();
            if (isSuccessApi(error_code)) {
                set((s) => ({ register: { ...s.register, otpKey: data } }));

                const {
                    error_code: otpErrorCode,
                    message: otpMessage,
                    data: otpData,
                } = await postSendOtpV4(TYPE_OTP.PHONE_VERIFICATION_OTP, phone, captchaToken, data);

                if (isSuccessApi(otpErrorCode)) {
                    return { success: true, remainSecond: otpData.remain_second };
                }
                toast.error(otpMessage);
                return { success: false };
            }
            toast.error(message);
            return { success: false };
        } catch {
            return { success: false };
        }
    },

    registerVerifyOtp: async (otp: string) => {
        const { phone, otpKey } = get().register;
        if (!otp || otp.length !== 6 || !otpKey) return false;

        try {
            const { error_code, message } = await postVerifyOtpV4(
                TYPE_OTP.PHONE_VERIFICATION_OTP,
                phone,
                otp,
                otpKey,
            );

            if (isSuccessApi(error_code)) {
                set((s) => ({
                    register: {
                        ...s.register,
                        verifiedOtp: otp,
                        step: STEPS_REGISTER.CREATE_PASSWORD,
                    },
                }));
                return true;
            }
            toast.error(message);
            return false;
        } catch {
            return false;
        }
    },

    resetPasswordSendOtp: async (captchaToken: string) => {
        const { username, accountType } = get().resetPassword;
        if (!captchaToken || !username) return { success: false };

        const isIndividual = accountType === 'individual';

        try {
            const { error_code, message, result } = await postSendOtpPublic(
                TYPE_OTP.FORGOT_PASSWORD,
                captchaToken,
                isIndividual ? username : '',
                !isIndividual ? username : '',
            );

            if (isSuccessApi(error_code)) {
                return { success: true, remainSecond: result.remain_second };
            }
            toast.error(message);
            return { success: false };
        } catch {
            return { success: false };
        }
    },

    resetPasswordVerifyOtp: async (otp: string) => {
        const { username, accountType } = get().resetPassword;
        if (!otp || otp.length !== 6) return false;

        const isIndividual = accountType === 'individual';

        try {
            const { error_code, message, result } = await postVerifyOtp(
                TYPE_OTP.FORGOT_PASSWORD,
                otp,
                isIndividual ? username : '',
                !isIndividual ? username : '',
            );

            if (isSuccessApi(error_code)) {
                set((s) => ({
                    resetPassword: {
                        ...s.resetPassword,
                        otpToken: result.token,
                        step: STEPS_RESET_PASSWORD.CREATE_NEW_PASSWORD,
                    },
                }));
                return true;
            }
            toast.error(message);
            return false;
        } catch {
            return false;
        }
    },
}));
