import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
    AUTH_MODE,
    SSO_ERROR_CODE,
    SSO_PENDING_KEY,
    SSO_PENDING_TTL_MS,
    STEPS_REGISTER,
    STEPS_RESET_PASSWORD,
    TYPE_OTP,
} from '@/constants/auth';
import { toast } from '@/hooks/lib/useToast';
import { getTranslate } from '@/hooks/useTranslate';
import { checkSsoConsent, loginSsoByToken } from '@/services/api/accounts/sso';
import {
    postAnonymousIdentity,
    postSendOtpPublic,
    postSendOtpV4,
    postVerifyOtp,
    postVerifyOtpV4,
} from '@/services/api/auth/otp';
import type { SsoAuthorizeByTokenRequest, SsoErrorCode } from '@/types/accounts/sso';
import { isValidSsoRedirectUri } from '@/utils/auth';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';

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

type SsoContext = {
    clientId: string;
    redirectUri: string;
    state: string;
};

type AuthFlowState = {
    authDialogMode: AuthDialogMode;
    register: RegisterState;
    resetPassword: ResetState;
    ssoContext: SsoContext | null;
    ssoAuthCode: string | null;
    ssoRedirectTo: string | null;
    ssoDeadlineAt: number | null;
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
    resetSsoState: () => void;
    cancelSso: (errorCode: SsoErrorCode) => void;
    setSsoContext: (ctx: SsoContext, deadlineAt: number) => void;
    handleSsoResult: (authCode: string, redirectTo: string, expiresIn: number) => Promise<boolean>;
    authorizeSso: (params: SsoAuthorizeByTokenRequest) => Promise<boolean>;

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
    ssoContext: null,
    ssoAuthCode: null,
    ssoRedirectTo: null,
    ssoDeadlineAt: null,
};

export const useAuthFlowStore = create<AuthFlowState & AuthFlowActions>()(
    persist(
        (set, get) => ({
            ...initialState,

            setInitRegisterState: () => set({ register: { ...registerInitial } }),

            setInitResetState: () => set({ resetPassword: { ...resetPasswordInitial } }),

            registerSetStep: (step) => set((s) => ({ register: { ...s.register, step } })),
            registerSetPhone: (phone) => set((s) => ({ register: { ...s.register, phone } })),

            resetPasswordSetStep: (step) =>
                set((s) => ({ resetPassword: { ...s.resetPassword, step } })),
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
                if (get().ssoContext) {
                    get().cancelSso(SSO_ERROR_CODE.ACCESS_DENIED);
                    return;
                }
                get().resetSsoState();
            },

            resetSsoState: () => {
                set({
                    authDialogMode: null,
                    ssoContext: null,
                    ssoAuthCode: null,
                    ssoRedirectTo: null,
                    ssoDeadlineAt: null,
                });
            },

            cancelSso: (errorCode) => {
                const { ssoContext } = get();
                let redirectUrl: URL | null = null;
                if (ssoContext) {
                    try {
                        redirectUrl = new URL(ssoContext.redirectUri);
                        redirectUrl.searchParams.set('error', errorCode);
                        redirectUrl.searchParams.set('state', ssoContext.state);
                    } catch {}
                }
                get().resetSsoState();
                if (redirectUrl) {
                    window.location.href = redirectUrl.toString();
                    return;
                }
                set({ authDialogMode: null });
            },

            setSsoContext: (ctx, deadlineAt) => set({ ssoContext: ctx, ssoDeadlineAt: deadlineAt }),

            handleSsoResult: async (authCode, redirectTo, expiresIn) => {
                set({
                    ssoAuthCode: authCode,
                    ssoRedirectTo: redirectTo,
                    ssoDeadlineAt:
                        Date.now() + (expiresIn > 0 ? expiresIn * 1000 : SSO_PENDING_TTL_MS),
                });
                try {
                    const res = await checkSsoConsent(authCode);
                    if (res.data?.is_consented) {
                        get().resetSsoState();
                        window.location.href = redirectTo;
                        return true;
                    }
                } catch (err) {
                    toast.error(getApiErrorMessage(err, getTranslate().common.try_again_error));
                }
                get().openAuthDialog(AUTH_MODE.SSO_CONSENT);
                return false;
            },

            authorizeSso: async (params) => {
                const res = await loginSsoByToken(params);
                if (!isSuccessApi(res.error_code)) throw res;
                if (!res.data?.redirect_to || !res.data?.auth_code) throw new Error(res.message);
                return get().handleSsoResult(
                    res.data.auth_code,
                    res.data.redirect_to,
                    res.data.expires_in,
                );
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
                        } = await postSendOtpV4(
                            TYPE_OTP.PHONE_VERIFICATION_OTP,
                            phone,
                            captchaToken,
                            data,
                        );

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
        }),
        {
            name: SSO_PENDING_KEY,
            storage: createJSONStorage(() => window.sessionStorage),
            skipHydration: true,
            partialize: (state) => ({
                ssoContext: state.ssoContext,
                ssoDeadlineAt: state.ssoDeadlineAt,
                ssoAuthCode: state.ssoAuthCode,
                ssoRedirectTo: state.ssoRedirectTo,
            }),
            merge: (persistedState, currentState) => {
                const persisted = persistedState as
                    | Partial<
                          Pick<
                              AuthFlowState,
                              'ssoContext' | 'ssoDeadlineAt' | 'ssoAuthCode' | 'ssoRedirectTo'
                          >
                      >
                    | undefined;
                const ssoContext = persisted?.ssoContext;
                if (
                    typeof ssoContext?.clientId !== 'string' ||
                    typeof ssoContext?.redirectUri !== 'string' ||
                    typeof ssoContext?.state !== 'string' ||
                    typeof persisted?.ssoDeadlineAt !== 'number' ||
                    !isValidSsoRedirectUri(ssoContext.redirectUri)
                ) {
                    return currentState;
                }
                return {
                    ...currentState,
                    ssoContext,
                    ssoDeadlineAt: persisted.ssoDeadlineAt,
                    ssoAuthCode:
                        typeof persisted.ssoAuthCode === 'string' ? persisted.ssoAuthCode : null,
                    ssoRedirectTo:
                        typeof persisted.ssoRedirectTo === 'string'
                            ? persisted.ssoRedirectTo
                            : null,
                };
            },
        },
    ),
);
