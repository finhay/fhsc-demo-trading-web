'use client';

import { useForm, useStore } from '@tanstack/react-form';

import { InputField } from '@/components/common/feature/InputField';
import {
    ACCOUNT_TYPES,
    AUTH_MODE,
    RESET_PASSWORD_ACCOUNT_FIELDS,
    STEPS_RESET_PASSWORD,
} from '@/constants/auth';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import {
    checkEnterpriseEmailRegisteredStatus,
    checkPhoneRegisteredStatus,
} from '@/services/api/accounts/register';
import { useAuthFlowStore } from '@/stores/auth/useAuthFlowStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { validateResetPasswordUsername } from '@/utils/auth';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';

export const ResetAccount = () => {
    const trans = useTranslate();
    const { startLoading, stopLoading } = useLoadingStore();
    const {
        resetPasswordSetStep,
        resetPasswordSetUsername,
        resetPasswordSetAccountType,
        openAuthDialog,
    } = useAuthFlowStore();

    const form = useForm({
        defaultValues: {
            username: '',
            accountType: 'individual' as (typeof ACCOUNT_TYPES)[number]['key'],
        },
        onSubmit: async ({ value }) => {
            startLoading();
            try {
                await handleCheckAccount(value.username, value.accountType);
            } finally {
                stopLoading();
            }
        },
    });

    const watchedAccountType = useStore(form.store, (state) => state.values.accountType);
    const username = useStore(form.store, (state) => state.values.username);
    const canSubmit = useStore(
        form.store,
        (state) => state.canSubmit && !state.isSubmitting && !!username,
    );

    const currentField =
        RESET_PASSWORD_ACCOUNT_FIELDS[
            watchedAccountType as keyof typeof RESET_PASSWORD_ACCOUNT_FIELDS
        ];

    const handleAccountTypeChange = (key: string) => {
        form.setFieldValue('accountType', key as (typeof ACCOUNT_TYPES)[number]['key']);
        form.setFieldValue('username', '');
        form.setFieldMeta('username', (prev) => ({ ...prev, errors: [], errorMap: {} }));
    };

    const handleCheckAccount = async (usernameParam: string, accountType: string) => {
        try {
            const isIndividual = accountType === 'individual';
            const { error_code, message } = isIndividual
                ? await checkPhoneRegisteredStatus(usernameParam)
                : await checkEnterpriseEmailRegisteredStatus(usernameParam);

            if (isSuccessApi(error_code)) {
                resetPasswordSetUsername(usernameParam);
                resetPasswordSetAccountType(accountType);
                resetPasswordSetStep(STEPS_RESET_PASSWORD.VERIFY_OTP);
            } else {
                toast.error(message);
            }
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
            <header className="flex w-full flex-col gap-2">
                <nav className="flex w-full gap-2" role="tablist">
                    {ACCOUNT_TYPES.map(({ key, translateKey }) => {
                        const isActive = watchedAccountType === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => handleAccountTypeChange(key)}
                                className={`rounded-full px-3 py-1 transition-colors ${
                                    isActive
                                        ? 'bg-tertiary text-primary font-caption-highlight'
                                        : 'text-secondary font-caption'
                                }`}
                            >
                                {trans.auth.login[translateKey as keyof typeof trans.auth.login]}
                            </button>
                        );
                    })}
                </nav>
            </header>
            <section className="flex w-full flex-col gap-6">
                <form.Field
                    name="username"
                    validators={{
                        onChange: ({ value }) =>
                            validateResetPasswordUsername(
                                value,
                                watchedAccountType,
                                trans.auth.validate,
                            ),
                    }}
                >
                    {(field) => (
                        <InputField
                            id="auth-dialog-reset-username"
                            type={currentField.type}
                            label={
                                trans.auth.reset[
                                    currentField.labelTranslateKey as keyof typeof trans.auth.reset
                                ]
                            }
                            placeholder={
                                trans.auth.reset[
                                    currentField.placeholderTranslateKey as keyof typeof trans.auth.reset
                                ]
                            }
                            error={field.state.meta.errors?.[0]}
                            value={field.state.value || ''}
                            onInput={(e) => {
                                const input = e.target as HTMLInputElement;
                                if (currentField.inputFilter) {
                                    input.value = input.value.replace(currentField.inputFilter, '');
                                }
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
                    {trans.auth.reset.btn_continue}
                </button>
                <p className="font-body-3 text-primary">{trans.auth.reset.or_sep}</p>
                <button
                    type="button"
                    onClick={() => openAuthDialog(AUTH_MODE.LOGIN)}
                    className="font-body-3-highlight text-highlight hover:underline bg-transparent border-none cursor-pointer"
                >
                    {trans.auth.reset.back_login}
                </button>
            </footer>
        </form>
    );
};
