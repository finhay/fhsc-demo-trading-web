'use client';

import { useEffect } from 'react';

import { AuthUI } from '@/components/auth/AuthUI';
import { ResetAccount } from '@/components/auth/reset-password/ResetAccount';
import { ResetPassword } from '@/components/auth/reset-password/ResetPassword';
import { OTPVerification } from '@/components/common/feature/OTPVerification';
import { STEPS_RESET_PASSWORD } from '@/constants/auth';
import { useAuthFlowStore } from '@/stores/auth/useAuthFlowStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';

export const ResetContent = () => {
    const { startLoading, stopLoading } = useLoadingStore();

    const { resetPassword, resetPasswordSendOtp, resetPasswordVerifyOtp, setInitResetState } =
        useAuthFlowStore();

    const { step, username, accountType } = resetPassword;

    const isIndividual = accountType === 'individual';

    useEffect(() => {
        return () => {
            setInitResetState();
        };
    }, [setInitResetState]);

    const wrappedSendOtp = async (token: string) => {
        startLoading();
        try {
            return await resetPasswordSendOtp(token);
        } finally {
            stopLoading();
        }
    };

    const wrappedVerifyOtp = async (otp: string) => {
        startLoading();
        try {
            return await resetPasswordVerifyOtp(otp);
        } finally {
            stopLoading();
        }
    };

    const renderStep = () => {
        switch (step) {
            case STEPS_RESET_PASSWORD.ACCOUNT_INFO:
                return <ResetAccount />;
            case STEPS_RESET_PASSWORD.VERIFY_OTP:
                return (
                    <OTPVerification
                        width="w-1/2"
                        identifier={username}
                        isIndividual={isIndividual}
                        onSendOtp={wrappedSendOtp}
                        onVerifyOtp={wrappedVerifyOtp}
                    />
                );
            case STEPS_RESET_PASSWORD.CREATE_NEW_PASSWORD:
                return <ResetPassword />;
            default:
                return null;
        }
    };

    return (
        <section className="flex w-full items-stretch justify-center gap-5">
            {renderStep()}
            <AuthUI />
        </section>
    );
};
