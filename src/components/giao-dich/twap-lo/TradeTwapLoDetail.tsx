'use client';

import { type TransitionEvent, useEffect, useState } from 'react';

import { createPortal } from 'react-dom';
import { FaXmark } from 'react-icons/fa6';
import { RiErrorWarningFill } from 'react-icons/ri';

import { TradeTwapLoSliceList } from '@/components/giao-dich/twap-lo/TradeTwapLoSliceList';
import { ACCOUNT_TYPE, ERROR_CODES } from '@/constants/common';
import { ORDER_SIDE, TWO_FA_PLACEMENT } from '@/constants/trading';
import { useHotkeys } from '@/hooks/lib/useHotkeys';
import { toast } from '@/hooks/lib/useToast';
import { cancelTwapLoOrder } from '@/services/api/trade/twap-lo';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { useTradingStore } from '@/stores/trading/useTradingStore';
import type { TwapLoDetailView, TwapLoOrderDto } from '@/types/trade/twap-lo';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';
import { formatBoardPrice, formatDateTime, formatNumberVN } from '@/utils/format';
import { canCancelTwapLoOrder, getTwapLoMatchedAvgPrice } from '@/utils/trading/panel';

type Props = {
    order: TwapLoOrderDto;
    initialView?: TwapLoDetailView;
    onClose: () => void;
    onSuccess: () => void;
    onExpired2FA?: () => void;
};

