'use client';

import { Fragment, useMemo } from 'react';

import { ACCOUNT_TYPE, ERROR_CODES } from '@/constants/common';
import {
    ORDER_MODE_KEY,
    ORDER_TYPE_KEY,
    TRADE_UI_CONFIG,
    TWO_FA_PLACEMENT,
} from '@/constants/trading';
import { toast } from '@/hooks/lib/useToast';
import { placeSubAccountOrder } from '@/services/api/trade/orders';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { useTradingStore } from '@/stores/trading/useTradingStore';
import type { PendingOrder, PlacementOrder } from '@/types/pages/trading';
import type { OrderItem } from '@/types/trade/orders';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';
import { formatNumberVN } from '@/utils/format';
import { mapPlacedOrderItemToRow } from '@/utils/trading/order-book';
import { buildPlacementOrders } from '@/utils/trading/panel';
import { mapOrderErrorCodeToStatus } from '@/utils/trading/shared';

type Props = {
    symbol: string;
    pendingOrder: PendingOrder;
    onClose: () => void;
    onSuccess: () => void;
};

export const TradePlaceOrderPanel = ({ symbol, pendingOrder, onClose, onSuccess }: Props) => {
    const { handle2FATokenExpired, request2FA, addPlacedOrdersToBook } = useTradingStore();
    const { side, price, orderType, orderLots, orderMode, stockType, executionDate, expiredDate } =
        pendingOrder;
    const { startLoading, stopLoading, isLoading } = useLoadingStore();

    const { activeSubAccount, profile } = useAuthStore();
    const validationType = profile?.user_type === ACCOUNT_TYPE.ENTERPRISE ? 'OTP' : 'SMART_OTP';

    const subAccountId = activeSubAccount?.sub_account_id ?? '';
    const subAccountExt = activeSubAccount?.sub_account_ext ?? '';
    const custId = profile?.cust_id ?? '';

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

    const handleConfirmClick = () => {
        request2FA(handleConfirm, TWO_FA_PLACEMENT.PANEL);
    };

    const handleConfirm = async () => {
        startLoading();

        const is247 = orderMode === ORDER_MODE_KEY.TAB_247;
        const basePayload: Record<string, unknown> = {
            sub_account: subAccountExt,
            cust_id: custId,
            side,
            symbol,
            type: isMarket ? ORDER_TYPE_KEY.MARKET : ORDER_TYPE_KEY.LIMIT,
            limit_price: !isMarket ? price : null,
            market_price: isMarket ? orderType : null,
            validation_type: validationType,
            stock_type: stockType,
        };

        if (is247) {
            basePayload.order_condition_type = ORDER_TYPE_KEY.ORDER_247;
            basePayload.execution_date = executionDate;
            basePayload.expired_date = expiredDate;
        }

        let is2FAExpired = false;
        let placedCount = 0;
        const acceptedItems: OrderItem[] = [];

        try {
            for (const order of placementOrders) {
                const payload = { ...basePayload, quantity: order.qty };
                const { error_code, message, data } = await placeSubAccountOrder(
                    subAccountId,
                    payload,
                );

                if (isSuccessApi(error_code)) {
                    let chunkAccepted = true;
                    if (data && data.length > 0) {
                        data.forEach((raw) => {
                            if (raw.code === '0') {
                                acceptedItems.push(raw);
                                return;
                            }
                            chunkAccepted = false;
                            toast.error(
                                mapOrderErrorCodeToStatus(raw.code, raw.rejected_reason ?? '') ||
                                    'Có lỗi xảy ra, vui lòng thử lại',
                            );
                        });
                    }
                    if (chunkAccepted) {
                        placedCount += 1;
                    } else {
                        break;
                    }
                } else if (error_code === ERROR_CODES.FAILED_2FA_TOKEN_EXPIRED) {
                    is2FAExpired = true;
                    break;
                } else {
                    toast.error(message || 'Có lỗi xảy ra, vui lòng thử lại');
                    break;
                }
            }

            if (!is2FAExpired && placedCount === placementOrders.length) {
                addPlacedOrdersToBook(
                    acceptedItems.map(mapPlacedOrderItemToRow),
                    is247 ? ORDER_MODE_KEY.TAB_247 : ORDER_MODE_KEY.NORMAL,
                );
                toast.success('Đặt lệnh thành công', {
                    description: placeSuccessDetail,
                });
                onSuccess();
            }
        } catch (err: unknown) {
            if (
                (err as { error_code?: string })?.error_code ===
                ERROR_CODES.FAILED_2FA_TOKEN_EXPIRED
            ) {
                is2FAExpired = true;
            } else {
                toast.error(getApiErrorMessage(err, 'Có lỗi xảy ra, vui lòng thử lại'));
            }
        } finally {
            stopLoading();
            if (is2FAExpired) {
                handle2FATokenExpired(handleConfirm);
            } else {
                onClose();
            }
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
                    onClick={handleConfirmClick}
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
