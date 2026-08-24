'use client';

import { PAPER_ORDER_CHANNEL, PAPER_ORDER_SIDE, PAPER_ORDER_TYPE } from '@/constants/paper-trading';
import { toast } from '@/hooks/lib/useToast';
import { placePaperOrder } from '@/services/api/paper-trading/orders';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { usePaperAccountStore } from '@/stores/paper-trading/usePaperAccountStore';
import { useTradingStore } from '@/stores/trading/useTradingStore';
import type { PendingOrder } from '@/types/pages/trading';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';
import { formatNumberVN } from '@/utils/format';
import { mapPaperOrderToRow } from '@/utils/paper-trading/order-book';

type Props = {
    symbol: string;
    pendingOrder: PendingOrder;
    onClose: () => void;
    onSuccess: () => void;
};

export const TradePlaceOrderPanel = ({ symbol, pendingOrder, onClose, onSuccess }: Props) => {
    const { addPlacedOrdersToBook, fetchOrders } = useTradingStore();
    const { accountId, fetchAsset } = usePaperAccountStore();
    const { side, price, quantity } = pendingOrder;
    const { startLoading, stopLoading, isLoading } = useLoadingStore();

    const isBuy = side === 'BUY';
    const priceDisplay = formatNumberVN(price / 1000);
    const title = `${isBuy ? 'Xác nhận lệnh mua' : 'Xác nhận lệnh bán'} ${symbol}`;

    const summaryRows = [
        {
            label: 'Số lượng',
            value: `${formatNumberVN(quantity, { decimals: 0 })} cp`,
        },
        { label: 'Giá', value: priceDisplay },
        {
            label: isBuy ? 'Tổng tiền mua' : 'Tổng tiền bán',
            value: `${formatNumberVN(quantity * price, { trimTrailingZeros: true })}đ`,
        },
    ];

    const handleConfirm = async () => {
        startLoading();
        try {
            const { error_code, message, data } = await placePaperOrder(accountId, {
                cl_ord_id: '',
                side: isBuy ? PAPER_ORDER_SIDE.BUY : PAPER_ORDER_SIDE.SELL,
                symbol,
                quantity,
                type: PAPER_ORDER_TYPE.LO,
                limit_price: price,
                channel: PAPER_ORDER_CHANNEL,
            });

            if (isSuccessApi(error_code)) {
                if (data) addPlacedOrdersToBook([mapPaperOrderToRow(data)]);
                toast.success('Đặt lệnh thành công', {
                    description: `${isBuy ? 'Mua' : 'Bán'} ${formatNumberVN(quantity, {
                        decimals: 0,
                    })} cp với giá ${priceDisplay}`,
                });
                fetchOrders(accountId, { silent: true });
                fetchAsset();
                onSuccess();
            } else {
                toast.error(message || 'Có lỗi xảy ra, vui lòng thử lại');
            }
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err, 'Có lỗi xảy ra, vui lòng thử lại'));
        } finally {
            stopLoading();
            onClose();
        }
    };

    return (
        <section className="bg-secondary flex w-full flex-1 flex-col gap-4 rounded-xl min-h-0">
            <div className="flex min-h-0 w-full flex-1 flex-col gap-4 overflow-y-auto">
                <h3 className="font-body-2-highlight w-full shrink-0 text-primary">{title}</h3>
                <dl className="flex w-full shrink-0 flex-col gap-1">
                    {summaryRows.map((row) => (
                        <div
                            key={row.label}
                            className="flex w-full items-start justify-between gap-2"
                        >
                            <dt className="font-body-3 shrink-0 text-secondary">{row.label}</dt>
                            <dd className="font-body-3 text-primary">{row.value}</dd>
                        </div>
                    ))}
                </dl>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-3">
                <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className={`font-body-3-highlight flex w-full items-center justify-center rounded-full px-4 py-2 transition-opacity ${
                        isLoading
                            ? 'bg-disabled text-disabled cursor-not-allowed'
                            : isBuy
                              ? 'bg-highlight text-quaternary'
                              : 'bg-red text-primary'
                    }`}
                >
                    {'Xác nhận'}
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="font-body-3-highlight flex w-full items-center justify-center rounded-full bg-error px-4 py-2 text-red transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {'Huỷ'}
                </button>
            </div>
        </section>
    );
};
