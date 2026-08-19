'use client';

import { useForm, useStore } from '@tanstack/react-form';

import { useState } from 'react';

import { InputField } from '@/components/common/feature/InputField';
import { PasswordRequirements } from '@/components/common/feature/PasswordRequirements';
import { AUTH_MODE, REGISTER_PASSWORD_FIELDS } from '@/constants/auth';
import { ACCOUNT_TYPE } from '@/constants/common';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { putResetPassword } from '@/services/api/auth/password';
import { useAuthFlowStore } from '@/stores/auth/useAuthFlowStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { getPasswordRequirements, validateConfirmPassword, validatePassword } from '@/utils/auth';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';

export const ResetPassword = () => {
    const trans = useTranslate();
    const { startLoading, stopLoading } = useLoadingStore();
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const { resetPassword, resetPasswordSetIsSuccess, openAuthDialog } = useAuthFlowStore();
    const { accountType, otpToken } = resetPassword;

    const form = useForm({
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
        onSubmit: async ({ value }) => {
            startLoading();
            try {
                await handleResetPassword(value.password);
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

    const requirementTranslations = Object.fromEntries(
        Object.entries(trans.auth.change).map(([key, value]) => [key, value as string]),
    );

    const handleResetPassword = async (passwordParam: string) => {
        try {
            const userType =
                accountType === 'individual' ? ACCOUNT_TYPE.INDIVIDUAL : ACCOUNT_TYPE.ENTERPRISE;
            const { error_code, message } = await putResetPassword(
                otpToken,
                passwordParam,
                userType,
            );

            if (isSuccessApi(error_code)) {
                resetPasswordSetIsSuccess(true);
                toast.success(trans.auth.reset.msg_pass_updated);
                openAuthDialog(AUTH_MODE.LOGIN);
                return;
            }

            toast.error(message);
        } catch (err) {
            toast.error(getApiErrorMessage(err, trans.common.try_again_error));
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
                {REGISTER_PASSWORD_FIELDS.map(({ key, showError }) => {
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
                                        return validatePassword(value, trans.auth.validate);
                                    }
                                    const passwordValue = fieldApi.form.getFieldValue('password');
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
                                    id={`auth-dialog-reset-pwd-${key}`}
                                    type="password"
                                    label={
                                        key === 'password'
                                            ? trans.auth.reset.new_pass_lbl
                                            : trans.auth.reset.confirm_new_pass_lbl
                                    }
                                    placeholder={
                                        key === 'password'
                                            ? trans.auth.reset.input_new_pass
                                            : trans.auth.reset.input_confirm_new_pass
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
                })}
                <PasswordRequirements
                    focusedField={focusedField}
                    requirements={requirements}
                    translations={requirementTranslations}
                    legendText={trans.auth.reset.pass_rules_title}
                />
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
                    {trans.auth.reset.btn_update}
                </button>
            </footer>
        </form>
    );
};
