'use client';

import { useForm, useStore } from '@tanstack/react-form';
import { type ReactDebouncerOptions, useDebouncer } from '@tanstack/react-pacer';

import { useEffect, useState } from 'react';

import { Dialog } from '@/components/common/ui/Dialog';
import { Trade247DateRange } from '@/components/giao-dich/shared/Trade247DateRange';
import { ACCOUNT_TYPE, ERROR_CODES } from '@/constants/common';
import { ORDER_TYPE, TRADE_UI_CONFIG, TWO_FA_PLACEMENT } from '@/constants/trading';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { fetchStockRealtime } from '@/services/api/datafeed/stock-info';
import { updateSubAccountOrder247, updateSubAccountStockOrder } from '@/services/api/trade/orders';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useLoadingStore } from '@/stores/common/useLoadingStore';
import { useTradingStore } from '@/stores/trading/useTradingStore';
import type { TradeOrderAmendStockInfo } from '@/types/pages/trading';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';
import {
    addMonths,
    formatApiDate,
    formatBoardPrice,
    formatNumberVN,
    formatNumberVNInput,
} from '@/utils/format';
import { getStepSize, makePriceValidator, parsePrice, parseQuantity } from '@/utils/trading/panel';
import { mapOrderErrorCodeToStatus } from '@/utils/trading/shared';

type Props = {
    orderId: string;
    symbol: string;
    side: string;
    rawPrice: number;
    rawQty: number;
    orderConditionType?: string | null;
    executionDate?: string;
    expiredDate?: string;
    onClose: () => void;
    onSuccess: () => void;
    onExpired2FA?: () => void;
};

