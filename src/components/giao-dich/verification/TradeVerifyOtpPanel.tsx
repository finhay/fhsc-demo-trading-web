'use client';

import { useEffect, useRef, useState } from 'react';

import OtpInput from 'react-otp-input';

import { Spinner } from '@/components/common/ui/Spinner';
import { OTP_CONFIG } from '@/constants/trading';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { postSendOtpV2, postVerifyOtpV2 } from '@/services/api/auth/otp';
import { setAccessToken2FA } from '@/services/localStorage';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useTradingStore } from '@/stores/trading/useTradingStore';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';

type Props = {
    onClose: () => void;
    onSuccess: () => void;
};

export const TradeVerifyOtpPanel = ({ onClose, onSuccess }: Props) => {
    const trans = useTranslate();
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [invalidOtp, setInvalidOtp] = useState(false);
    const [countDown, setCountDown] = useState<number>(OTP_CONFIG.INITIAL_COUNTDOWN);

    const { profile } = useAuthStore();
    const email = profile?.email ?? '';
    const { setToken2fa } = useTradingStore();

    const hasSentRef = useRef(false);

    const sendOtpEmail = async () => {
        setIsLoading(true);
        try {
            const { error_code, message, data } = await postSendOtpV2(OTP_CONFIG.TYPE, '', email);
            if (isSuccessApi(error_code)) {
                setCountDown(data.remain_second);
            } else {
                toast.error(message);
            }
        } catch (err) {
            toast.error(getApiErrorMessage(err, trans.common.try_again_error));
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async () => {
        if (otp.length !== OTP_CONFIG.LENGTH) return;
        setIsLoading(true);
        setInvalidOtp(false);
        try {
            const { error_code, result, message } = await postVerifyOtpV2(
                OTP_CONFIG.TYPE,
                otp,
                '',
                email,
            );

            if (isSuccessApi(error_code)) {
                setAccessToken2FA(result.token);
                setToken2fa(result.token);
                toast.success(trans.trading.otp_modal.toast_success);
                onSuccess();
            } else {
                setInvalidOtp(true);
                toast.error(message);
            }
        } catch {
            setInvalidOtp(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!hasSentRef.current && email) {
            hasSentRef.current = true;
            sendOtpEmail();
        }
    }, [email]);

    useEffect(() => {
        if (countDown <= 0) return;
        const timer = setInterval(() => setCountDown((c) => c - 1), 1000);
        return () => clearInterval(timer);
    }, [countDown]);

    return (
        <section className="flex w-full flex-col justify-between gap-4 rounded-xl p-2">
            {isLoading ? (
                <Spinner isLoading isOverlay={false} />
            ) : (
                <>
                    <div className="flex w-full flex-col items-center gap-4">
                        <h3 className="font-body-1-highlight shrink-0 text-primary">
                            {trans.trading.qr_panel.title}
                        </h3>
                        <p className="font-body-3 w-full text-center text-secondary">
                            {trans.trading.otp_modal.description_1}
                            <br />
                            {trans.trading.otp_modal.description_2}
                        </p>

                        <div className="flex w-full flex-col gap-3">
                            <div
                                className="flex w-full justify-center gap-1"
                                role="group"
                                aria-label={trans.trading.otp_modal.otp_group_aria}
                            >
                                <OtpInput
                                    value={otp}
                                    onChange={setOtp}
                                    numInputs={OTP_CONFIG.LENGTH}
                                    containerStyle={{ gap: '4px', width: '100%' }}
                                    inputType="tel"
                                    renderInput={(props) => (
                                        <input
                                            {...props}
                                            className="bg-quaternary flex h-12 min-w-0 flex-1 rounded p-2 text-center font-body-1-highlight text-primary outline-none transition-all focus:ring-2 focus:ring-highlight [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                        />
                                    )}
                                />
                            </div>

                            {invalidOtp && (
                                <p className="font-caption text-center text-red">
                                    {trans.trading.otp_modal.invalid_otp}
                                </p>
                            )}
                            <div className="flex w-full items-center justify-center gap-1">
                                <span className="font-body-3 text-secondary">
                                    {trans.trading.otp_modal.no_otp}
                                </span>
                                <button
                                    type="button"
                                    onClick={sendOtpEmail}
                                    disabled={countDown > 0 || isLoading}
                                    className={`font-body-3-highlight transition-colors ${
                                        countDown > 0 || isLoading
                                            ? 'text-tertiary cursor-not-allowed'
                                            : 'text-highlight'
                                    }`}
                                >
                                    {trans.trading.otp_modal.resend.replace(
                                        '{countdown}',
                                        String(countDown),
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="flex w-full flex-col gap-2">
                            <button
                                type="button"
                                onClick={handleVerify}
                                disabled={otp.length !== OTP_CONFIG.LENGTH || isLoading}
                                className={`font-body-3-highlight flex w-full items-center justify-center rounded-full px-4 py-2 transition-opacity ${
                                    otp.length === OTP_CONFIG.LENGTH && !isLoading
                                        ? 'bg-highlight text-quaternary'
                                        : 'bg-disabled text-disabled cursor-not-allowed'
                                }`}
                            >
                                {trans.trading.otp_modal.btn_verify}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="font-body-3-highlight flex w-full items-center justify-center rounded-full bg-error px-4 py-2 text-red transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {trans.trading.place_modal.btn_cancel}
                            </button>
                        </div>
                    </div>
                    <div className="flex w-full flex-col items-center gap-1 text-center">
                        <span className="font-body-3 text-secondary">
                            {trans.trading.otp_modal.support}
                        </span>
                        <a
                            href="tel:024777789096"
                            className="font-body-3-highlight text-secondary hover:text-highlight hover:underline"
                        >
                            024 777 789 96
                        </a>
                    </div>
                </>
            )}
        </section>
    );
};
