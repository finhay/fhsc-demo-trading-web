'use client';

import { Dialog } from '@/components/common/ui/Dialog';
import { IpoConfirmOrder } from '@/components/ipo/modal/IpoConfirmOrder';
import { IpoQRVerification } from '@/components/ipo/modal/IpoQRVerification';
import { IpoSubscriptionForm } from '@/components/ipo/modal/IpoSubscriptionForm';
import { SUBSCRIPTION_FLOW_STEPS } from '@/constants/ipo';
import { useSubscriptionStore } from '@/stores/ipo/useSubscriptionStore';

export const IpoSubscriptionFlow = () => {
    const { isOpen, step, resetStore } = useSubscriptionStore();

    if (!isOpen) return null;

    const maxWidth = step === SUBSCRIPTION_FLOW_STEPS.OTP ? 'max-w-2xl' : 'max-w-5xl';

    const renderStep = () => {
        switch (step) {
            case SUBSCRIPTION_FLOW_STEPS.FORM:
                return <IpoSubscriptionForm />;
            case SUBSCRIPTION_FLOW_STEPS.CONFIRM:
                return <IpoConfirmOrder />;
            case SUBSCRIPTION_FLOW_STEPS.OTP:
                return <IpoQRVerification />;
            default:
                return null;
        }
    };

    return (
        <Dialog maxWidth={maxWidth} onClose={resetStore}>
            {renderStep()}
        </Dialog>
    );
};
