'use client';

import { useEffect } from 'react';

import Image from 'next/image';

import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { useAuthFlowStore } from '@/stores/auth/useAuthFlowStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { trackRegisterSuccess } from '@/utils/analytics';
import { getApiErrorMessage } from '@/utils/common';

export const RegisterSuccess = () => {
    const trans = useTranslate();
    const { closeAuthDialog, ssoContext, authorizeSso } = useAuthFlowStore();
    const { startLoading, stopLoading, isLoading } = useLoadingStore();

    useEffect(() => {
        trackRegisterSuccess();
    }, []);

    const handleLater = async () => {
        if (!ssoContext) {
            closeAuthDialog();
            return;
        }

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

    return (
        <section className="flex w-full gap-4 rounded-xl items-stretch justify-center text-primary py-2">
            <section className="flex w-1/2 flex-col gap-4">
                <p className="font-body-3 text-center whitespace-pre-line">
                    {trans.auth.register.download_app_prompt}
                </p>
                <figure className="m-0 flex flex-col items-center">
                    <Image
                        src="https://cdn1.finhay.com.vn/vnsc-prod/1777863552264.2024-Gemini_Generated_Image.png"
                        alt={trans.auth.login.auth_sidebar_image_alt}
                        width={240}
                        height={120}
                        className="w-60 h-auto object-cover"
                    />
                </figure>
                <footer className="flex w-full items-center gap-2 font-body-3">
                    <button className="w-1/2 bg-highlight text-quaternary py-2 px-4 rounded-full">
                        {trans.auth.register.btn_download_app}
                    </button>
                    <button
                        type="button"
                        disabled={isLoading}
                        className="w-1/2 bg-success text-highlight py-2 px-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleLater}
                    >
                        {trans.auth.register.btn_later}
                    </button>
                </footer>
            </section>
            <section className="hidden sm:flex w-1/2 flex-col items-center justify-center gap-8 text-center bg-[#54545433] p-4 rounded-xl">
                <p className="font-body-3 text-center whitespace-pre-line">
                    {trans.auth.register.qr_download_prompt}
                </p>
                <figure className="m-0 flex flex-col items-center">
                    <Image
                        src="https://cdn1.finhay.com.vn/vnsc-prod/1741929570552-QR-Radar-Home.png?w=128"
                        alt={trans.download_app_modal.qr_image_alt}
                        width={200}
                        height={200}
                        className="w-48 h-48 object-contain rounded-xl"
                    />
                </figure>
            </section>
        </section>
    );
};
