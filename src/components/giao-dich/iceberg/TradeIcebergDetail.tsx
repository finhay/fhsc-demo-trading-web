'use client';

import { type TransitionEvent, useEffect, useMemo, useState } from 'react';

import { createPortal } from 'react-dom';
import { FaXmark } from 'react-icons/fa6';
import { RiErrorWarningFill, RiInformationFill } from 'react-icons/ri';

import { Spinner } from '@/components/common/ui/Spinner';
import { TradeIcebergSliceList } from '@/components/giao-dich/iceberg/TradeIcebergSliceList';
import { ACCOUNT_TYPE, ERROR_CODES } from '@/constants/common';
import { ORDER_SIDE, TWO_FA_PLACEMENT } from '@/constants/trading';
import { useHotkeys } from '@/hooks/lib/useHotkeys';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { cancelIcebergOrder, fetchIcebergOrderDetail } from '@/services/api/trade/iceberg-orders';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { useTradingStore } from '@/stores/trading/useTradingStore';
import type { IcebergOrderDto } from '@/types/trade/iceberg-orders';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';
import { formatBoardPrice, formatNumberVN } from '@/utils/format';
import { canCancelIcebergOrder } from '@/utils/trading/panel';

type View = 'detail' | 'cancel_confirm';

type Props = {
    orderId: string;
    initialView?: View;
    onClose: () => void;
    onSuccess: () => void;
    onExpired2FA?: () => void;
};

