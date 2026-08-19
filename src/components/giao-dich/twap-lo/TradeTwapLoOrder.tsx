'use client';

import { useEffect, useState } from 'react';

import { FaChevronDown, FaChevronUp } from 'react-icons/fa6';

import { ACCOUNT_TYPE, ERROR_CODES } from '@/constants/common';
import { ORDER_SIDE, TWO_FA_PLACEMENT } from '@/constants/trading';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { createTwapLoOrder, previewTwapLoOrder } from '@/services/api/trade/twap-lo';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { useTradingStore } from '@/stores/trading/useTradingStore';
import type { PendingTwapLoOrder, TwapLoOrderDto, TwapLoSliceDto } from '@/types/trade/twap-lo';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';
import { formatBoardPrice, formatDateTime, formatNumberVN } from '@/utils/format';
import { buildTwapLoRequest } from '@/utils/trading/panel';

type Props = {
    symbol: string;
    order: PendingTwapLoOrder;
    initialPreview?: TwapLoOrderDto | null;
    onPreviewLoaded?: (preview: TwapLoOrderDto) => void;
    onClose: () => void;
    onSuccess: () => void;
};

export const TradeTwapLoOrder = ({
    symbol,
    order,
    initialPreview,
    onPreviewLoaded,
    onClose,
    onSuccess,
}: Props) => {
    const trans = useTranslate();
    const { activeSubAccount, profile } = useAuthStore();
    const { startLoading, stopLoading, isLoading } = useLoadingStore();
    const { request2FA, handle2FATokenExpired } = useTradingStore();

    const [preview, setPreview] = useState<TwapLoOrderDto | null>(initialPreview ?? null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(!initialPreview);
    const [isSlicesOpen, setIsSlicesOpen] = useState(false);

    const { side, price, quantity, startAt } = order;
    const isBuy = side === ORDER_SIDE.BUY;
    const subAccountId = activeSubAccount?.sub_account_id ?? '';
    const validationType = profile?.user_type === ACCOUNT_TYPE.ENTERPRISE ? 'OTP' : 'SMART_OTP';

    const displayQty = preview?.orderQty ?? quantity;
    const displayPrice = preview?.price ?? price;
    const slices = preview?.slices ?? [];
    const sliceCount = preview?.n ?? slices.length;
    const totalMoney = displayPrice > 0 ? displayPrice * displayQty : 0;

    const title = (
        isBuy ? trans.trading.twap_lo_order.title_buy : trans.trading.twap_lo_order.title_sell
    ).replace('{symbol}', symbol);

    const startAtLabel = startAt
        ? formatDateTime(preview?.startAt || startAt)
        : trans.trading.panel.twap_start_at_immediate;

    const isConfirmDisabled = isLoading || isPreviewLoading || !preview;

    const renderSlice = (slice: TwapLoSliceDto, index: number) => {
        const qty = slice.plannedQty ?? slice.orderQty ?? 0;
        const scheduledLabel = slice.scheduledAt ? formatDateTime(slice.scheduledAt) : '--';

        return (
            <div key={slice.id ?? `${slice.seq}-${index}`} className="flex flex-col">
                {index > 0 && <div className="my-4 h-px w-full bg-quaternary" />}
                <dl className="flex flex-col gap-3">
                    <dt className="font-body-3-highlight text-secondary">
                        {trans.trading.twap_lo_order.child_title.replace(
                            '{index}',
                            String(slice.seq ?? index + 1),
                        )}
                    </dt>
                    <div className="flex items-center justify-between gap-2">
                        <dt className="font-body-3 text-secondary">
                            {trans.trading.twap_lo_order.child_qty}
                        </dt>
                        <dd className="shrink-0 whitespace-nowrap font-body-3-highlight text-primary">
                            {formatNumberVN(qty, { decimals: 0 })}{' '}
                            {trans.trading.twap_lo_order.unit}
                        </dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <dt className="font-body-3 text-secondary">
                            {trans.trading.twap_lo_order.child_scheduled_at}
                        </dt>
                        <dd className="shrink-0 whitespace-nowrap font-body-3-highlight text-primary">
                            {scheduledLabel}
                        </dd>
                    </div>
                </dl>
            </div>
        );
    };

    const loadPreview = async () => {
        if (!subAccountId) {
            setIsPreviewLoading(false);
            toast.error(trans.common.try_again_error);
            return;
        }

        setIsPreviewLoading(true);
        try {
            const { error_code, message, data } = await previewTwapLoOrder(
                subAccountId,
                buildTwapLoRequest(symbol, order),
            );

            if (isSuccessApi(error_code) && data) {
                setPreview(data);
                onPreviewLoaded?.(data);
            } else {
                toast.error(message || trans.common.try_again_error);
            }
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err, trans.common.try_again_error));
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const handleConfirm = async () => {
        startLoading();
        let is2FAExpired = false;
        try {
            const { error_code, message } = await createTwapLoOrder(subAccountId, {
                ...buildTwapLoRequest(symbol, order),
                validation_type: validationType,
            });

            if (isSuccessApi(error_code)) {
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

    useEffect(() => {
        if (initialPreview) return;
        loadPreview();
    }, [subAccountId]);

    return (
        <section className="flex min-h-0 w-full flex-1 flex-col gap-2 rounded-xl bg-secondary">
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
                <div className="flex shrink-0 flex-col gap-3">
                    <h3 className="font-body-2-highlight w-full text-primary">{title}</h3>
                    <p className="font-body-3 text-primary">
                        {trans.trading.order_book.tab_twap_lo}
                    </p>
                </div>

                <dl className="flex shrink-0 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                        <dt className="font-body-3 text-secondary">
                            {trans.trading.twap_lo_order.qty}
                        </dt>
                        <dd className="shrink-0 whitespace-nowrap font-body-3 text-primary">
                            {formatNumberVN(displayQty, { decimals: 0 })}
                            {trans.trading.twap_lo_order.unit}
                        </dd>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                        <dt className="font-body-3 text-secondary">
                            {trans.trading.twap_lo_order.price}
                        </dt>
                        <dd className="shrink-0 whitespace-nowrap font-body-3 text-primary">
                            {formatBoardPrice(displayPrice)}
                        </dd>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                        <dt className="font-body-3 text-secondary">
                            {isBuy
                                ? trans.trading.twap_lo_order.money_buy
                                : trans.trading.twap_lo_order.money_sell}
                        </dt>
                        <dd className="shrink-0 whitespace-nowrap font-body-3 text-primary">
                            {formatNumberVN(totalMoney, { trimTrailingZeros: true })}
                            {trans.trading.currency.suffix}
                        </dd>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                        <dt className="font-body-3 text-secondary">
                            {trans.trading.twap_lo_order.start_at}
                        </dt>
                        <dd className="shrink-0 whitespace-nowrap font-body-3 text-primary">
                            {startAtLabel}
                        </dd>
                    </div>
                </dl>

                <div className="flex shrink-0 flex-col gap-4">
                    <button
                        type="button"
                        onClick={() => setIsSlicesOpen((prev) => !prev)}
                        disabled={isPreviewLoading || sliceCount === 0}
                        className="flex w-full shrink-0 items-start justify-between gap-2 cursor-pointer"
                        aria-expanded={isSlicesOpen}
                    >
                        <span className="font-body-3 text-secondary">
                            {trans.trading.twap_lo_order.child_list.replace(
                                '{count}',
                                String(sliceCount),
                            )}
                        </span>
                        {isSlicesOpen ? (
                            <FaChevronUp size={16} className="shrink-0 text-primary" />
                        ) : (
                            <FaChevronDown size={16} className="shrink-0 text-primary" />
                        )}
                    </button>

                    {isSlicesOpen && <div>{slices.map(renderSlice)}</div>}
                </div>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-3">
                <button
                    type="button"
                    disabled={isConfirmDisabled}
                    onClick={() => request2FA(handleConfirm, TWO_FA_PLACEMENT.PANEL)}
                    className={`flex w-full items-center justify-center rounded-full px-4 py-2 font-body-3-highlight transition-opacity ${
                        isConfirmDisabled
                            ? 'cursor-not-allowed bg-disabled text-disabled'
                            : isBuy
                              ? 'bg-highlight text-quaternary hover:opacity-90 active:opacity-80'
                              : 'bg-red text-primary hover:opacity-90 active:opacity-80'
                    }`}
                >
                    {trans.trading.place_modal.btn_confirm}
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
