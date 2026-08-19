'use client';

import { Dialog } from '@/components/common/ui/Dialog';
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
    const { isLoading } = useLoadingStore();

    if (!isOpen || !selectedRight) return null;

    const paymentAmount = calculatePaymentAmount(quantity, selectedRight.buyPrice);

    const handleClose = () => {
        if (isLoading) return;
        onClose();
    };

    return (
        <Dialog
            title={`${'Xác nhận đăng ký'} ${selectedRight.symbol}`}
            maxWidth="max-w-md"
            onClose={handleClose}
        >
            <dl className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <dt className="font-body-3 text-secondary">{'Số lượng đăng ký'}</dt>
                    <dd className="font-body-3-highlight text-primary">
                        {formatNumberVN(Number(quantity), { decimals: 0 })} {'CP'}
                    </dd>
                </div>
                <div className="flex items-center justify-between">
                    <dt className="font-body-3 text-secondary">{'Giá'}</dt>
                    <dd className="font-body-3-highlight text-primary">
                        {formatNumberVN(selectedRight.buyPrice)} {'đ'}
                    </dd>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-tertiary">
                    <dt className="font-body-2-highlight text-secondary">{'Số tiền thanh toán'}</dt>
                    <dd className="font-body-1-highlight text-green">
                        {formatNumberVN(paymentAmount, { trimTrailingZeros: true })} {'đ'}
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
                    {'Hủy'}
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-highlight text-quaternary font-body-3-highlight rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {'Xác nhận'}
                </button>
            </div>
        </Dialog>
    );
};
