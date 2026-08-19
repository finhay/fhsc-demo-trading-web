'use client';

import { useMemo } from 'react';

import { RiInformationFill } from 'react-icons/ri';

import { ACCOUNT_TYPE, ERROR_CODES } from '@/constants/common';
import { ORDER_MODE_KEY, ORDER_SIDE, TWO_FA_PLACEMENT } from '@/constants/trading';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { createIcebergOrder } from '@/services/api/trade/iceberg-orders';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { useTradingStore } from '@/stores/trading/useTradingStore';
import type { OrderSide } from '@/types/trade/iceberg-orders';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';
import { formatBoardPrice, formatNumberVN } from '@/utils/format';
import { mapIcebergOrderToOrder } from '@/utils/trading/panel';

export type PendingIcebergOrder = {
    side: OrderSide;
    price: number;
    totalQuantity: number;
    displaySize: number;
};

type Props = {
    symbol: string;
    order: PendingIcebergOrder;
    onClose: () => void;
    onSuccess: () => void;
};

export const TradeIcebergOrder = ({ symbol, order, onClose, onSuccess }: Props) => {
    const trans = useTranslate();
    const { activeSubAccount, profile } = useAuthStore();
    const { startLoading, stopLoading, isLoading } = useLoadingStore();
    const { request2FA, handle2FATokenExpired, addPlacedOrdersToBook } = useTradingStore();

    const { side, price, totalQuantity, displaySize } = order;
    const isBuy = side === ORDER_SIDE.BUY;

    const subAccountId = activeSubAccount?.sub_account_id ?? '';
    const subAccountExt = activeSubAccount?.sub_account_ext ?? '';
    const validationType = profile?.user_type === ACCOUNT_TYPE.ENTERPRISE ? 'OTP' : 'SMART_OTP';

    const title = (
        isBuy ? trans.trading.iceberg_order.title_buy : trans.trading.iceberg_order.title_sell
    ).replace('{symbol}', symbol);

    const totalMoney = price > 0 ? price * totalQuantity : 0;

    const { sliceCount, hasRemainderSlice, lastSliceQuantity } = useMemo(() => {
        if (displaySize <= 0 || totalQuantity <= 0) {
            return { sliceCount: 0, hasRemainderSlice: false, lastSliceQuantity: 0 };
        }
        const count = Math.ceil(totalQuantity / displaySize);
        const remainder = totalQuantity % displaySize;
        const hasRemaining = totalQuantity > displaySize && remainder > 0;

        return {
            sliceCount: count,
            hasRemainderSlice: hasRemaining,
            lastSliceQuantity: hasRemaining ? remainder : displaySize,
        };
    }, [displaySize, totalQuantity]);

    const handleConfirmClick = () => {
        request2FA(handleConfirm, TWO_FA_PLACEMENT.PANEL);
    };

    const handleConfirm = async () => {
        startLoading();
        let is2FAExpired = false;
        try {
            const { error_code, message, data } = await createIcebergOrder(subAccountId, {
                sub_account: subAccountExt,
                side,
                symbol,
                total_quantity: totalQuantity,
                display_size: displaySize,
                limit_price: price,
                validation_type: validationType,
            });

            if (isSuccessApi(error_code)) {
                if (data) {
                    addPlacedOrdersToBook([mapIcebergOrderToOrder(data)], ORDER_MODE_KEY.ICEBERG);
                }
                toast.success(trans.trading.toast.place_success);
                onSuccess();
            } else if (error_code === ERROR_CODES.FAILED_2FA_TOKEN_EXPIRED) {
                is2FAExpired = true;
            } else {
                toast.error(message || trans.common.try_again_error);
            }
        } catch (err: unknown) {
            const errCode =
                (err as { error_code?: string })?.error_code ??
                (err as { response?: { data?: { error_code?: string } } })?.response?.data
                    ?.error_code;
            if (errCode === ERROR_CODES.FAILED_2FA_TOKEN_EXPIRED) {
                is2FAExpired = true;
            } else {
                toast.error(getApiErrorMessage(err, trans.common.try_again_error));
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
        <section className="bg-secondary flex min-h-0 w-full flex-1 flex-col gap-4 rounded-xl">
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
                <h3 className="font-body-2-highlight w-full shrink-0 text-primary">{title}</h3>
                <div className="flex shrink-0 flex-col gap-2">
                    <span className="font-body-3-highlight text-primary">
                        {trans.trading.order_book.tab_iceberg}
                    </span>
                    <dl className="shrink-0 flex flex-col gap-2 rounded-xl">
                        <div className="flex items-center gap-4">
                            <dt className="min-w-0 flex-1 font-body-3 text-secondary">
                                {isBuy
                                    ? trans.trading.iceberg_order.qty_buy
                                    : trans.trading.iceberg_order.qty_sell}
                            </dt>
                            <dd className="shrink-0 whitespace-nowrap font-body-3-highlight text-primary">
                                {formatNumberVN(totalQuantity, { decimals: 0 })}{' '}
                                {trans.trading.iceberg_order.unit}
                            </dd>
                        </div>
                        <div className="flex items-center gap-4">
                            <dt className="min-w-0 flex-1 font-body-3 text-secondary">
                                {trans.trading.panel.qty_placeholder_child}
                            </dt>
                            <dd className="shrink-0 whitespace-nowrap font-body-3-highlight text-primary">
                                {displaySize}
                            </dd>
                        </div>
                        <div className="flex items-center gap-4">
                            <dt className="min-w-0 flex-1 font-body-3 text-secondary">
                                {trans.trading.iceberg_order.price}
                            </dt>
                            <dd className="shrink-0 whitespace-nowrap font-body-3-highlight text-primary">
                                {formatBoardPrice(price)}
                            </dd>
                        </div>
                        <div className="flex items-center gap-4">
                            <dt className="min-w-0 flex-1 font-body-3 text-secondary">
                                {isBuy
                                    ? trans.trading.iceberg_order.money_buy
                                    : trans.trading.iceberg_order.money_sell}
                            </dt>
                            <dd className="shrink-0 whitespace-nowrap font-body-3-highlight text-primary">
                                {formatNumberVN(totalMoney, { trimTrailingZeros: true })}
                                {trans.trading.currency.suffix}
                            </dd>
                        </div>
                    </dl>
                    {hasRemainderSlice && (
                        <div className="flex items-start gap-3 text-blue">
                            <RiInformationFill size={20} className="shrink-0" aria-hidden />
                            <p className="font-body-3">
                                {trans.trading.iceberg_order.remainder_notice
                                    .replace('{index}', String(sliceCount))
                                    .replace(
                                        '{quantity}',
                                        formatNumberVN(lastSliceQuantity, { decimals: 0 }),
                                    )
                                    .replace('{unit}', trans.trading.iceberg_order.unit)}
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-3">
                <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleConfirmClick}
                    className={`flex w-full items-center justify-center rounded-full px-4 py-2 font-body-3-highlight transition-opacity ${
                        isLoading
                            ? 'cursor-not-allowed bg-disabled text-disabled'
                            : isBuy
                              ? 'bg-highlight text-quaternary hover:opacity-90 active:opacity-80'
                              : 'bg-red text-primary hover:opacity-90 active:opacity-80'
                    }`}
                >
                    {isBuy
                        ? trans.trading.panel.btn_confirm_buy
                        : trans.trading.panel.btn_confirm_sell}
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="font-body-3-highlight flex w-full items-center justify-center rounded-full bg-error px-4 py-2 text-red transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {trans.trading.place_modal.btn_cancel}
                </button>
            </div>
        </section>
    );
};
