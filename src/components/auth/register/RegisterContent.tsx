'use client';

import { useEffect } from 'react';

import { AuthUI } from '@/components/auth/AuthUI';
import { RegisterAccount } from '@/components/auth/register/RegisterAccount';
import { RegisterPassword } from '@/components/auth/register/RegisterPassword';
import { RegisterSuccess } from '@/components/auth/register/RegisterSuccess';
import { OTPVerification } from '@/components/common/feature/OTPVerification';
import { STEPS_REGISTER } from '@/constants/auth';
import { useAuthFlowStore } from '@/stores/auth/useAuthFlowStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';

export const RegisterContent = () => {
    const { startLoading, stopLoading } = useLoadingStore();
    const {
        register,
        registerSendOtp: sendOtp,
        registerVerifyOtp: verifyOtp,
        setInitRegisterState,
    } = useAuthFlowStore();

    const { step, phone } = register;

    useEffect(() => {
        return () => {
            setInitRegisterState();
        };
    }, [setInitRegisterState]);

    const wrappedSendOtp = async (token: string) => {
        startLoading();
        try {
            return await sendOtp(token);
        } finally {
            stopLoading();
        }
    };

    const wrappedVerifyOtp = async (otp: string) => {
        startLoading();
        try {
            return await verifyOtp(otp);
        } finally {
            stopLoading();
        }
    };

    const renderStep = () => {
        switch (step) {
            case STEPS_REGISTER.CREATE_ACCOUNT:
                return <RegisterAccount />;
            case STEPS_REGISTER.VERIFY_OTP:
                return (
                    <OTPVerification
                        width="w-1/2"
                        identifier={phone}
                        isIndividual={true}
                        onSendOtp={wrappedSendOtp}
                        onVerifyOtp={wrappedVerifyOtp}
                    />
                );
            case STEPS_REGISTER.CREATE_PASSWORD:
                return <RegisterPassword />;
            case STEPS_REGISTER.SUCCESS:
                return <RegisterSuccess />;
            default:
                return null;
        }
    };

    return (
        <section className="flex w-full items-stretch justify-center gap-4">
            {renderStep()}
            {step !== STEPS_REGISTER.SUCCESS && <AuthUI />}
        </section>
    );
};
