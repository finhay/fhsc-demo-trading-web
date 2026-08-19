'use client';

import { ChangePasswordContent } from '@/components/auth/change-password/ChangePasswordContent';
import { LoginContent } from '@/components/auth/login/LoginContent';
import { RegisterContent } from '@/components/auth/register/RegisterContent';
import { ResetContent } from '@/components/auth/reset-password/ResetContent';
import { Dialog } from '@/components/common/ui/Dialog';
import { AUTH_MODE, STEPS_REGISTER, STEPS_RESET_PASSWORD } from '@/constants/auth';
import { useAuthFlowStore } from '@/stores/auth/useAuthFlowStore';

export const AuthFlow = () => {
    const {
        authDialogMode,
        closeAuthDialog,
        register,
        resetPassword,
        registerSetStep,
        resetPasswordSetStep,
    } = useAuthFlowStore();

    if (!authDialogMode) return null;

    let dialogTitle: string | undefined;
    let dialogOnBack: (() => void) | undefined;

    switch (authDialogMode) {
        case AUTH_MODE.LOGIN:
            dialogTitle = 'Đăng nhập Finhay';
            break;
        case AUTH_MODE.CHANGE_PASSWORD:
            dialogTitle = 'Đổi mật khẩu';
            break;
        case AUTH_MODE.REGISTER:
            switch (register.step) {
                case STEPS_REGISTER.CREATE_ACCOUNT:
                    dialogTitle = 'Tạo tài khoản';
                    break;
                case STEPS_REGISTER.VERIFY_OTP:
                    dialogTitle = 'Xác thực OTP';
                    dialogOnBack = () => registerSetStep(STEPS_REGISTER.CREATE_ACCOUNT);
                    break;
                case STEPS_REGISTER.CREATE_PASSWORD:
                    dialogTitle = 'Tạo mật khẩu';
                    dialogOnBack = () => registerSetStep(STEPS_REGISTER.VERIFY_OTP);
                    break;
                case STEPS_REGISTER.SUCCESS:
                    dialogTitle = 'Mở tài khoản thành công';
                    break;
                default:
                    dialogTitle = 'Tạo tài khoản';
            }
            break;
        case AUTH_MODE.RESET_PASSWORD:
            if (resetPassword.isSuccess) {
                dialogTitle = 'Mật khẩu đã được cập nhật thành công';
            } else {
                switch (resetPassword.step) {
                    case STEPS_RESET_PASSWORD.ACCOUNT_INFO:
                        dialogTitle = 'Thông tin tài khoản';
                        break;
                    case STEPS_RESET_PASSWORD.VERIFY_OTP:
                        dialogTitle = 'Xác thực OTP';
                        dialogOnBack = () =>
                            resetPasswordSetStep(STEPS_RESET_PASSWORD.ACCOUNT_INFO);
                        break;
                    case STEPS_RESET_PASSWORD.CREATE_NEW_PASSWORD:
                        dialogTitle = 'Tạo mật khẩu mới';
                        dialogOnBack = () => resetPasswordSetStep(STEPS_RESET_PASSWORD.VERIFY_OTP);
                        break;
                    default:
                        dialogTitle = 'Đặt lại mật khẩu';
                }
            }
            break;
        default:
            dialogTitle = undefined;
    }

    const renderContent = () => {
        switch (authDialogMode) {
            case AUTH_MODE.LOGIN:
                return <LoginContent />;
            case AUTH_MODE.REGISTER:
                return <RegisterContent />;
            case AUTH_MODE.RESET_PASSWORD:
                return <ResetContent />;
            case AUTH_MODE.CHANGE_PASSWORD:
                return <ChangePasswordContent />;
            default:
                return null;
        }
    };

    return (
        <Dialog
            title={dialogTitle}
            maxWidth="max-w-4xl"
            maxHeight="max-h-[70vh]"
            panelClassName="gap-4 bg-[linear-gradient(to_bottom,#1C5E2C_0%,#171719_60%,#171719_100%)] p-4"
            onClose={closeAuthDialog}
            onBack={dialogOnBack}
        >
            {renderContent()}
        </Dialog>
    );
};
