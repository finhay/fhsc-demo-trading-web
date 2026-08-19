import Image from 'next/image';

import { FiCheckSquare } from 'react-icons/fi';

import { SSO_CONSENT_IMAGE_URL, SSO_CONSENT_SHARED_ITEMS, SSO_ERROR_CODE } from '@/constants/auth';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { submitSsoConsent } from '@/services/api/accounts/sso';
import { useAuthFlowStore } from '@/stores/auth/useAuthFlowStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';

export const SsoConsent = () => {
    const trans = useTranslate();
    const { ssoAuthCode, ssoRedirectTo, cancelSso, resetSsoState } = useAuthFlowStore();
    const { startLoading, stopLoading, isLoading } = useLoadingStore();

    const handleConfirm = async () => {
        if (!ssoAuthCode || !ssoRedirectTo) return;
        startLoading();
        try {
            const res = await submitSsoConsent(ssoAuthCode);
            if (res.data?.is_success) {
                resetSsoState();
                window.location.href = ssoRedirectTo;
                return;
            }
            stopLoading();
            toast.error(
                isSuccessApi(res.error_code)
                    ? trans.auth.sso.error
                    : res.message || trans.auth.sso.error,
            );
        } catch (err) {
            stopLoading();
            toast.error(getApiErrorMessage(err, trans.auth.sso.error));
        }
    };

    const canConfirm = !!ssoAuthCode && !!ssoRedirectTo && !isLoading;

    return (
        <section className="flex w-full gap-6 items-stretch text-primary">
            <div className="hidden sm:flex w-1/2 items-center justify-center bg-[#54545433] rounded-xl p-4">
                <Image
                    src={SSO_CONSENT_IMAGE_URL}
                    alt={trans.auth.sso.consent_title}
                    width={356}
                    height={356}
                    className="max-w-full h-auto object-contain"
                />
            </div>
            <div className="flex w-full sm:w-1/2 flex-col justify-center gap-6">
                <div className="flex flex-col gap-2">
                    <p className="font-body-3 text-primary">{trans.auth.sso.consent_desc}</p>
                    <p className="font-body-3-highlight text-primary">
                        {trans.auth.sso.consent_shared_label}
                    </p>
                </div>

                <div className="flex flex-col gap-2">
                    {SSO_CONSENT_SHARED_ITEMS.map(({ translateKey }) => (
                        <div key={translateKey} className="flex items-center gap-2">
                            <FiCheckSquare size={16} className="text-highlight shrink-0" />
                            <span className="font-body-3 text-primary">
                                {trans.auth.sso[translateKey]}
                            </span>
                        </div>
                    ))}
                </div>

                <p className="font-body-3 text-secondary">
                    {trans.auth.sso.consent_terms_prefix}{' '}
                    <button type="button" className="text-highlight cursor-pointer hover:underline">
                        {trans.auth.sso.consent_terms_link}
                    </button>
                </p>
                <div className="flex flex-col gap-2">
                    <button
                        type="button"
                        disabled={!canConfirm}
                        onClick={handleConfirm}
                        className={`w-full rounded-full font-body-3-highlight py-2 transition-all ${
                            canConfirm
                                ? 'bg-highlight text-quaternary cursor-pointer hover:opacity-90'
                                : 'bg-disabled text-disabled cursor-not-allowed'
                        }`}
                    >
                        {trans.auth.sso.consent_btn}
                    </button>
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => cancelSso(SSO_ERROR_CODE.ACCESS_DENIED)}
                        className={`w-full rounded-full font-body-3 py-2 transition-colors ${
                            isLoading
                                ? 'text-disabled cursor-not-allowed'
                                : 'text-secondary cursor-pointer hover:text-primary'
                        }`}
                    >
                        {trans.auth.sso.consent_reject}
                    </button>
                </div>
            </div>
        </section>
    );
};
