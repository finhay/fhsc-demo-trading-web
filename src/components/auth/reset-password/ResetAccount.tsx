'use client';

import { useForm, useStore } from '@tanstack/react-form';

import { InputField } from '@/components/common/feature/InputField';
import {
    AUTH_MODE,
    AUTH_VALIDATE,
    RESET_PASSWORD_ACCOUNT_FIELD,
    STEPS_RESET_PASSWORD,
} from '@/constants/auth';
import { toast } from '@/hooks/lib/useToast';
import { checkPhoneRegisteredStatus } from '@/services/api/accounts/register';
import { useAuthFlowStore } from '@/stores/auth/useAuthFlowStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { validateResetPasswordUsername } from '@/utils/auth';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';

const AUTH_RESET = {
    title: 'Đặt lại mật khẩu',
    msg_pass_updated: 'Mật khẩu đã được cập nhật thành công',
    acct_info_title: 'Thông tin tài khoản',
    phone_lbl: 'Số điện thoại',
    email: 'Email',
    input_phone: 'Nhập số điện thoại của bạn',
    input_email: 'Nhập email của bạn',
    btn_continue: 'Tiếp tục',
    or_sep: 'Hoặc',
    back_login: 'Quay lại đăng nhập',
    back: 'Quay lại',
    resend: 'Gửi lại',
    new_pass_title: 'Tạo mật khẩu mới',
    new_pass_lbl: 'Mật khẩu mới',
    confirm_new_pass_lbl: 'Xác nhận mật khẩu mới',
    input_new_pass: 'Nhập mật khẩu mới',
    input_confirm_new_pass: 'Nhập lại mật khẩu mới',
    pass_rules_title: 'Yêu cầu mật khẩu',
    btn_update: 'Cập nhật',
};

export const ResetAccount = () => {
    const { startLoading, stopLoading } = useLoadingStore();
    const { resetPasswordSetStep, resetPasswordSetUsername, openAuthDialog } = useAuthFlowStore();

    const form = useForm({
        defaultValues: { username: '' },
        onSubmit: async ({ value }) => {
            startLoading();
            try {
                await handleCheckAccount(value.username);
            } finally {
                stopLoading();
            }
        },
    });

    const username = useStore(form.store, (state) => state.values.username);
    const canSubmit = useStore(
        form.store,
        (state) => state.canSubmit && !state.isSubmitting && !!username,
    );

    const handleCheckAccount = async (usernameParam: string) => {
        try {
            const { error_code, message } = await checkPhoneRegisteredStatus(usernameParam);

            if (isSuccessApi(error_code)) {
                resetPasswordSetUsername(usernameParam);
                resetPasswordSetStep(STEPS_RESET_PASSWORD.VERIFY_OTP);
            } else {
                toast.error(message);
            }
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
            <section className="flex w-full flex-col gap-6">
                <form.Field
                    name="username"
                    validators={{
                        onChange: ({ value }) =>
                            validateResetPasswordUsername(value, AUTH_VALIDATE),
                    }}
                >
                    {(field) => (
                        <InputField
                            id="auth-dialog-reset-username"
                            type={RESET_PASSWORD_ACCOUNT_FIELD.type}
                            label={RESET_PASSWORD_ACCOUNT_FIELD.label}
                            placeholder={RESET_PASSWORD_ACCOUNT_FIELD.placeholder}
                            error={field.state.meta.errors?.[0]}
                            value={field.state.value || ''}
                            onInput={(e) => {
                                const input = e.target as HTMLInputElement;
                                input.value = input.value.replace(
                                    RESET_PASSWORD_ACCOUNT_FIELD.inputFilter,
                                    '',
                                );
                            }}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                        />
                    )}
                </form.Field>
            </section>
            <footer className="flex w-full flex-col items-center gap-2">
                <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`w-2/3 font-body-3-highlight rounded-full px-4 py-2 transition-all ${
                        canSubmit
                            ? 'bg-highlight text-quaternary hover:opacity-90'
                            : 'bg-disabled text-disabled cursor-not-allowed'
                    }`}
                >
                    {'Tiếp tục'}
                </button>
                <p className="font-body-3 text-primary">{'Hoặc'}</p>
                <button
                    type="button"
                    onClick={() => openAuthDialog(AUTH_MODE.LOGIN)}
                    className="font-body-3-highlight text-highlight hover:underline bg-transparent border-none cursor-pointer"
                >
                    {'Quay lại đăng nhập'}
                </button>
            </footer>
        </form>
    );
};
