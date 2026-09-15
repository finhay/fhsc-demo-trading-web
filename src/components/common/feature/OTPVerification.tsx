'use client';

import { useEffect, useState } from 'react';

import ReCAPTCHA from 'react-google-recaptcha';
import OTPInput from 'react-otp-input';

import { useLoadingStore } from '@/stores/common/useLoadingStore';

export type Props = {
    width?: string;
    identifier: string;
    isIndividual?: boolean;
    onClose?: () => void;
    onSendOtp: (captchaToken: string) => Promise<{ success: boolean; remainSecond?: number }>;
    onVerifyOtp: (otp: string) => Promise<void | boolean>;
};

export const OTPVerification = ({
    width = 'w-full',
    identifier,
    isIndividual = true,
    onSendOtp,
    onVerifyOtp,
}: Props) => {
    const { isLoading } = useLoadingStore();
    const [otp, setOtp] = useState<string>('');
    const [captchaToken, setCaptchaToken] = useState<string>('');
    const [remainSecond, setRemainSecond] = useState<number>(0);
    const [isResendOTP, setIsResendOTP] = useState<boolean>(false);

    const isValidOTP = otp.length === 6;

    useEffect(() => {
        if (remainSecond <= 0) return;

        const countdown = setInterval(() => {
            setRemainSecond((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(countdown);
    }, [remainSecond]);

    const handleCaptchaChange = async (token: string | null) => {
        const newToken = token || '';
        setCaptchaToken(newToken);
        if (newToken && identifier) {
            const result = await onSendOtp(newToken);
            if (result.success && result.remainSecond) {
                setRemainSecond(result.remainSecond);
                setIsResendOTP(false);
            }
        }
    };

    const handleVerify = async () => {
        await onVerifyOtp(otp);
    };

    const handleResendOTP = () => {
        if (remainSecond > 0) return;
        setIsResendOTP(true);
    };

    return (
        <section className={`flex flex-col gap-4 ${width}`}>
            {captchaToken && (
                <p className="body-4 text-secondary w-full">
                    {isIndividual
                        ? 'Mã OTP đã được gửi qua số điện thoại của bạn.'
                        : 'Mã OTP đã được gửi qua email của bạn.'}
                    <br />
                    {'Vui lòng kiểm tra và thực hiện xác thực.'}
                </p>
            )}
            <div className="flex w-full flex-col gap-4">
                {captchaToken ? (
                    <>
                        <div
                            className="flex w-full justify-center px-1"
                            role="group"
                            aria-label={'Nhập mã OTP'}
                        >
                            <OTPInput
                                value={otp}
                                onChange={setOtp}
                                numInputs={6}
                                containerStyle={{ gap: '16px', width: '100%' }}
                                renderInput={(props) => (
                                    <input
                                        {...props}
                                        className="base-quaternary flex-1 h-14 rounded-xl text-center body-2-highlight text-primary outline-none transition-all focus:ring-2 focus:ring-highlight [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        type="text"
                                        maxLength={1}
                                    />
                                )}
                            />
                        </div>
                        <div className="body-4 flex w-full flex-col gap-2">
                            <div className="flex items-start gap-1">
                                <span className="text-secondary">{'Không nhận được OTP?'}</span>
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={remainSecond > 0}
                                    className={`body-4-highlight transition-colors ${
                                        remainSecond > 0
                                            ? 'text-tertiary cursor-not-allowed'
                                            : 'text-highlight'
                                    }`}
                                >
                                    {'Gửi lại ('}
                                    {remainSecond}
                                    {'s)'}
                                </button>
                            </div>
                            <div className="flex items-start gap-1">
                                <span className="text-secondary">
                                    {'Tôi cần hỗ trợ. Liên hệ hotline:'}
                                </span>
                                <a
                                    href="tel:024777789096"
                                    className="body-4-highlight text-highlight hover:underline"
                                >
                                    024 777 789 96
                                </a>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleVerify}
                            disabled={!isValidOTP || isLoading}
                            className={`body-4-highlight w-full rounded-full px-4 py-2 transition-all ${
                                isValidOTP && !isLoading
                                    ? 'base-highlight text-quaternary hover:opacity-90'
                                    : 'bg-disabled text-disabled'
                            }`}
                        >
                            {'Xác thực'}
                        </button>
                        {isResendOTP && (
                            <div className="flex w-full justify-center">
                                <ReCAPTCHA
                                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                                    onChange={handleCaptchaChange}
                                    theme="dark"
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex w-full justify-center">
                        <ReCAPTCHA
                            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                            onChange={handleCaptchaChange}
                            theme="dark"
                        />
                    </div>
                )}
            </div>
        </section>
    );
};
