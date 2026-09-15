'use client';

import { useForm, useStore } from '@tanstack/react-form';

import { useState } from 'react';

import { InputField } from '@/components/common/feature/InputField';
import { PasswordRequirements } from '@/components/common/feature/PasswordRequirements';
import {
    AUTH_VALIDATE,
    PASSWORD_REQUIREMENT_LABELS,
    REGISTER_PASSWORD_FIELDS,
    STEPS_REGISTER,
} from '@/constants/auth';
import { toast } from '@/hooks/lib/useToast';
import { registerAccountV3 } from '@/services/api/accounts/register';
import {
    setAccessKey,
    setAccessToken,
    setCustId,
    setRefreshToken,
    setUserId,
} from '@/services/localStorage';
import { useAuthFlowStore } from '@/stores/auth/useAuthFlowStore';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { usePaperAccountStore } from '@/stores/paper-trading/usePaperAccountStore';
import { getPasswordRequirements, validateConfirmPassword, validatePassword } from '@/utils/auth';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';

const AUTH_REGISTER = {
    title: 'Tạo tài khoản',
    meta_description:
        'Nhập số điện thoại của bạn làm tài khoản đăng nhập. Mã OTP sẽ được gửi để xác thực',
    hdr_create_acct: 'Tạo tài khoản',
    phone_lbl: 'Số điện thoại',
    input_phone: 'Nhập số điện thoại của bạn',
    err_phone_in_use: 'Số điện thoại đã được sử dụng',
    btn_continue: 'Tiếp tục',
    or_sep: 'Hoặc',
    has_acct_prompt: 'Bạn đã có tài khoản?',
    terms_agree_prefix: 'Bằng việc “Tiếp tục”, bạn đồng ý với',
    terms_link: 'Điều khoản và điều kiện sử dụng sản phẩm FHSC',
    terms_dialog_title: 'Điều khoản và điều kiện sử dụng sản phẩm FHSC',
    back: 'Quay lại',
    resend: 'Gửi lại',
    create_pass_title: 'Tạo mật khẩu',
    pass_lbl: 'Mật khẩu',
    input_pass_secure: 'Nhập mật khẩu theo yêu cầu bảo mật',
    confirm_pass_lbl: 'Nhập lại mật khẩu',
    input_confirm_pass: 'Nhập lại mật khẩu của bạn',
    pass_rules_title: 'Yêu cầu mật khẩu',
    btn_done: 'Xong',
    open_acct_ok: 'Mở tài khoản thành công',
    download_app_prompt:
        'Tải ứng dụng, xác thực tài khoản để sử dụng đầy đủ\nsản phẩm đầu tư hấp dẫn trên Finhay',
    btn_download_app: 'Tải ứng dụng',
    btn_later: 'Lúc khác',
    qr_download_prompt: 'Quét mã QR để tải xuống ứng dụng\nFinhay trên điện thoại',
};

export const RegisterPassword = () => {
    const { startLoading, stopLoading } = useLoadingStore();
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const { register, registerSetStep } = useAuthFlowStore();
    const { phone, verifiedOtp } = register;
    const { setAuth, initialize } = useAuthStore();
    const { ensureAccount } = usePaperAccountStore();

    const form = useForm({
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
        onSubmit: async ({ value }) => {
            startLoading();
            try {
                await handleRegister(value.password);
            } finally {
                stopLoading();
            }
        },
    });

    const password = useStore(form.store, (state) => state.values.password);
    const confirmPassword = useStore(form.store, (state) => state.values.confirmPassword);
    const canSubmit = useStore(
        form.store,
        (state) => state.canSubmit && !state.isSubmitting && !!password && !!confirmPassword,
    );

    const requirements = getPasswordRequirements(password, confirmPassword);

    const requirementTranslations = PASSWORD_REQUIREMENT_LABELS;

    const handleRegister = async (passwordParam: string) => {
        try {
            const {
                error_code,
                message,
                data: responseData,
            } = await registerAccountV3(phone, passwordParam, verifiedOtp);

            if (isSuccessApi(error_code)) {
                setAccessToken(responseData.access_token);
                setAccessKey(responseData.access_key);
                setUserId(responseData.user_id);
                setRefreshToken(responseData.refresh_token);
                setCustId(responseData.cust_id);

                setAuth({
                    accessToken: responseData.access_token,
                    accessKey: responseData.access_key,
                    refreshToken: responseData.refresh_token,
                    userId: responseData.user_id,
                    custId: responseData.cust_id,
                });
                await initialize();
                await ensureAccount();
                registerSetStep(STEPS_REGISTER.SUCCESS);
                return;
            }

            toast.error(message);
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'Có lỗi xảy ra, vui lòng thử lại'));
        }
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
            }}
            className="flex w-1/2 flex-col gap-4 rounded-xl"
        >
            <section className="flex w-full flex-col gap-4">
                {REGISTER_PASSWORD_FIELDS.map(
                    ({ key, labelTranslateKey, placeholderTranslateKey, showError }) => {
                        const fieldKey = key;

                        return (
                            <form.Field
                                key={key}
                                name={fieldKey}
                                validators={{
                                    onChangeListenTo:
                                        fieldKey === 'confirmPassword' ? ['password'] : undefined,
                                    onChange: ({ value, fieldApi }) => {
                                        if (fieldKey === 'password') {
                                            return validatePassword(value, AUTH_VALIDATE);
                                        }
                                        const passwordValue =
                                            fieldApi.form.getFieldValue('password');
                                        return validateConfirmPassword(
                                            value,
                                            passwordValue,
                                            AUTH_VALIDATE,
                                        );
                                    },
                                }}
                            >
                                {(field) => (
                                    <InputField
                                        id={`auth-dialog-register-pwd-${key}`}
                                        type="password"
                                        label={
                                            AUTH_REGISTER[
                                                labelTranslateKey as keyof typeof AUTH_REGISTER
                                            ]
                                        }
                                        placeholder={
                                            AUTH_REGISTER[
                                                placeholderTranslateKey as keyof typeof AUTH_REGISTER
                                            ]
                                        }
                                        error={field.state.meta.errors?.[0]}
                                        showError={showError}
                                        ariaDescribedBy="password-requirements"
                                        value={field.state.value || ''}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                        onFocus={() => setFocusedField(fieldKey)}
                                    />
                                )}
                            </form.Field>
                        );
                    },
                )}
                <PasswordRequirements
                    focusedField={focusedField}
                    requirements={requirements}
                    translations={requirementTranslations}
                    legendText={'Yêu cầu mật khẩu'}
                />
            </section>
            <footer className="flex w-full flex-col items-center gap-2">
                <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`w-2/3 body-4-highlight rounded-full px-4 py-2 transition-all ${
                        canSubmit
                            ? 'base-highlight text-quaternary hover:opacity-90'
                            : 'bg-disabled text-disabled cursor-not-allowed'
                    }`}
                >
                    {'Xong'}
                </button>
            </footer>
        </form>
    );
};
