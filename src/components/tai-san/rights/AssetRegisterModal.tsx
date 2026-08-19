'use client';

import { Dialog } from '@/components/common/ui/Dialog';
import { useTranslate } from '@/hooks/useTranslate';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import type { UserRightItem } from '@/types/trade/user-rights';
import { calculatePaymentAmount } from '@/utils/assets';
import { formatNumberVN } from '@/utils/format';

type Props = {
    isOpen: boolean;
    selectedRight: UserRightItem | undefined;
    quantity: string;
    onClose: () => void;
    onConfirm: () => void;
};

export const AssetRegisterModal = ({
    isOpen,
    selectedRight,
    quantity,
    onClose,
    onConfirm,
}: Props) => {
    const trans = useTranslate();
    const { isLoading } = useLoadingStore();

    if (!isOpen || !selectedRight) return null;

    const paymentAmount = calculatePaymentAmount(quantity, selectedRight.buyPrice);

    const handleClose = () => {
        if (isLoading) return;
        onClose();
    };

    return (
        <Dialog
            title={`${trans.assets.rights.confirm_register} ${selectedRight.symbol}`}
            maxWidth="max-w-md"
            onClose={handleClose}
        >
            <dl className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <dt className="font-body-3 text-secondary">
                        {trans.assets.rights.register_quantity}
                    </dt>
                    <dd className="font-body-3-highlight text-primary">
                        {formatNumberVN(Number(quantity), { decimals: 0 })}{' '}
                        {trans.assets.modals.common.unit_shares}
                    </dd>
                </div>
                <div className="flex items-center justify-between">
                    <dt className="font-body-3 text-secondary">{trans.assets.rights.price}</dt>
                    <dd className="font-body-3-highlight text-primary">
                        {formatNumberVN(selectedRight.buyPrice)}{' '}
                        {trans.assets.modals.common.currency}
                    </dd>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-tertiary">
                    <dt className="font-body-2-highlight text-secondary">
                        {trans.assets.rights.payment_amount}
                    </dt>
                    <dd className="font-body-1-highlight text-green">
                        {formatNumberVN(paymentAmount, { trimTrailingZeros: true })}{' '}
                        {trans.assets.modals.common.currency}
                    </dd>
                </div>
            </dl>
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-quaternary text-primary font-body-3-highlight rounded-xl hover:bg-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {trans.assets.rights.cancel}
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-highlight text-quaternary font-body-3-highlight rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {trans.assets.rights.confirm}
                </button>
            </div>
        </Dialog>
    );
};
