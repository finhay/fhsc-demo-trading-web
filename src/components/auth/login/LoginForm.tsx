'use client';

import { useForm, useStore } from '@tanstack/react-form';

import { InputField } from '@/components/common/feature/InputField';
import { ACCOUNT_TYPES, AUTH_MODE, LOGIN_ACCOUNT_FIELDS } from '@/constants/auth';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { loginEnterprise, loginIndividual } from '@/services/api/accounts/login';
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
import { validateLoginUsername, validateRequired } from '@/utils/auth';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';

export const LoginForm = () => {
    const trans = useTranslate();
    const { openAuthDialog, closeAuthDialog, ssoContext, authorizeSso } = useAuthFlowStore();
    const { setAuth, initialize } = useAuthStore();
    const { startLoading, stopLoading, isLoading } = useLoadingStore();
    const form = useForm({
        defaultValues: {
            username: '',
            password: '',
            accountType: ACCOUNT_TYPES[0].key as (typeof ACCOUNT_TYPES)[number]['key'],
        },
        onSubmit: async ({ value }) => {
            handleLogin(value.username || '', value.password, value.accountType);
        },
    });
    const watchedAccountType = useStore(form.store, (state) => state.values.accountType);
    const username = useStore(form.store, (state) => state.values.username);
    const password = useStore(form.store, (state) => state.values.password);
    const canSubmit = useStore(
        form.store,
        (state) => state.canSubmit && !state.isSubmitting && !!username && !!password,
    );
    const currentFields =
        LOGIN_ACCOUNT_FIELDS[watchedAccountType as keyof typeof LOGIN_ACCOUNT_FIELDS];

    const handleAccountTypeChange = (key: string) => {
        form.setFieldValue('accountType', key as (typeof ACCOUNT_TYPES)[number]['key']);
        form.setFieldValue('username', '');
        form.setFieldMeta('username', (prev) => ({ ...prev, errors: [], errorMap: {} }));
    };

    const handleSaveAuthTokens = (data: {
        access_token: string;
        access_key: string;
        user_id: string;
        refresh_token: string;
        cust_id: string;
    }) => {
        setAccessToken(data.access_token);
        setAccessKey(data.access_key);
        setUserId(data.user_id);
        setRefreshToken(data.refresh_token);
        setCustId(data.cust_id);
    };

    const handleLogin = async (
        usernameParam: string,
        passwordParam: string,
        accountType: string,
    ) => {
        startLoading();
        let isRedirecting = false;
        try {
            const credentials = { username: usernameParam, password: passwordParam };
            const { error_code, message, responseData } =
                accountType === ACCOUNT_TYPES[0].key
                    ? await loginIndividual(credentials).then(
                          ({ error_code, message, result }) => ({
                              error_code,
                              message,
                              responseData: result,
                          }),
                      )
                    : await loginEnterprise(credentials).then(({ error_code, message, data }) => ({
                          error_code,
                          message,
                          responseData: data,
                      }));

            if (isSuccessApi(error_code)) {
                handleSaveAuthTokens(responseData);

                setAuth({
                    accessToken: responseData.access_token,
                    accessKey: responseData.access_key,
                    refreshToken: responseData.refresh_token,
                    userId: responseData.user_id,
                    custId: responseData.cust_id,
                    requiredChangePassword: responseData.required_change_password,
                });

                if (accountType === ACCOUNT_TYPES[1].key && responseData.required_change_password) {
                    openAuthDialog(AUTH_MODE.CHANGE_PASSWORD);
                    return;
                }

                await initialize();

                if (ssoContext) {
                    try {
                        isRedirecting = await authorizeSso({
                            client_id: ssoContext.clientId,
                            redirect_uri: ssoContext.redirectUri,
                            state: ssoContext.state,
                        });
                    } catch (err) {
                        toast.error(getApiErrorMessage(err, trans.auth.sso.error));
                    }
                    return;
                }

                toast.success(trans.auth.login.login_ok);
                closeAuthDialog();
                return;
            }

            toast.error(message);
        } catch (err) {
            toast.error(getApiErrorMessage(err, trans.common.try_again_error));
        } finally {
            if (!isRedirecting) stopLoading();
        }
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
            }}
            className={`flex flex-col gap-4 rounded-xl ${ssoContext ? 'w-full' : 'w-1/2'}`}
        >
            {!ssoContext && (
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
                                            ? 'bg-tertiary text-highlight font-caption-highlight'
                                            : 'text-secondary font-caption'
                                    }`}
                                >
                                    {
                                        trans.auth.login[
                                            translateKey as keyof typeof trans.auth.login
                                        ]
                                    }
                                </button>
                            );
                        })}
                    </nav>
                </header>
            )}
            <section className="flex w-full flex-col gap-4">
                {currentFields.map(
                    ({ key, type, labelTranslateKey, placeholderTranslateKey, inputFilter }) => {
                        return (
                            <form.Field
                                key={key}
                                name={key}
                                validators={{
                                    onChange: ({ value }) =>
                                        validateLoginUsername(
                                            value,
                                            watchedAccountType,
                                            trans.auth.validate,
                                        ),
                                }}
                            >
                                {(field) => (
                                    <InputField
                                        id={`auth-dialog-login-${key}`}
                                        type={type}
                                        label={
                                            trans.auth.login[
                                                labelTranslateKey as keyof typeof trans.auth.login
                                            ]
                                        }
                                        placeholder={
                                            trans.auth.login[
                                                placeholderTranslateKey as keyof typeof trans.auth.login
                                            ]
                                        }
                                        error={field.state.meta.errors?.[0]}
                                        value={field.state.value || ''}
                                        onInput={(e) => {
                                            const input = e.target as HTMLInputElement;
                                            if (inputFilter) {
                                                input.value = input.value.replace(inputFilter, '');
                                            }
                                        }}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                    />
                                )}
                            </form.Field>
                        );
                    },
                )}
                <form.Field
                    name="password"
                    validators={{
                        onChange: ({ value }) =>
                            validateRequired(value, trans.auth.login.err_pass_required),
                    }}
                >
                    {(field) => (
                        <InputField
                            id="auth-dialog-login-password"
                            type="password"
                            label={trans.auth.login.pass_lbl}
                            placeholder={trans.auth.login.input_acct_pass}
                            error={field.state.meta.errors?.[0]}
                            value={field.state.value || ''}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                        />
                    )}
                </form.Field>
            </section>
            <footer className="flex w-full flex-col items-center gap-2">
                <button
                    type="submit"
                    disabled={!canSubmit || isLoading}
                    className={`w-2/3 font-body-3-highlight rounded-full px-4 py-2 transition-all ${
                        canSubmit && !isLoading
                            ? 'bg-highlight text-quaternary hover:opacity-90'
                            : 'bg-disabled text-disabled cursor-not-allowed'
                    }`}
                >
                    {trans.auth.login.btn_login}
                </button>
                <button
                    type="button"
                    onClick={() => openAuthDialog(AUTH_MODE.RESET_PASSWORD)}
                    className="font-body-3-highlight text-primary hover:underline bg-transparent border-none cursor-pointer"
                >
                    {trans.auth.login.forgot_pass_link}
                </button>
                <p className="font-body-3 text-primary">{trans.auth.login.or_sep}</p>
                <button
                    type="button"
                    disabled={watchedAccountType !== ACCOUNT_TYPES[0].key}
                    onClick={() => openAuthDialog(AUTH_MODE.REGISTER)}
                    className={`w-2/3 font-body-3-highlight rounded-full px-4 py-2 transition-all mx-auto text-center border-none ${
                        watchedAccountType === ACCOUNT_TYPES[0].key
                            ? 'bg-success text-highlight cursor-pointer hover:opacity-90'
                            : 'bg-disabled text-disabled cursor-not-allowed'
                    }`}
                >
                    {trans.auth.login.signup_prompt}
                </button>
            </footer>
        </form>
    );
};
