'use client';

import { useForm, useStore } from '@tanstack/react-form';

import { InputField } from '@/components/common/feature/InputField';
import { AUTH_MODE, AUTH_VALIDATE, LOGIN_ACCOUNT_FIELD } from '@/constants/auth';
import { toast } from '@/hooks/lib/useToast';
import { loginIndividual } from '@/services/api/accounts/login';
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
    const { openAuthDialog, closeAuthDialog } = useAuthFlowStore();
    const { setAuth, initialize } = useAuthStore();
    const { startLoading, stopLoading, isLoading } = useLoadingStore();
    const form = useForm({
        defaultValues: {
            username: '',
            password: '',
        },
        onSubmit: async ({ value }) => {
            handleLogin(value.username || '', value.password);
        },
    });
    const username = useStore(form.store, (state) => state.values.username);
    const password = useStore(form.store, (state) => state.values.password);
    const canSubmit = useStore(
        form.store,
        (state) => state.canSubmit && !state.isSubmitting && !!username && !!password,
    );

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

    const handleLogin = async (usernameParam: string, passwordParam: string) => {
        startLoading();
        try {
            const {
                error_code,
                message,
                result: responseData,
            } = await loginIndividual({ username: usernameParam, password: passwordParam });

            if (isSuccessApi(error_code)) {
                handleSaveAuthTokens(responseData);

                setAuth({
                    accessToken: responseData.access_token,
                    accessKey: responseData.access_key,
                    refreshToken: responseData.refresh_token,
                    userId: responseData.user_id,
                    custId: responseData.cust_id,
                });

                await initialize();

                toast.success('Đăng nhập thành công!');
                closeAuthDialog();
                return;
            }

            toast.error(message);
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'Có lỗi xảy ra, vui lòng thử lại'));
        } finally {
            stopLoading();
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
                <form.Field
                    name="username"
                    validators={{
                        onChange: ({ value }) => validateLoginUsername(value, AUTH_VALIDATE),
                    }}
                >
                    {(field) => (
                        <InputField
                            id="auth-dialog-login-username"
                            type={LOGIN_ACCOUNT_FIELD.type}
                            label={LOGIN_ACCOUNT_FIELD.label}
                            placeholder={LOGIN_ACCOUNT_FIELD.placeholder}
                            error={field.state.meta.errors?.[0]}
                            value={field.state.value || ''}
                            onInput={(e) => {
                                const input = e.target as HTMLInputElement;
                                input.value = input.value.replace(
                                    LOGIN_ACCOUNT_FIELD.inputFilter,
                                    '',
                                );
                            }}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                        />
                    )}
                </form.Field>
                <form.Field
                    name="password"
                    validators={{
                        onChange: ({ value }) => validateRequired(value, 'Vui lòng nhập mật khẩu'),
                    }}
                >
                    {(field) => (
                        <InputField
                            id="auth-dialog-login-password"
                            type="password"
                            label={'Mật khẩu'}
                            placeholder={'Mật khẩu tài khoản'}
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
                    {'Đăng nhập'}
                </button>
                <button
                    type="button"
                    onClick={() => openAuthDialog(AUTH_MODE.RESET_PASSWORD)}
                    className="font-body-3-highlight text-primary hover:underline bg-transparent border-none cursor-pointer"
                >
                    {'Bạn không nhớ mật khẩu?'}
                </button>
                <p className="font-body-3 text-primary">{'Hoặc'}</p>
                <button
                    type="button"
                    onClick={() => openAuthDialog(AUTH_MODE.REGISTER)}
                    className="w-2/3 font-body-3-highlight rounded-full px-4 py-2 transition-all mx-auto text-center border-none bg-success text-highlight cursor-pointer hover:opacity-90"
                >
                    {'Bạn chưa có tài khoản'}
                </button>
            </footer>
        </form>
    );
};
