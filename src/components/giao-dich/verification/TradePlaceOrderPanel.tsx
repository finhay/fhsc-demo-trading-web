'use client';

import { Fragment, useMemo } from 'react';

import { PAPER_ORDER_CHANNEL, PAPER_ORDER_SIDE, PAPER_ORDER_TYPE } from '@/constants/paper-trading';
import { ORDER_TYPE_KEY, TRADE_UI_CONFIG } from '@/constants/trading';
import { toast } from '@/hooks/lib/useToast';
import { placePaperOrder } from '@/services/api/paper-trading/orders';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { usePaperAccountStore } from '@/stores/paper-trading/usePaperAccountStore';
import { useTradingStore } from '@/stores/trading/useTradingStore';
import type { PendingOrder, PlacementOrder } from '@/types/pages/trading';
import type { PaperOrder } from '@/types/paper-trading/orders';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';
import { formatNumberVN } from '@/utils/format';
import { mapPaperOrderToRow } from '@/utils/paper-trading/order-book';
import { buildPlacementOrders } from '@/utils/trading/panel';

type Props = {
    symbol: string;
    pendingOrder: PendingOrder;
    onClose: () => void;
    onSuccess: () => void;
};

export const TradePlaceOrderPanel = ({ symbol, pendingOrder, onClose, onSuccess }: Props) => {
    const { addPlacedOrdersToBook, fetchOrders } = useTradingStore();
    const { accountId, fetchAsset } = usePaperAccountStore();
    const { side, price, orderType, orderLots } = pendingOrder;
    const { startLoading, stopLoading, isLoading } = useLoadingStore();

    const isBuy = side === 'BUY';
    const isMarket = orderType !== ORDER_TYPE_KEY.LO;
    const totalQty = orderLots.reduce((sum, lot) => sum + lot.evenLotQty + lot.oddLotQty, 0);
    const maxOrderQty = TRADE_UI_CONFIG.MAX_ORDER_QTY_PER_REQUEST;
    const isLargeOrder = totalQty >= maxOrderQty;

    const priceDisplay = isMarket ? orderType : formatNumberVN(price / 1000);

    const title = `${isBuy ? 'Xác nhận lệnh mua' : 'Xác nhận lệnh bán'} ${symbol}`;

    const placeSuccessDetail = `${
        isBuy ? 'Mua' : 'Bán'
    } ${formatNumberVN(totalQty, { decimals: 0 })} ${'cp'} ${'với giá'} ${priceDisplay}`;

    const placementOrders = useMemo(() => buildPlacementOrders(orderLots), [orderLots]);

    const getBlockTitle = (order: PlacementOrder) =>
        order.kind === 'even' ? 'Lệnh lô chẵn' : 'Lệnh lô lẻ';

    const handleConfirm = async () => {
        startLoading();

        let placedCount = 0;
        const acceptedItems: PaperOrder[] = [];

        try {
            for (const order of placementOrders) {
                const { error_code, message, data } = await placePaperOrder(accountId, {
                    cl_ord_id: '',
                    side: isBuy ? PAPER_ORDER_SIDE.BUY : PAPER_ORDER_SIDE.SELL,
                    symbol,
                    quantity: order.qty,
                    type: PAPER_ORDER_TYPE.LO,
                    limit_price: price,
                    channel: PAPER_ORDER_CHANNEL,
                });

                if (isSuccessApi(error_code)) {
                    if (data) acceptedItems.push(data);
                    placedCount += 1;
                } else {
                    toast.error(message || 'Có lỗi xảy ra, vui lòng thử lại');
                    break;
                }
            }

            if (placedCount === placementOrders.length) {
                addPlacedOrdersToBook(acceptedItems.map(mapPaperOrderToRow));
                toast.success('Đặt lệnh thành công', {
                    description: placeSuccessDetail,
                });
                fetchOrders(accountId, { silent: true });
                fetchAsset();
                onSuccess();
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
                {isLargeOrder && (
                    <p className="font-body-3 shrink-0 text-secondary">
                        {isBuy
                            ? 'Do khối lượng mua lớn, hệ thống tự động chia thành các lệnh như sau:'
                            : 'Do khối lượng bán lớn, hệ thống tự động chia thành các lệnh như sau:'}
                    </p>
                )}
                <div className="flex w-full shrink-0 flex-col gap-3">
                    {placementOrders.map((order, index) => (
                        <Fragment key={`${order.kind}-${order.qty}-${index}`}>
                            {index > 0 && <div className="border-t border-quaternary" />}
                            <dl className="flex flex-col gap-1">
                                <p className="font-body-3 text-primary">{getBlockTitle(order)}</p>
                                <div className="flex w-full items-start justify-between gap-2">
                                    <dt className="font-body-3 shrink-0 text-secondary">
                                        {'Số lượng'}
                                    </dt>
                                    <dd className="font-body-3 text-primary">
                                        {formatNumberVN(order.qty, { decimals: 0 })} {'cp'}
                                    </dd>
                                </div>
                                <div className="flex w-full items-start justify-between gap-2">
                                    <dt className="font-body-3 shrink-0 text-secondary">{'Giá'}</dt>
                                    <dd className="font-body-3 text-primary">{priceDisplay}</dd>
                                </div>
                                <div className="flex w-full items-start justify-between gap-2">
                                    <dl className="flex w-full items-start justify-between gap-2">
                                        <dt className="font-body-3 shrink-0 text-secondary">
                                            {isBuy ? 'Tổng tiền mua' : 'Tổng tiền bán'}
                                        </dt>
                                        <dd className="font-body-3 text-primary">
                                            {formatNumberVN(order.qty * price, {
                                                trimTrailingZeros: true,
                                            })}
                                            {'đ'}
                                        </dd>
                                    </dl>
                                </div>
                            </dl>
                        </Fragment>
                    ))}
                </div>
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
