'use client';

import { useForm, useStore } from '@tanstack/react-form';

import { useState } from 'react';

import { FaCheck } from 'react-icons/fa6';

import { AuthUI } from '@/components/auth/AuthUI';
import { InputField } from '@/components/common/feature/InputField';
import { PasswordRequirements } from '@/components/common/feature/PasswordRequirements';
import { AUTH_MODE, AUTH_VALIDATE, PASSWORD_REQUIREMENT_LABELS } from '@/constants/auth';
import { toast } from '@/hooks/lib/useToast';
import { putChangePasswordEnterprise } from '@/services/api/auth/password';
import { clearLocalStorage } from '@/services/localStorage';
import { useAuthFlowStore } from '@/stores/auth/useAuthFlowStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import {
    getPasswordRequirements,
    validateConfirmPassword,
    validatePassword,
    validateRequired,
} from '@/utils/auth';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';

export const ChangePasswordContent = () => {
    const { openAuthDialog } = useAuthFlowStore();
    const { startLoading, stopLoading, isLoading } = useLoadingStore();
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const form = useForm({
        defaultValues: {
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
        onSubmit: async ({ value }) => {
            startLoading();
            try {
                const { error_code, message } = await putChangePasswordEnterprise(
                    value.oldPassword,
                    value.newPassword,
                );

                if (isSuccessApi(error_code)) {
                    clearLocalStorage();
                    toast.success('Mật khẩu đã được cập nhật thành công');
                    openAuthDialog(AUTH_MODE.LOGIN);
                    return;
                }

                toast.error(message);
            } catch (err) {
                toast.error(getApiErrorMessage(err, 'Có lỗi xảy ra, vui lòng thử lại'));
            } finally {
                stopLoading();
            }
        },
    });

    const oldPassword = useStore(form.store, (state) => state.values.oldPassword);
    const newPassword = useStore(form.store, (state) => state.values.newPassword);
    const confirmPassword = useStore(form.store, (state) => state.values.confirmPassword);
    const canSubmit = useStore(
        form.store,
        (state) =>
            state.canSubmit &&
            !state.isSubmitting &&
            !!oldPassword &&
            !!newPassword &&
            !!confirmPassword,
    );

    const requirements = getPasswordRequirements(newPassword, confirmPassword);

    return (
        <section className="flex w-full items-stretch justify-center gap-4">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}
                className="flex w-1/2 flex-col items-center gap-4 rounded-xl"
            >
                <FaCheck className="text-green" size={100} />
                <h2 className="body-3 text-primary text-center">
                    {'Cập nhật mật khẩu mới ngay để giữ an toàn cho tài khoản của bạn'}
                </h2>
                <section className="flex w-full flex-col gap-4">
                    <form.Field
                        name="oldPassword"
                        validators={{
                            onChange: ({ value }) =>
                                validateRequired(value, 'Vui lòng nhập mật khẩu cũ'),
                        }}
                    >
                        {(field) => (
                            <InputField
                                id="auth-dialog-change-old-password"
                                type="password"
                                label={'Mật khẩu cũ'}
                                placeholder={'Nhập mật khẩu cũ'}
                                error={field.state.meta.errors?.[0]}
                                value={field.state.value || ''}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                            />
                        )}
                    </form.Field>

                    <div className="flex w-full flex-col gap-4">
                        <form.Field
                            name="newPassword"
                            validators={{
                                onChange: ({ value }) => validatePassword(value, AUTH_VALIDATE),
                            }}
                        >
                            {(field) => (
                                <InputField
                                    id="auth-dialog-change-new-password"
                                    type="password"
                                    label={'Mật khẩu mới'}
                                    placeholder={'Nhập mật khẩu mới'}
                                    error={field.state.meta.errors?.[0]}
                                    showError={false}
                                    ariaDescribedBy="password-requirements"
                                    value={field.state.value || ''}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    onFocus={() => setFocusedField('password')}
                                />
                            )}
                        </form.Field>
                        {focusedField === 'password' && (
                            <PasswordRequirements
                                focusedField="password"
                                requirements={requirements}
                                translations={PASSWORD_REQUIREMENT_LABELS}
                                legendText={'Yêu cầu mật khẩu'}
                            />
                        )}
                    </div>

                    <div className="flex w-full flex-col gap-4">
                        <form.Field
                            name="confirmPassword"
                            validators={{
                                onChangeListenTo: ['newPassword'],
                                onChange: ({ value, fieldApi }) => {
                                    const passwordValue =
                                        fieldApi.form.getFieldValue('newPassword');
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
                                    id="auth-dialog-change-confirm-password"
                                    type="password"
                                    label={'Xác nhận mật khẩu'}
                                    placeholder={'Nhập lại mật khẩu'}
                                    error={field.state.meta.errors?.[0]}
                                    ariaDescribedBy="password-requirements"
                                    value={field.state.value || ''}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    onFocus={() => setFocusedField('confirmPassword')}
                                />
                            )}
                        </form.Field>
                        {focusedField === 'confirmPassword' && (
                            <PasswordRequirements
                                focusedField="confirmPassword"
                                requirements={requirements}
                                translations={PASSWORD_REQUIREMENT_LABELS}
                                legendText={'Yêu cầu mật khẩu'}
                            />
                        )}
                    </div>
                </section>
                <footer className="flex w-full flex-col items-center">
                    <button
                        type="submit"
                        disabled={!canSubmit || isLoading}
                        className={`w-2/3 body-4-highlight rounded-full px-4 py-2 transition-all ${
                            canSubmit && !isLoading
                                ? 'base-highlight text-quaternary hover:opacity-90'
                                : 'bg-disabled text-disabled cursor-not-allowed'
                        }`}
                    >
                        {'Cập nhật mật khẩu'}
                    </button>
                </footer>
            </form>
            <AuthUI />
        </section>
    );
};
