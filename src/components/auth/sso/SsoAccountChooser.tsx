import Image from 'next/image';

import { AUTH_MODE } from '@/constants/auth';
import { DEFAULT_AVATAR_URL } from '@/constants/common';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { useAuthFlowStore } from '@/stores/auth/useAuthFlowStore';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { getApiErrorMessage } from '@/utils/common';

export const SsoAccountChooser = () => {
    const trans = useTranslate();
    const { profile, avatarUrl, logout } = useAuthStore();
    const { ssoContext, ssoDeadlineAt, authorizeSso, openAuthDialog } = useAuthFlowStore();
    const { startLoading, stopLoading, isLoading } = useLoadingStore();

    if (!ssoContext || !ssoDeadlineAt || !profile) return null;

    const contactInfo = profile.email || profile.phone || '';

    const handleContinue = async () => {
        startLoading();
        try {
            const isRedirecting = await authorizeSso({
                client_id: ssoContext.clientId,
                redirect_uri: ssoContext.redirectUri,
                state: ssoContext.state,
            });
            if (!isRedirecting) stopLoading();
        } catch (err) {
            stopLoading();
            toast.error(getApiErrorMessage(err, trans.auth.sso.error));
        }
    };

    const handleUseOtherAccount = async () => {
        startLoading();
        try {
            await logout();
            openAuthDialog(AUTH_MODE.LOGIN);
        } catch (err) {
            toast.error(getApiErrorMessage(err, trans.auth.sso.error));
        } finally {
            stopLoading();
        }
    };

    return (
        <section className="flex w-full flex-col gap-4">
            <p className="font-body-3 text-secondary">{trans.auth.sso.chooser_desc}</p>

            <div className="flex items-center gap-3 rounded-xl bg-[#54545433] p-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-tertiary">
                    <Image
                        src={avatarUrl || DEFAULT_AVATAR_URL}
                        alt={profile.full_name}
                        fill
                        sizes="48px"
                        className="object-cover object-center"
                    />
                </div>
                <div className="flex min-w-0 flex-col">
                    <span className="font-body-3-highlight text-primary truncate">
                        {profile.full_name}
                    </span>
                    <span className="font-caption text-secondary truncate">{contactInfo}</span>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleContinue}
                    className={`w-full rounded-full font-body-3-highlight py-2 transition-all ${
                        isLoading
                            ? 'bg-disabled text-disabled cursor-not-allowed'
                            : 'bg-highlight text-quaternary cursor-pointer hover:opacity-90'
                    }`}
                >
                    {trans.auth.sso.chooser_continue}
                </button>
                <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleUseOtherAccount}
                    className={`w-full rounded-full font-body-3-highlight py-2 transition-colors ${
                        isLoading
                            ? 'text-disabled cursor-not-allowed'
                            : 'text-highlight cursor-pointer hover:bg-highlight/10'
                    }`}
                >
                    {trans.auth.sso.chooser_other_account}
                </button>
            </div>
        </section>
    );
};