export const TradeIcebergDetail = ({
    orderId,
    initialView,
    onClose,
    onSuccess,
    onExpired2FA,
}: Props) => {
    const trans = useTranslate();
    const detailTrans = trans.trading.iceberg_detail;
    const { activeSubAccount, profile } = useAuthStore();
    const { startLoading, stopLoading, isLoading } = useLoadingStore();
    const { request2FA, handle2FATokenExpired, patchOrdersInBook } = useTradingStore();

    const [order, setOrder] = useState<IcebergOrderDto | null>(null);
    const [view, setView] = useState<View>(initialView ?? 'detail');
    const [isMounted, setIsMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const subAccountId = activeSubAccount?.sub_account_id ?? '';
    const subAccountExt = activeSubAccount?.sub_account_ext ?? '';
    const validationType = profile?.user_type === ACCOUNT_TYPE.ENTERPRISE ? 'OTP' : 'SMART_OTP';

    const isBuy = order?.order_side === ORDER_SIDE.BUY;
    const totalMoney = order ? order.limit_price * order.total_quantity : 0;
    const cancelQty = order ? Math.max(0, order.total_quantity - order.matched_quantity) : 0;
    const canCancel = order ? canCancelIcebergOrder(order.order_status) : false;

    const detailTitle = order
        ? (isBuy ? detailTrans.title_buy : detailTrans.title_sell).replace('{symbol}', order.symbol)
        : '';
    const cancelTitle = order
        ? (isBuy ? detailTrans.cancel_title_buy : detailTrans.cancel_title_sell).replace(
              '{symbol}',
              order.symbol,
          )
        : '';
    const title = view === 'detail' ? detailTitle : cancelTitle;

    const placedSliceCount = useMemo(() => {
        if (!order?.slices?.length) return 0;
        return order.slices.filter((slice) => slice.order_status !== 'PENDING').length;
    }, [order?.slices]);

    const handleTransitionEnd = (event: TransitionEvent<HTMLElement>) => {
        if (event.target !== event.currentTarget) return;
        if (event.propertyName !== 'transform') return;
        if (!isOpen) onClose();
    };

    const handleCancel = async () => {
        if (!subAccountId || !order) return;

        startLoading();
        let is2FAExpired = false;

        try {
            const { error_code, message } = await cancelIcebergOrder(subAccountId, order.order_id, {
                sub_account: subAccountExt,
                validation_type: validationType,
            });

            if (isSuccessApi(error_code)) {
                patchOrdersInBook([
                    {
                        orderId: String(order.order_id),
                        status: 'CANCELLED',
                        allowCancel: false,
                        allowAmend: false,
                    },
                ]);
                toast.success(trans.trading.toast.cancel_success);
                onSuccess();
            } else if (error_code === ERROR_CODES.FAILED_2FA_TOKEN_EXPIRED) {
                is2FAExpired = true;
            } else {
                toast.error(message);
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
            onClose();
            if (is2FAExpired) {
                handle2FATokenExpired(onExpired2FA, TWO_FA_PLACEMENT.GLOBAL);
            }
        }
    };

    const handleConfirmCancelClick = () => {
        request2FA(handleCancel, TWO_FA_PLACEMENT.GLOBAL);
        onClose();
    };

    useHotkeys('Escape', () => {
        setIsOpen(false);
    });

    useEffect(() => {
        setIsMounted(true);
        let openFrame = 0;
        const frame = requestAnimationFrame(() => {
            openFrame = requestAnimationFrame(() => setIsOpen(true));
        });
        return () => {
            cancelAnimationFrame(frame);
            cancelAnimationFrame(openFrame);
            setIsMounted(false);
        };
    }, []);

    useEffect(() => {
        if (!subAccountId) return;

        const loadOrder = async () => {
            try {
                const { error_code, data, message } = await fetchIcebergOrderDetail(
                    subAccountId,
                    orderId,
                );
                if (isSuccessApi(error_code) && data) {
                    setOrder(data);
                } else {
                    toast.error(message || trans.common.try_again_error);
                    setIsOpen(false);
                }
            } catch (err) {
                toast.error(getApiErrorMessage(err, trans.common.try_again_error));
                setIsOpen(false);
            }
        };

        loadOrder();
    }, [orderId, subAccountId]);

    if (!isMounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-50" role="presentation">
            <button
                type="button"
                aria-label={trans.dialog.close}
                className="absolute inset-0"
                onClick={() => setIsOpen(false)}
            />
            <aside
                role="dialog"
                aria-modal="true"
                aria-labelledby="iceberg-detail-title"
                onTransitionEnd={handleTransitionEnd}
                className={`absolute right-0 top-0 flex h-full w-[650px] flex-col overflow-hidden rounded-l-xl bg-tertiary shadow-xl transition-transform duration-300 ease-out ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <header className="flex shrink-0 items-center gap-4 p-6">
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="shrink-0 text-primary transition-colors hover:text-highlight"
                        aria-label={trans.dialog.close}
                    >
                        <FaXmark size={16} />
                    </button>
                    <h2
                        id="iceberg-detail-title"
                        className="min-w-0 flex-1 font-body-1-highlight text-primary"
                    >
                        {title}
                    </h2>
                </header>

                {!order ? (
                    <div className="flex flex-1 items-center justify-center">
                        <Spinner isLoading isOverlay={false} />
                    </div>
                ) : view === 'detail' ? (
                    <>
                        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden px-6">
                            <dl className="flex shrink-0 flex-col gap-4 rounded-xl bg-quaternary p-3">
                                <div className="flex items-center gap-6">
                                    <dt className="min-w-0 flex-1 font-body-3 text-secondary">
                                        {detailTrans.qty_matched_total}
                                    </dt>
                                    <dd className="shrink-0 whitespace-nowrap font-body-3 text-primary">
                                        {formatNumberVN(order.matched_quantity, { decimals: 0 })} /{' '}
                                        {formatNumberVN(order.total_quantity, { decimals: 0 })}{' '}
                                        {detailTrans.unit}
                                    </dd>
                                </div>
                                <div className="flex items-center gap-6">
                                    <dt className="min-w-0 flex-1 font-body-3 text-secondary">
                                        {detailTrans.qty_per_slice}
                                    </dt>
                                    <dd className="shrink-0 whitespace-nowrap font-body-3 text-primary">
                                        {formatNumberVN(order.display_size, { decimals: 0 })}{' '}
                                        {detailTrans.unit}
                                    </dd>
                                </div>
                                <div className="flex items-center gap-6">
                                    <dt className="min-w-0 flex-1 font-body-3 text-secondary">
                                        {detailTrans.price_matched_placed}
                                    </dt>
                                    <dd className="shrink-0 whitespace-nowrap font-body-3 text-primary">
                                        {order.matched_price > 0
                                            ? formatBoardPrice(order.matched_price)
                                            : '--'}{' '}
                                        / {formatBoardPrice(order.limit_price)}
                                    </dd>
                                </div>
                                <div className="flex items-center gap-6">
                                    <dt className="min-w-0 flex-1 font-body-3 text-secondary">
                                        {isBuy ? detailTrans.money_buy : detailTrans.money_sell}
                                    </dt>
                                    <dd className="shrink-0 whitespace-nowrap font-body-3 text-primary">
                                        {formatNumberVN(totalMoney, { trimTrailingZeros: true })}
                                        {trans.trading.currency.suffix}
                                    </dd>
                                </div>
                            </dl>

                            <section className="flex min-h-0 flex-1 flex-col">
                                <h3 className="shrink-0 font-body-2-highlight text-primary">
                                    {detailTrans.child_heading.replace(
                                        '{count}',
                                        String(order.slices.length),
                                    )}
                                </h3>
                                <div className="flex shrink-0 items-center gap-3 py-3 text-blue">
                                    <RiInformationFill size={20} className="shrink-0" aria-hidden />
                                    <p className="font-body-3">
                                        {detailTrans.placed_info
                                            .replace('{placed}', String(placedSliceCount))
                                            .replace('{total}', String(order.slices.length))}
                                    </p>
                                </div>
                                <div className="min-h-0 flex-1 overflow-y-auto">
                                    <TradeIcebergSliceList
                                        slices={order.slices}
                                        limitPrice={order.limit_price}
                                        matchedPrice={order.matched_price}
                                    />
                                </div>
                            </section>
                        </div>

                        {canCancel && (
                            <div className="shrink-0 bg-tertiary p-6">
                                <button
                                    type="button"
                                    onClick={() => setView('cancel_confirm')}
                                    className="flex h-10 w-full items-center justify-center rounded-full bg-red px-4 py-2 font-body-3-highlight text-quaternary transition-opacity hover:opacity-90"
                                >
                                    {detailTrans.btn_cancel}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                            <div className="flex items-start gap-3 px-6 py-3 text-orange">
                                <RiErrorWarningFill size={20} className="shrink-0" aria-hidden />
                                <p className="font-body-3">{detailTrans.cancel_warn}</p>
                            </div>
                            <div className="px-6 py-3">
                                <dl className="flex flex-col gap-4 rounded-xl bg-quaternary p-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <dt className="font-body-3 text-secondary">
                                            {detailTrans.cancel_qty}
                                        </dt>
                                        <dd className="shrink-0 whitespace-nowrap font-body-3 text-primary">
                                            {formatNumberVN(cancelQty, { decimals: 0 })}
                                            {detailTrans.unit}
                                        </dd>
                                    </div>
                                    <div className="flex items-start justify-between gap-4">
                                        <dt className="font-body-3 text-secondary">
                                            {detailTrans.cancel_qty_total}
                                        </dt>
                                        <dd className="shrink-0 whitespace-nowrap font-body-3 text-primary">
                                            {formatNumberVN(order.total_quantity, { decimals: 0 })}
                                            {detailTrans.unit}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        <div className="flex shrink-0 flex-col gap-3 bg-tertiary p-6">
                            <button
                                type="button"
                                disabled={isLoading}
                                onClick={handleConfirmCancelClick}
                                className={`flex h-10 w-full items-center justify-center rounded-full px-4 py-2 font-body-3-highlight transition-opacity ${
                                    isLoading
                                        ? 'cursor-not-allowed bg-disabled text-disabled'
                                        : 'bg-red text-quaternary hover:opacity-90'
                                }`}
                            >
                                {detailTrans.btn_confirm}
                            </button>
                            <button
                                type="button"
                                onClick={() => setView('detail')}
                                disabled={isLoading}
                                className="flex h-10 w-full items-center justify-center rounded-full bg-primary px-4 py-2 font-body-3-highlight text-highlight transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {detailTrans.btn_back}
                            </button>
                        </div>
                    </>
                )}
            </aside>
        </div>,
        document.body,
    );
};
