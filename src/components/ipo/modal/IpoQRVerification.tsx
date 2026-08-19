'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { FaArrowLeft, FaXmark } from 'react-icons/fa6';
import QRCode from 'react-qr-code';

import { QR_INTERVAL } from '@/constants/common';
import { SUBSCRIPTION_FLOW_STEPS } from '@/constants/ipo';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import {
    fetchIpoAuthoritySessionState,
    requestIpoRegistrationBuyOtp,
} from '@/services/api/ipo-hunt';
import { useIpoStore } from '@/stores/ipo/useIpoStore';
import { useSubscriptionStore } from '@/stores/ipo/useSubscriptionStore';
import { isSuccessApi } from '@/utils/common';

export const IpoQRVerification = () => {
    const trans = useTranslate();
    const { step, selectedItem, orderId, registrationInfo, setStep, resetStore } =
        useSubscriptionStore();
    const { refetchLists } = useIpoStore();

    const [qrToken, setQrToken] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(0);
    const [retryRemainTimes, setRetryRemainTimes] = useState(0);
    const [isRequestingOtp, setIsRequestingOtp] = useState(false);
    const initialRetryRemainTimesRef = useRef(0);
    const hasRequestedInitialOtpRef = useRef(false);

    const qrValue = useMemo(() => {
        if (!qrToken) return '';
        return JSON.stringify({
            type: 'ipo_transaction_auth',
            signature: qrToken,
        });
    }, [qrToken]);

    const handleRequestOtpToken = async () => {
        if (!orderId) return false;

        setIsRequestingOtp(true);
        try {
            const primaryMethod = registrationInfo.authorities_method[0]?.method;
            if (!primaryMethod) {
                toast.error(trans.ipo.modal.qr.no_auth_method);
                setIsRequestingOtp(false);
                return false;
            }

            const { error_code, message, data } = await requestIpoRegistrationBuyOtp({
                method: primaryMethod,
                orderId,
            });

            if (isSuccessApi(error_code)) {
                setQrToken(data.token);
                setCountdown(data.retry_remain_seconds);
                setRetryRemainTimes(data.retry_remain_times);

                if (initialRetryRemainTimesRef.current === 0) {
                    initialRetryRemainTimesRef.current = data.retry_remain_times;
                }

                setIsRequestingOtp(false);
                return true;
            } else {
                toast.error(message);
                setIsRequestingOtp(false);
                return false;
            }
        } catch {
            setIsRequestingOtp(false);
            return false;
        }
    };

    useEffect(() => {
        if (step === SUBSCRIPTION_FLOW_STEPS.OTP && orderId && !hasRequestedInitialOtpRef.current) {
            hasRequestedInitialOtpRef.current = true;
            handleRequestOtpToken();
        }

        if (step !== SUBSCRIPTION_FLOW_STEPS.OTP) {
            hasRequestedInitialOtpRef.current = false;
            initialRetryRemainTimesRef.current = 0;
        }
    }, [step, orderId]);

    useEffect(() => {
        if (step !== SUBSCRIPTION_FLOW_STEPS.OTP || countdown <= 0) return;

        const timer = setInterval(() => {
            setCountdown((prev) => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [step, countdown]);

    useEffect(() => {
        if (step !== SUBSCRIPTION_FLOW_STEPS.OTP || countdown !== 0 || !qrToken) return;

        const handleCountdownEnd = async () => {
            if (retryRemainTimes === 0) {
                toast.error(
                    `${trans.ipo.modal.qr.retry_error_start}${initialRetryRemainTimesRef.current}${trans.ipo.modal.qr.retry_error_end}`,
                );
                resetStore();
                return;
            }

            await new Promise((resolve) => setTimeout(resolve, 2000));
            await handleRequestOtpToken();
        };

        handleCountdownEnd();
    }, [countdown, retryRemainTimes, step, qrToken]);

    useEffect(() => {
        if (!orderId || step !== SUBSCRIPTION_FLOW_STEPS.OTP || !qrToken || isRequestingOtp) return;

        let isVerified = false;

        const pollingInterval = setInterval(async () => {
            if (isVerified) return;

            try {
                const { error_code, data, message } = await fetchIpoAuthoritySessionState(orderId);
                if (isSuccessApi(error_code) && data.status === 'VERIFIED') {
                    isVerified = true;
                    clearInterval(pollingInterval);
                    resetStore();
                    refetchLists();
                    toast.success(trans.ipo.modal.qr.success);
                }
            } catch {}
        }, QR_INTERVAL.POLL);

        return () => clearInterval(pollingInterval);
    }, [orderId, step, qrToken, isRequestingOtp, resetStore, refetchLists]);

    if (!selectedItem) return null;

    return (
        <>
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setStep(SUBSCRIPTION_FLOW_STEPS.CONFIRM)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center"
                        aria-label={trans.ipo.modal.qr.back}
                    >
                        <FaArrowLeft size={24} className="text-primary" />
                    </button>
                    <h1
                        id="subscription-verification-title"
                        className="font-body-1-highlight text-primary"
                    >
                        {trans.ipo.modal.qr.title}
                    </h1>
                </div>
                <button
                    type="button"
                    onClick={resetStore}
                    className="flex h-9 w-9 shrink-0 items-center justify-center"
                    aria-label={trans.ipo.common.close}
                >
                    <FaXmark size={24} className="text-primary" />
                </button>
            </header>
            <section className="flex w-full flex-col items-center gap-8">
                <figure className="flex justify-center w-full">
                    {qrValue ? (
                        <QRCode
                            size={190}
                            style={{
                                height: 'auto',
                                maxWidth: '190',
                                width: '190',
                                border: '5px solid #fff',
                            }}
                            value={qrValue}
                            viewBox="0 0 256 256"
                            aria-label={trans.ipo.modal.qr.qr_label}
                        />
                    ) : null}
                </figure>
                <div className="flex flex-col items-center gap-2">
                    <p className="font-body-2 text-secondary">
                        {trans.ipo.modal.qr.expires_in}
                        <span
                            className={`font-body-2-highlight ${countdown === 0 ? 'text-disabled' : 'text-highlight'}`}
                        >
                            {countdown}
                            {trans.ipo.modal.qr.seconds}
                        </span>
                    </p>
                    <p className="flex items-center gap-1 font-body-3">
                        <span className="text-secondary">{trans.ipo.modal.qr.support}</span>
                        <a href="tel:024777789096" className="font-body-3-highlight text-highlight">
                            024 777 789 96
                        </a>
                    </p>
                </div>
            </section>
        </>
    );
};
