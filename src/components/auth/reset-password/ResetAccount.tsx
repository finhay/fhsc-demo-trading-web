'use client';

import { useForm, useStore } from '@tanstack/react-form';

import { InputField } from '@/components/common/feature/InputField';
import {
    ACCOUNT_TYPES,
    AUTH_MODE,
    AUTH_VALIDATE,
    RESET_PASSWORD_ACCOUNT_FIELDS,
    STEPS_RESET_PASSWORD,
} from '@/constants/auth';
import { toast } from '@/hooks/lib/useToast';
import {
    checkEnterpriseEmailRegisteredStatus,
    checkPhoneRegisteredStatus,
} from '@/services/api/accounts/register';
import { useAuthFlowStore } from '@/stores/auth/useAuthFlowStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { validateResetPasswordUsername } from '@/utils/auth';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';

export const ResetAccount = () => {
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
            accountType: ACCOUNT_TYPES[0].key as (typeof ACCOUNT_TYPES)[number]['key'],
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

    const currentField = RESET_PASSWORD_ACCOUNT_FIELDS[watchedAccountType];

    const handleAccountTypeChange = (key: (typeof ACCOUNT_TYPES)[number]['key']) => {
        form.setFieldValue('accountType', key);
        form.setFieldValue('username', '');
        form.setFieldMeta('username', (prev) => ({ ...prev, errors: [], errorMap: {} }));
    };

    const handleCheckAccount = async (usernameParam: string, accountType: string) => {
        try {
            const isIndividual = accountType === ACCOUNT_TYPES[0].key;
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
            <header className="flex w-full flex-col gap-2">
                <nav className="flex w-full gap-2" role="tablist">
                    {ACCOUNT_TYPES.map(({ key, label }) => {
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
                                        ? 'base-tertiary text-primary body-5-highlight'
                                        : 'text-secondary body-5'
                                }`}
                            >
                                {label}
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
                            validateResetPasswordUsername(value, watchedAccountType, AUTH_VALIDATE),
                    }}
                >
                    {(field) => (
                        <InputField
                            id="auth-dialog-reset-username"
                            type={currentField.type}
                            label={currentField.label}
                            placeholder={currentField.placeholder}
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
                    className={`w-2/3 body-4-highlight rounded-full px-4 py-2 transition-all ${
                        canSubmit
                            ? 'base-highlight text-quaternary hover:opacity-90'
                            : 'bg-disabled text-disabled cursor-not-allowed'
                    }`}
                >
                    {'Tiếp tục'}
                </button>
                <p className="body-4 text-primary">{'Hoặc'}</p>
                <button
                    type="button"
                    onClick={() => openAuthDialog(AUTH_MODE.LOGIN)}
                    className="body-4-highlight text-highlight hover:underline bg-transparent border-none cursor-pointer"
                >
                    {'Quay lại đăng nhập'}
                </button>
            </footer>
        </form>
    );
};
