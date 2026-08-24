'use client';

import { type ReactNode, useMemo } from 'react';

import { Dialog } from '@/components/common/ui/Dialog';
import { toast } from '@/hooks/lib/useToast';
import { cancelPaperOrder } from '@/services/api/paper-trading/orders';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { usePaperAccountStore } from '@/stores/paper-trading/usePaperAccountStore';
import { useTradingStore } from '@/stores/trading/useTradingStore';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';
import { formatNumberVN } from '@/utils/format';

type Props = {
    orderId: string;
    symbol: string;
    side: string;
    rawPrice: number;
    rawQty: number;
    onClose: () => void;
    onSuccess: () => void;
};

export const TradeCancelOrderModal = ({
    orderId,
    symbol,
    side,
    rawPrice,
    rawQty,
    onClose,
    onSuccess,
}: Props) => {
    const { startLoading, stopLoading, isLoading } = useLoadingStore();
    const { accountId } = usePaperAccountStore();
    const { patchOrdersInBook, fetchOrders } = useTradingStore();

    const isBuy = side === 'Mua';
    const displayPrice = rawPrice / 1000;
    const title = `${isBuy ? 'Huỷ lệnh mua' : 'Huỷ lệnh bán'} ${symbol}`;

    const summaryRows = useMemo(
        () =>
            [
                {
                    label: 'Loại lệnh',
                    value: (
                        <dd
                            className={`font-body-3-highlight ${isBuy ? 'text-green' : 'text-red'}`}
                        >
                            {side}
                        </dd>
                    ),
                },
                {
                    label: 'Mã CK',
                    value: <dd className="font-body-3-highlight text-primary">{symbol}</dd>,
                },
                {
                    label: 'Giá đặt',
                    value: (
                        <dd className="font-body-3 text-primary">{formatNumberVN(displayPrice)}</dd>
                    ),
                },
                {
                    label: 'Số lượng',
                    value: (
                        <dd className="font-body-3 text-primary">
                            {formatNumberVN(rawQty, { decimals: 0 })} {'cp'}
                        </dd>
                    ),
                },
            ] as { label: string; value: ReactNode }[],
        [displayPrice, isBuy, rawQty, side, symbol],
    );

    const handleConfirm = async () => {
        startLoading();
        try {
            const { error_code, message, data } = await cancelPaperOrder(accountId, orderId);

            if (isSuccessApi(error_code)) {
                patchOrdersInBook([
                    {
                        orderId,
                        status: data?.order_status ?? 'CANCELLED',
                        isActive: false,
                        allowCancel: false,
                        allowAmend: false,
                    },
                ]);
                toast.success('Thành công');
                fetchOrders(accountId, { silent: true });
                onSuccess();
            } else {
                toast.error(message);
            }
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err, 'Có lỗi xảy ra, vui lòng thử lại'));
        } finally {
            stopLoading();
            onClose();
        }
    };

    return (
        <Dialog title={title} maxWidth="max-w-md" onClose={onClose}>
            <div className="flex flex-col gap-4">
                <dl className="bg-tertiary rounded-xl px-4 py-3 flex flex-col gap-3">
                    {summaryRows.map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between">
                            <dt className="font-body-3 text-secondary">{label}</dt>
                            {value}
                        </div>
                    ))}
                </dl>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2 rounded-xl font-body-3-highlight bg-tertiary text-primary hover:bg-quaternary transition-colors"
                    >
                        {'Đóng'}
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={`flex-1 py-2 rounded-xl font-body-3-highlight transition-colors ${
                            isLoading
                                ? 'bg-disabled text-disabled cursor-not-allowed'
                                : 'bg-red text-primary hover:opacity-90'
                        }`}
                    >
                        {'Xác nhận huỷ'}
                    </button>
                </div>
            </div>
        </Dialog>
    );
};
