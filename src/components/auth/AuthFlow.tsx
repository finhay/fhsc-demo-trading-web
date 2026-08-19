'use client';

import { ChangePasswordContent } from '@/components/auth/change-password/ChangePasswordContent';
import { LoginContent } from '@/components/auth/login/LoginContent';
import { RegisterContent } from '@/components/auth/register/RegisterContent';
import { ResetContent } from '@/components/auth/reset-password/ResetContent';
import { SsoAccountChooser } from '@/components/auth/sso/SsoAccountChooser';
import { SsoConsent } from '@/components/auth/sso/SsoConsent';
import { Dialog } from '@/components/common/ui/Dialog';
import { AUTH_MODE, STEPS_REGISTER, STEPS_RESET_PASSWORD } from '@/constants/auth';
import { useTranslate } from '@/hooks/useTranslate';
import { useAuthFlowStore } from '@/stores/auth/useAuthFlowStore';

export const AuthFlow = () => {
    const trans = useTranslate();
    const {
        authDialogMode,
        closeAuthDialog,
        register,
        resetPassword,
        registerSetStep,
        resetPasswordSetStep,
        ssoContext,
    } = useAuthFlowStore();

    if (!authDialogMode) return null;

    let dialogTitle: string | undefined;
    let dialogOnBack: (() => void) | undefined;
    const isSsoNarrowDialog =
        authDialogMode === AUTH_MODE.SSO_ACCOUNT_CHOOSER ||
        (ssoContext && authDialogMode === AUTH_MODE.LOGIN);
    const dialogMaxWidth = isSsoNarrowDialog ? 'max-w-md' : 'max-w-4xl';

    switch (authDialogMode) {
        case AUTH_MODE.LOGIN:
            dialogTitle = trans.auth.login.title;
            break;
        case AUTH_MODE.CHANGE_PASSWORD:
            dialogTitle = trans.auth.change.title;
            break;
        case AUTH_MODE.SSO_CONSENT:
            dialogTitle = trans.auth.sso.consent_title;
            break;
        case AUTH_MODE.SSO_ACCOUNT_CHOOSER:
            dialogTitle = trans.auth.sso.chooser_title;
            break;
        case AUTH_MODE.REGISTER:
            switch (register.step) {
                case STEPS_REGISTER.CREATE_ACCOUNT:
                    dialogTitle = trans.auth.register.hdr_create_acct;
                    break;
                case STEPS_REGISTER.VERIFY_OTP:
                    dialogTitle = trans.otp_verification.title;
                    dialogOnBack = () => registerSetStep(STEPS_REGISTER.CREATE_ACCOUNT);
                    break;
                case STEPS_REGISTER.CREATE_PASSWORD:
                    dialogTitle = trans.auth.register.create_pass_title;
                    dialogOnBack = () => registerSetStep(STEPS_REGISTER.VERIFY_OTP);
                    break;
                case STEPS_REGISTER.SUCCESS:
                    dialogTitle = trans.auth.register.open_acct_ok;
                    break;
                default:
                    dialogTitle = trans.auth.register.hdr_create_acct;
            }
            break;
        case AUTH_MODE.RESET_PASSWORD:
            if (resetPassword.isSuccess) {
                dialogTitle = trans.auth.reset.msg_pass_updated;
            } else {
                switch (resetPassword.step) {
                    case STEPS_RESET_PASSWORD.ACCOUNT_INFO:
                        dialogTitle = trans.auth.reset.acct_info_title;
                        break;
                    case STEPS_RESET_PASSWORD.VERIFY_OTP:
                        dialogTitle = trans.otp_verification.title;
                        dialogOnBack = () =>
                            resetPasswordSetStep(STEPS_RESET_PASSWORD.ACCOUNT_INFO);
                        break;
                    case STEPS_RESET_PASSWORD.CREATE_NEW_PASSWORD:
                        dialogTitle = trans.auth.reset.new_pass_title;
                        dialogOnBack = () => resetPasswordSetStep(STEPS_RESET_PASSWORD.VERIFY_OTP);
                        break;
                    default:
                        dialogTitle = trans.auth.reset.title;
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
            case AUTH_MODE.SSO_CONSENT:
                return <SsoConsent />;
            case AUTH_MODE.SSO_ACCOUNT_CHOOSER:
                return <SsoAccountChooser />;
            default:
                return null;
        }
    };

    return (
        <Dialog
            title={dialogTitle}
            maxWidth={dialogMaxWidth}
            maxHeight="max-h-[70vh]"
            panelClassName="gap-4 bg-[linear-gradient(to_bottom,#1C5E2C_0%,#171719_60%,#171719_100%)] p-4"
            onClose={closeAuthDialog}
            onBack={dialogOnBack}
        >
            {renderContent()}
        </Dialog>
    );
};