export const TradeTwapLoDetail = ({
    order,
    initialView,
    onClose,
    onSuccess,
    onExpired2FA,
}: Props) => {
    const { activeSubAccount, profile } = useAuthStore();
    const { startLoading, stopLoading, isLoading } = useLoadingStore();
    const { request2FA, handle2FATokenExpired, patchOrdersInBook } = useTradingStore();

    const [view, setView] = useState<TwapLoDetailView>(initialView ?? 'detail');
    const [isMounted, setIsMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const subAccountId = activeSubAccount?.sub_account_id ?? '';
    const validationType = profile?.user_type === ACCOUNT_TYPE.ENTERPRISE ? 'OTP' : 'SMART_OTP';

    const orderId = String(order.id ?? '');
    const isBuy = order.side === ORDER_SIDE.BUY;
    const matchedAvgPrice = getTwapLoMatchedAvgPrice(order);
    const totalMoney = (order.price ?? 0) * (order.orderQty ?? 0);
    const cancelQty = Math.max(0, (order.orderQty ?? 0) - (order.matchedQty ?? 0));
    const canCancel = canCancelTwapLoOrder(order.status ?? '');
    const slices = order.slices ?? [];

    const detailTitle = (
        isBuy ? 'Chi tiết Lệnh CD LO mua {symbol}' : 'Chi tiết Lệnh CD LO bán {symbol}'
    ).replace('{symbol}', order.symbol);
    const cancelTitle = (
        isBuy ? 'Xác nhận hủy lệnh CD LO mua {symbol}' : 'Xác nhận hủy lệnh CD LO bán {symbol}'
    ).replace('{symbol}', order.symbol);
    const title = view === 'detail' ? detailTitle : cancelTitle;

    const handleTransitionEnd = (event: TransitionEvent<HTMLElement>) => {
        if (event.target !== event.currentTarget) return;
        if (event.propertyName !== 'transform') return;
        if (!isOpen) onClose();
    };

    const handleCancel = async () => {
        if (!subAccountId || !orderId) return;

        startLoading();
        let is2FAExpired = false;

        try {
            const { error_code, message } = await cancelTwapLoOrder(subAccountId, orderId, {
                validation_type: validationType,
            });

            if (isSuccessApi(error_code)) {
                patchOrdersInBook([
                    {
                        orderId,
                        status: 'CANCELLED',
                        allowCancel: false,
                        allowAmend: false,
                    },
                ]);
                toast.success('Huỷ lệnh thành công');
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
                toast.error(getApiErrorMessage(err, 'Có lỗi xảy ra, vui lòng thử lại'));
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

    if (!isMounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-50" role="presentation">
            <button
                type="button"
                aria-label={'Đóng'}
                className="absolute inset-0"
                onClick={() => setIsOpen(false)}
            />
            <aside
                role="dialog"
                aria-modal="true"
                aria-labelledby="twap-lo-detail-title"
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
                        aria-label={'Đóng'}
                    >
                        <FaXmark size={16} />
                    </button>
                    <h2
                        id="twap-lo-detail-title"
                        className="min-w-0 flex-1 font-body-1-highlight text-primary"
                    >
                        {title}
                    </h2>
                </header>

                {view === 'detail' ? (
                    <>
                        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden px-6">
                            <dl className="flex shrink-0 flex-col gap-4 rounded-xl bg-quaternary p-3">
                                <div className="flex items-center gap-6">
                                    <dt className="min-w-0 flex-1 font-body-3 text-secondary">
                                        {'KL khớp / Tổng KL đặt'}
                                    </dt>
                                    <dd className="shrink-0 whitespace-nowrap font-body-3 text-primary">
                                        {formatNumberVN(order.matchedQty ?? 0, { decimals: 0 })} /{' '}
                                        {formatNumberVN(order.orderQty ?? 0, { decimals: 0 })}{' '}
                                        {'cp'}
                                    </dd>
                                </div>
                                <div className="flex items-center gap-6">
                                    <dt className="min-w-0 flex-1 font-body-3 text-secondary">
                                        {'Giá khớp / Giá đặt'}
                                    </dt>
                                    <dd className="shrink-0 whitespace-nowrap font-body-3 text-primary">
                                        {matchedAvgPrice > 0
                                            ? formatBoardPrice(matchedAvgPrice)
                                            : '--'}{' '}
                                        / {formatBoardPrice(order.price ?? 0)}
                                    </dd>
                                </div>
                                <div className="flex items-center gap-6">
                                    <dt className="min-w-0 flex-1 font-body-3 text-secondary">
                                        {isBuy ? 'Tổng tiền mua' : 'Tổng tiền bán'}
                                    </dt>
                                    <dd className="shrink-0 whitespace-nowrap font-body-3 text-primary">
                                        {formatNumberVN(totalMoney, { trimTrailingZeros: true })}
                                        {'đ'}
                                    </dd>
                                </div>
                            </dl>

                            <dl className="flex shrink-0 flex-col gap-4 rounded-xl bg-quaternary p-3">
                                <div className="flex items-center gap-6">
                                    <dt className="min-w-0 flex-1 font-body-3 text-secondary">
                                        {'Mã giao dịch'}
                                    </dt>
                                    <dd className="shrink-0 whitespace-nowrap font-body-3 text-primary">
                                        {orderId || '--'}
                                    </dd>
                                </div>
                                <div className="flex items-center gap-6">
                                    <dt className="min-w-0 flex-1 font-body-3 text-secondary">
                                        {'Thời gian đặt'}
                                    </dt>
                                    <dd className="shrink-0 whitespace-nowrap font-body-3 text-primary">
                                        {order.createdAt ? formatDateTime(order.createdAt) : '--'}
                                    </dd>
                                </div>
                            </dl>

                            <section className="flex min-h-0 flex-1 flex-col">
                                <h3 className="shrink-0 font-body-2-highlight text-primary">
                                    {'Danh sách lệnh con ({count} lệnh)'.replace(
                                        '{count}',
                                        String(slices.length || order.n || 0),
                                    )}
                                </h3>
                                <div className="min-h-0 flex-1 overflow-y-auto">
                                    <TradeTwapLoSliceList
                                        slices={slices}
                                        limitPrice={order.price ?? 0}
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
                                    {'Hủy lệnh'}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                            <div className="flex items-start gap-3 px-6 py-3 text-orange">
                                <RiErrorWarningFill size={20} className="shrink-0" aria-hidden />
                                <p className="font-body-3">
                                    {
                                        'Việc hủy lệnh CD LO sẽ hủy các lệnh chưa khớp, khớp một phần đã được lên sàn và toàn bộ các lệnh chờ trong danh sách.'
                                    }
                                </p>
                            </div>
                            <div className="px-6 py-3">
                                <dl className="flex flex-col gap-4 rounded-xl bg-quaternary p-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <dt className="font-body-3 text-secondary">{'KL hủy'}</dt>
                                        <dd className="shrink-0 whitespace-nowrap font-body-3 text-primary">
                                            {formatNumberVN(cancelQty, { decimals: 0 })}
                                            {'cp'}
                                        </dd>
                                    </div>
                                    <div className="flex items-start justify-between gap-4">
                                        <dt className="font-body-3 text-secondary">
                                            {'Tổng KL đặt'}
                                        </dt>
                                        <dd className="shrink-0 whitespace-nowrap font-body-3 text-primary">
                                            {formatNumberVN(order.orderQty ?? 0, { decimals: 0 })}
                                            {'cp'}
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
                                {'Xác nhận hủy lệnh'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setView('detail')}
                                disabled={isLoading}
                                className="flex h-10 w-full items-center justify-center rounded-full bg-primary px-4 py-2 font-body-3-highlight text-highlight transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {'Quay lại'}
                            </button>
                        </div>
                    </>
                )}
            </aside>
        </div>,
        document.body,
    );
};
