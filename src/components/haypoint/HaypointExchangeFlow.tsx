'use client';

import { Dialog } from '@/components/common/ui/Dialog';
import { HaypointConfirmModal } from '@/components/haypoint/modal/HaypointConfirmModal';
import { HaypointQRModal } from '@/components/haypoint/modal/HaypointQRModal';
import { HaypointSelectedModal } from '@/components/haypoint/modal/HaypointSelectedModal';
import { HaypointSuccessModal } from '@/components/haypoint/modal/HaypointSuccessModal';
import { VOUCHER_EXCHANGE_STEPS } from '@/constants/haypoint';
import { useTranslate } from '@/hooks/useTranslate';
import { useExchangeFlowStore } from '@/stores/haypoint/useExchangeFlowStore';
import { useMyVouchersStore } from '@/stores/haypoint/useMyVouchersStore';
import { usePointStore } from '@/stores/haypoint/usePointStore';

export const HaypointExchangeFlow = () => {
    const trans = useTranslate();
    const { isOpen, step, resetStore, setStep } = useExchangeFlowStore();
    const { fetchPointBalance } = usePointStore();
    const { fetchOwnedRewards } = useMyVouchersStore();

    if (!isOpen) return null;

    const handleSuccessClose = () => {
        resetStore();
        fetchPointBalance();
        fetchOwnedRewards();
    };

    const config = (() => {
        switch (step) {
            case VOUCHER_EXCHANGE_STEPS.SELECTION:
                return {
                    title: trans.haypoint.redeem_voucher,
                    maxHeight: 'h-[70vh]',
                    onBack: undefined,
                    onClose: resetStore,
                    content: <HaypointSelectedModal />,
                };
            case VOUCHER_EXCHANGE_STEPS.CONFIRM:
                return {
                    title: trans.haypoint.redeem_voucher,
                    maxHeight: 'h-[70vh]',
                    onBack: () => setStep(VOUCHER_EXCHANGE_STEPS.SELECTION),
                    onClose: resetStore,
                    content: <HaypointConfirmModal />,
                };
            case VOUCHER_EXCHANGE_STEPS.QR_CODE:
                return {
                    title: trans.haypoint.redeem_voucher,
                    maxHeight: 'h-auto',
                    onBack: () => setStep(VOUCHER_EXCHANGE_STEPS.CONFIRM),
                    onClose: resetStore,
                    content: <HaypointQRModal />,
                };
            case VOUCHER_EXCHANGE_STEPS.SUCCESS:
                return {
                    title: trans.haypoint.redeem_ok,
                    maxHeight: 'h-[70vh]',
                    onBack: undefined,
                    onClose: handleSuccessClose,
                    content: <HaypointSuccessModal />,
                };
            default:
                return null;
        }
    })();

    if (!config) return null;

    return (
        <Dialog
            title={config.title}
            maxWidth="max-w-5xl"
            maxHeight={config.maxHeight}
            onClose={config.onClose}
            onBack={config.onBack}
        >
            {config.content}
        </Dialog>
    );
};
