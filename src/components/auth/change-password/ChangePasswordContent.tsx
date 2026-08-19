'use client';

import { useForm, useStore } from '@tanstack/react-form';

import { useState } from 'react';

import { FaCheck } from 'react-icons/fa6';

import { AuthUI } from '@/components/auth/AuthUI';
import { InputField } from '@/components/common/feature/InputField';
import { PasswordRequirements } from '@/components/common/feature/PasswordRequirements';
import { AUTH_MODE } from '@/constants/auth';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
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
    const trans = useTranslate();
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
                    toast.success(trans.auth.change.msg_pass_updated);
                    openAuthDialog(AUTH_MODE.LOGIN);
                    return;
                }

                toast.error(message);
            } catch (err) {
                toast.error(getApiErrorMessage(err, trans.common.try_again_error));
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

    const requirementTranslations = Object.fromEntries(
        Object.entries(trans.auth.change).map(([key, value]) => [key, value as string]),
    );

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
                <h2 className="font-body-2 text-primary text-center">
                    {trans.auth.change.description}
                </h2>
                <section className="flex w-full flex-col gap-4">
                    <form.Field
                        name="oldPassword"
                        validators={{
                            onChange: ({ value }) =>
                                validateRequired(value, trans.auth.change.err_old_pass_required),
                        }}
                    >
                        {(field) => (
                            <InputField
                                id="auth-dialog-change-old-password"
                                type="password"
                                label={trans.auth.change.old_pass_lbl}
                                placeholder={trans.auth.change.input_old_pass}
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
                                onChange: ({ value }) =>
                                    validatePassword(value, trans.auth.validate),
                            }}
                        >
                            {(field) => (
                                <InputField
                                    id="auth-dialog-change-new-password"
                                    type="password"
                                    label={trans.auth.change.new_pass_lbl}
                                    placeholder={trans.auth.change.input_new_pass}
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
                                translations={requirementTranslations}
                                legendText={trans.auth.change.pass_rules_title}
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
                                        trans.auth.validate,
                                    );
                                },
                            }}
                        >
                            {(field) => (
                                <InputField
                                    id="auth-dialog-change-confirm-password"
                                    type="password"
                                    label={trans.auth.change.confirm_pass_lbl}
                                    placeholder={trans.auth.change.input_confirm_pass}
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
                                translations={requirementTranslations}
                                legendText={trans.auth.change.pass_rules_title}
                            />
                        )}
                    </div>
                </section>
                <footer className="flex w-full flex-col items-center">
                    <button
                        type="submit"
                        disabled={!canSubmit || isLoading}
                        className={`w-2/3 font-body-3-highlight rounded-full px-4 py-2 transition-all ${
                            canSubmit && !isLoading
                                ? 'bg-highlight text-quaternary hover:opacity-90'
                                : 'bg-disabled text-disabled cursor-not-allowed'
                        }`}
                    >
                        {trans.auth.change.btn_update_pass}
                    </button>
                </footer>
            </form>
            <AuthUI />
        </section>
    );
};