export const TradeUpdateOrderModal = ({
    orderId,
    symbol,
    side,
    rawPrice,
    rawQty,
    orderConditionType,
    executionDate,
    expiredDate,
    onClose,
    onSuccess,
    onExpired2FA,
}: Props) => {
    const trans = useTranslate();
    const { startLoading, stopLoading, isLoading } = useLoadingStore();
    const [stockInfo, setStockInfo] = useState<TradeOrderAmendStockInfo | null>(null);

    const { handle2FATokenExpired, request2FA, patchOrdersInBook } = useTradingStore();
    const { activeSubAccount, profile } = useAuthStore();
    const validationType = profile?.user_type === ACCOUNT_TYPE.ENTERPRISE ? 'OTP' : 'SMART_OTP';

    const subAccountId = activeSubAccount?.sub_account_id ?? '';
    const subAccountExt = activeSubAccount?.sub_account_ext ?? '';
    const custId = profile?.cust_id ?? '';

    const is247 = !!orderConditionType;

    const toApiDate = (v?: string) => (v ? formatApiDate(v) : '');
    const initialDisplayPrice = formatBoardPrice(rawPrice);
    const initialExecutionDate = toApiDate(executionDate) || formatApiDate();
    const initialExpiredDate =
        toApiDate(expiredDate) ||
        formatApiDate(addMonths(TRADE_UI_CONFIG.DEFAULT_247_MONTH_OFFSET));

    const form = useForm({
        defaultValues: {
            qty: formatNumberVN(rawQty, { decimals: 0 }),
            price: initialDisplayPrice,
            executionDate: initialExecutionDate,
            expiredDate: initialExpiredDate,
        },
        onSubmit: ({ value }) => {
            request2FA(
                () => handleConfirm(value.qty, value.price, value.executionDate, value.expiredDate),
                TWO_FA_PLACEMENT.GLOBAL,
            );
            onClose();
        },
    });

    const currentPrice = useStore(form.store, (s) => s.values.price);
    const currentQty = useStore(form.store, (s) => s.values.qty);
    const currentExecutionDate = useStore(form.store, (s) => s.values.executionDate);
    const currentExpiredDate = useStore(form.store, (s) => s.values.expiredDate);
    const validateFieldsDebouncer = useDebouncer(
        () => {
            form.validateField('qty', 'change');
            form.validateField('price', 'change');
        },
        { wait: 120 } as unknown as ReactDebouncerOptions<() => void>,
    );

    const isBuy = side === ORDER_TYPE.BUY;
    const title = `${isBuy ? trans.trading.update_modal.title_buy : trans.trading.update_modal.title_sell} ${symbol}`;

    const getPriceChanged = () => {
        return parsePrice(currentPrice) !== parsePrice(initialDisplayPrice);
    };

    const getQtyChanged = () => {
        return parseQuantity(currentQty) !== rawQty;
    };

    const priceChanged = getPriceChanged();
    const qtyChanged = getQtyChanged();
    const datesChanged =
        is247 &&
        (currentExecutionDate !== initialExecutionDate ||
            currentExpiredDate !== initialExpiredDate);

    const hasValueChanged = () => {
        return priceChanged || qtyChanged || datesChanged;
    };

    const isPriceDirty = (priceStr: string) =>
        parsePrice(priceStr) !== parsePrice(initialDisplayPrice);
    const isQtyDirty = (qtyStr: string) => parseQuantity(qtyStr) !== rawQty;

    const validateKrxSingleField = (priceStr: string, qtyStr: string): string | undefined => {
        if (is247) return undefined;
        if (isPriceDirty(priceStr) && isQtyDirty(qtyStr)) return trans.trading.update_modal.warning;
        return undefined;
    };

    const canSubmit =
        useStore(form.store, (s) => s.canSubmit && !s.isSubmitting) &&
        hasValueChanged() &&
        (is247 || !(priceChanged && qtyChanged)) &&
        !isLoading;

    const validateQty = (value: string): string | undefined => {
        const krx = validateKrxSingleField(form.getFieldValue('price'), value);
        if (krx) return krx;
        if (!value.trim()) return undefined;
        const num = parseQuantity(value);
        if (num <= 0) return trans.trading.update_modal.err_qty_zero;
        if (num >= 100 && num % 100 !== 0) return trans.trading.update_modal.err_qty_lot;

        const isOrigOdd = rawQty < 100;
        const isNewOdd = num < 100;
        if (isOrigOdd !== isNewOdd) {
            return isOrigOdd
                ? trans.trading.update_modal.err_qty_odd_to_even
                : trans.trading.update_modal.err_qty_even_to_odd;
        }

        return undefined;
    };

    const validatePrice = (value: string): string | undefined => {
        const krx = validateKrxSingleField(value, form.getFieldValue('qty'));
        if (krx) return krx;

        if (is247) {
            return makePriceValidator(
                0,
                0,
                true,
                stockInfo?.exchange ?? '',
                stockInfo?.stockType ?? '',
                symbol,
            )({ value });
        }

        if (!value.trim()) return undefined;
        const price = parsePrice(value);
        if (price <= 0) return trans.trading.update_modal.err_price_invalid;

        if (!isPriceDirty(value)) return undefined;

        if (stockInfo && stockInfo.floor > 0 && stockInfo.ceiling > 0) {
            if (price < stockInfo.floor || price > stockInfo.ceiling) {
                return trans.trading.update_modal.err_price_range
                    .replace('${floor}', formatBoardPrice(stockInfo.floor))
                    .replace('${ceiling}', formatBoardPrice(stockInfo.ceiling));
            }
        }

        if (stockInfo && stockInfo.exchange) {
            const stepSize = getStepSize(price, stockInfo.exchange, stockInfo.stockType, symbol);
            if (stepSize > 1 && price % stepSize !== 0) {
                return trans.trading.update_modal.err_price_step.replace(
                    '${step}',
                    formatBoardPrice(stepSize),
                );
            }
        }

        return undefined;
    };

    const adjustQty = (direction: 1 | -1) => {
        form.setFieldValue('qty', (prev) => {
            const num = parseQuantity(prev);
            const step = num >= 100 ? 100 : 1;
            let next = Math.max(1, num + direction * step);
            if (next < 100) {
                next = Math.min(99, next);
            }
            return formatNumberVN(next, { decimals: 0 });
        });
        validateFieldsDebouncer.maybeExecute();
    };

    const adjustPrice = (direction: 1 | -1) => {
        if (!stockInfo) return;
        form.setFieldValue('price', (prev) => {
            const rawVal = parsePrice(prev);
            if (rawVal <= 0) return prev;
            const stepSize = getStepSize(
                direction === -1 ? rawVal - 1 : rawVal,
                stockInfo.exchange,
                stockInfo.stockType,
                symbol,
            );
            const next = Math.max(0, rawVal + direction * stepSize);
            if (next <= 0) return prev;
            return formatBoardPrice(next);
        });
        validateFieldsDebouncer.maybeExecute();
    };

    const handleConfirm = async (
        qtyStr: string,
        priceStr: string,
        execDateStr: string,
        expDateStr: string,
    ) => {
        const qty = parseQuantity(qtyStr);
        const apiPrice = parsePrice(priceStr);
        if (!is247 && isPriceDirty(priceStr) && isQtyDirty(qtyStr)) {
            toast.warning(trans.trading.update_modal.warning);
            return;
        }

        startLoading();
        let is2FAExpired = false;
        try {
            const updateFn = is247 ? updateSubAccountOrder247 : updateSubAccountStockOrder;
            const { error_code, data, message } = await updateFn(subAccountId, orderId, {
                sub_account: subAccountExt,
                cus_id: custId,
                quantity: qty,
                price: apiPrice,
                validation_type: validationType,
                order_condition_type: orderConditionType,
                execution_date: is247 ? execDateStr : undefined,
                expired_date: is247 ? expDateStr : undefined,
            });

            if (isSuccessApi(error_code)) {
                if (data && data.length > 0) {
                    if (data[0].code === '0') {
                        patchOrdersInBook([
                            {
                                orderId,
                                rawPrice: apiPrice,
                                rawQty: qty,
                                placedPrice: formatBoardPrice(apiPrice),
                                totalQty: formatNumberVN(qty, { decimals: 0 }),
                                ...(is247
                                    ? { executionDate: execDateStr, expiredDate: expDateStr }
                                    : {}),
                            },
                        ]);
                        toast.success(trans.trading.order_status_message.success);
                    } else {
                        toast.error(
                            mapOrderErrorCodeToStatus(
                                data[0].code,
                                trans,
                                data[0].rejected_reason ?? '',
                            ),
                        );
                    }
                }
                onSuccess();
            } else if (error_code === ERROR_CODES.FAILED_2FA_TOKEN_EXPIRED) {
                is2FAExpired = true;
            } else {
                toast.warning(message);
            }
        } catch (err: any) {
            const errCode = err?.error_code ?? err?.response?.data?.error_code;
            if (errCode === ERROR_CODES.FAILED_2FA_TOKEN_EXPIRED) {
                is2FAExpired = true;
            } else {
                toast.error(getApiErrorMessage(err, trans.common.try_again_error));
            }
        } finally {
            stopLoading();
            onClose();
            if (is2FAExpired) handle2FATokenExpired(onExpired2FA, TWO_FA_PLACEMENT.GLOBAL);
        }
    };

    const fetchStockInfo = async () => {
        startLoading();
        try {
            const { error_code, result, message } = await fetchStockRealtime(symbol);
            if (isSuccessApi(error_code)) {
                const info = {
                    floor: result.floor || 0,
                    ceiling: result.ceiling || 0,
                    exchange: result.exchange || '',
                    stockType: result.stockType || '',
                };
                setStockInfo(info);

                form.setFieldValue('price', formatBoardPrice(rawPrice));
                validateFieldsDebouncer.maybeExecute();
            } else {
                toast.error(message);
            }
        } catch (err) {
            toast.error(getApiErrorMessage(err, trans.common.try_again_error));
        } finally {
            stopLoading();
        }
    };

    useEffect(() => {
        if (symbol) {
            fetchStockInfo();
        }
    }, [symbol]);

    return (
        <Dialog title={title} maxWidth="max-w-md" onClose={onClose}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}
            >
                <div className="flex flex-col gap-5">
                    <form.Field
                        name="qty"
                        validators={{
                            onChange: ({ value }) => validateQty(value),
                        }}
                    >
                        {(field) => (
                            <div className="flex flex-col gap-2">
                                <label htmlFor="order-qty" className="font-body-3 text-secondary">
                                    {trans.trading.update_modal.qty_label}
                                </label>
                                <div
                                    className={`bg-tertiary rounded-xl border flex items-center px-4 py-3 gap-3 transition-colors ${
                                        !is247 && priceChanged
                                            ? 'border-quaternary opacity-50 cursor-not-allowed'
                                            : field.state.meta.errors.length > 0
                                              ? 'border-red'
                                              : 'border-transparent focus-within:border-highlight'
                                    }`}
                                >
                                    <button
                                        type="button"
                                        disabled={!is247 && priceChanged}
                                        onClick={() => adjustQty(-1)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-full font-body-2-highlight transition-colors shrink-0 ${
                                            !is247 && priceChanged
                                                ? 'bg-quaternary text-secondary cursor-not-allowed'
                                                : 'bg-quaternary text-primary hover:bg-highlight hover:text-quaternary'
                                        }`}
                                    >
                                        −
                                    </button>
                                    <input
                                        id="order-qty"
                                        type="text"
                                        inputMode="numeric"
                                        disabled={!is247 && priceChanged}
                                        value={field.state.value}
                                        onChange={(e) => {
                                            const sanitized = formatNumberVNInput(e.target.value, {
                                                mode: 'integer',
                                                allowEmpty: true,
                                            });
                                            field.handleChange(sanitized);
                                            validateFieldsDebouncer.maybeExecute();
                                        }}
                                        onBlur={() => {
                                            const qty = parseQuantity(field.state.value);
                                            const formatted = formatNumberVN(qty, { decimals: 0 });
                                            form.setFieldValue('qty', formatted);
                                            validateFieldsDebouncer.maybeExecute();
                                            field.handleBlur();
                                        }}
                                        className={`flex-1 bg-transparent font-body-2 text-center focus:outline-none ${
                                            !is247 && priceChanged
                                                ? 'text-secondary cursor-not-allowed'
                                                : 'text-primary'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        disabled={!is247 && priceChanged}
                                        onClick={() => adjustQty(1)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-full font-body-2-highlight transition-colors shrink-0 ${
                                            !is247 && priceChanged
                                                ? 'bg-quaternary text-secondary cursor-not-allowed'
                                                : 'bg-quaternary text-primary hover:bg-highlight hover:text-quaternary'
                                        }`}
                                    >
                                        +
                                    </button>
                                </div>
                                {field.state.meta.errors.length > 0 && (
                                    <span className="font-caption text-red">
                                        {field.state.meta.errors[0]}
                                    </span>
                                )}
                            </div>
                        )}
                    </form.Field>
                    <form.Field
                        name="price"
                        validators={{
                            onChange: ({ value }) => validatePrice(value),
                        }}
                    >
                        {(field) => (
                            <div className="flex flex-col gap-2">
                                <label htmlFor="order-price" className="font-body-3 text-secondary">
                                    {trans.trading.update_modal.price_label}
                                </label>
                                <div
                                    className={`bg-tertiary rounded-xl border flex items-center px-4 py-3 gap-3 transition-colors ${
                                        !is247 && qtyChanged
                                            ? 'border-quaternary opacity-50 cursor-not-allowed'
                                            : field.state.meta.errors.length > 0
                                              ? 'border-red'
                                              : 'border-transparent focus-within:border-highlight'
                                    }`}
                                >
                                    <button
                                        type="button"
                                        disabled={!is247 && qtyChanged}
                                        onClick={() => adjustPrice(-1)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-full font-body-2-highlight transition-colors shrink-0 ${
                                            !is247 && qtyChanged
                                                ? 'bg-quaternary text-secondary cursor-not-allowed'
                                                : 'bg-quaternary text-primary hover:bg-highlight hover:text-quaternary'
                                        }`}
                                    >
                                        −
                                    </button>
                                    <input
                                        id="order-price"
                                        type="text"
                                        inputMode="decimal"
                                        disabled={!is247 && qtyChanged}
                                        value={field.state.value}
                                        onChange={(e) => {
                                            const formatted = formatNumberVNInput(e.target.value, {
                                                mode: 'decimal',
                                                decimalSeparator: ',',
                                                maxFractionDigits: 3,
                                                allowEmpty: true,
                                                normalizeLeadingZero: true,
                                            });
                                            field.handleChange(formatted);
                                            validateFieldsDebouncer.maybeExecute();
                                        }}
                                        onBlur={() => {
                                            const price = parsePrice(field.state.value);
                                            if (price > 0) {
                                                form.setFieldValue(
                                                    'price',
                                                    formatBoardPrice(price),
                                                );
                                            }
                                            validateFieldsDebouncer.maybeExecute();
                                            field.handleBlur();
                                        }}
                                        className={`flex-1 bg-transparent font-body-2 text-center focus:outline-none ${
                                            !is247 && qtyChanged
                                                ? 'text-secondary cursor-not-allowed'
                                                : 'text-primary'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        disabled={!is247 && qtyChanged}
                                        onClick={() => adjustPrice(1)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-full font-body-2-highlight transition-colors shrink-0 ${
                                            !is247 && qtyChanged
                                                ? 'bg-quaternary text-secondary cursor-not-allowed'
                                                : 'bg-quaternary text-primary hover:bg-highlight hover:text-quaternary'
                                        }`}
                                    >
                                        +
                                    </button>
                                </div>
                                {field.state.meta.errors.length > 0 ? (
                                    <span className="font-caption text-red">
                                        {field.state.meta.errors[0]}
                                    </span>
                                ) : (
                                    !orderConditionType &&
                                    stockInfo &&
                                    stockInfo.floor > 0 &&
                                    stockInfo.ceiling > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="font-caption text-secondary">
                                                {trans.trading.update_modal.floor_prefix}{' '}
                                                {formatBoardPrice(stockInfo.floor)}
                                            </span>
                                            <span className="font-caption text-secondary">
                                                {trans.trading.update_modal.ceiling_prefix}{' '}
                                                {formatBoardPrice(stockInfo.ceiling)}
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </form.Field>
                    {is247 && (
                        <Trade247DateRange form={form} isBuySide={isBuy} isExecutionDateReadonly />
                    )}
                    <div className="bg-tertiary rounded-xl px-4 py-3 flex items-start gap-2">
                        <span className="text-yellow font-caption shrink-0 mt-0.5">⚠</span>
                        <p className="font-caption text-secondary">
                            {trans.trading.update_modal.warning}
                        </p>
                    </div>
                    <button
                        type="submit"
                        disabled={!canSubmit || isLoading}
                        className={`w-full py-2 rounded-xl font-body-3-highlight transition-colors ${
                            !canSubmit || isLoading
                                ? 'bg-disabled text-disabled cursor-not-allowed'
                                : 'bg-highlight text-quaternary hover:opacity-90'
                        }`}
                    >
                        {trans.trading.update_modal.btn_confirm}
                    </button>
                </div>
            </form>
        </Dialog>
    );
};
