'use client';

import { useEffect, useState } from 'react';

import QRCode from 'react-qr-code';

import { QR_INTERVAL } from '@/constants/common';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { createQrLoginChallenge, pollQrLoginChallengeStatus } from '@/services/api/auth/qr';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { useExchangeFlowStore } from '@/stores/haypoint/useExchangeFlowStore';
import { isSuccessApi } from '@/utils/common';

export const HaypointQRModal = () => {
    const trans = useTranslate();
    const { startLoading, stopLoading } = useLoadingStore();

    const [qrCodeId, setQrCodeId] = useState<string>('');

    const { submitRewardClaim } = useExchangeFlowStore();

    const generate = async () => {
        try {
            const { error_code, result, message } = await createQrLoginChallenge('TRADING');
            if (isSuccessApi(error_code)) {
                setQrCodeId(result.id);
            } else {
                throw new Error(message);
            }
        } catch {}
    };

    useEffect(() => {
        generate();

        const interval = setInterval(generate, QR_INTERVAL.REGENERATE);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!qrCodeId) return;

        let isApproved = false;

        const interval = setInterval(async () => {
            if (isApproved) return;

            try {
                const { error_code, result, message } = await pollQrLoginChallengeStatus(
                    qrCodeId,
                    'TRADING',
                );
                if (isSuccessApi(error_code)) {
                    if (result.status === 'APPROVED') {
                        isApproved = true;
                        clearInterval(interval);
                        toast.success(trans.haypoint.verify_ok);
                        startLoading();
                        try {
                            await submitRewardClaim(result?.access_token || '');
                        } finally {
                            stopLoading();
                        }
                    }
                } else {
                    toast.error(message);
                }
            } catch {}
        }, QR_INTERVAL.POLL);

        return () => clearInterval(interval);
    }, [qrCodeId]);

    return (
        <section className="w-full">
            <div className="bg-secondary flex flex-col gap-8 items-center justify-center px-3 py-6 rounded-xl h-full">
                <div className="flex flex-col gap-12 items-center w-full">
                    <header className="flex flex-col gap-3 items-center text-center w-full">
                        <h3 className="font-heading-4 text-primary">
                            {trans.haypoint.verify_qr_title}
                        </h3>
                    </header>
                    <figure className="flex justify-center w-full m-0">
                        {qrCodeId ? (
                            <QRCode
                                size={190}
                                style={{
                                    height: 'auto',
                                    maxWidth: '190',
                                    width: '190',
                                    border: '5px solid #fff',
                                }}
                                value={qrCodeId}
                                viewBox="0 0 256 256"
                                aria-label={trans.haypoint.verify_qr_code}
                            />
                        ) : null}
                    </figure>
                    <p className="flex items-center gap-1 font-body-3">
                        <span className="text-secondary">{trans.haypoint.support_hotline_qr}</span>
                        <a href="tel:024777789096" className="font-body-3-highlight text-highlight">
                            024 777 789 96
                        </a>
                    </p>
                </div>
            </div>
        </section>
    );
};
