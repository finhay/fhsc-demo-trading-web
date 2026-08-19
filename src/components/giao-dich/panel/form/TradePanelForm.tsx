'use client';

import { Tooltip } from '@/components/common/ui/Tooltip';
import { TradePanel247Dates } from '@/components/giao-dich/panel/form/TradePanel247Dates';
import { TradePanelTwapFields } from '@/components/giao-dich/panel/form/TradePanelTwapFields';
import { TradeQuickSlider } from '@/components/giao-dich/panel/form/TradeQuickSlider';
import { TradeStepperInput } from '@/components/giao-dich/panel/form/TradeStepperInput';
import { TradeTotalField } from '@/components/giao-dich/panel/form/TradeTotalField';
import { ORDER_MODE_KEY, ORDER_TYPE_KEY, TRADE_LITERAL } from '@/constants/trading';
import { useTranslate } from '@/hooks/useTranslate';
import { type TradePanelActiveConfig, type TradePanelFormInstance } from '@/types/pages/trading';
import type { TwapLoUrgency } from '@/types/trade/twap-lo';
import { formatBoardPrice, formatNumberVN, formatNumberVNInput } from '@/utils/format';
import {
    parsePrice,
    parseQuantity,
    stepDecreaseVolume,
    stepIncreaseVolume,
} from '@/utils/trading/panel';

type Props = {
    form: TradePanelFormInstance;
    activeConfig: TradePanelActiveConfig;
    isLO: boolean;
    is247: boolean;
    isIceberg: boolean;
    isTwapLo: boolean;
    orderMode: string;
    selectedOrderType: string;
    twapStartAt: string;
    twapUrgency: TwapLoUrgency;
    onTwapStartAtChange: (value: string) => void;
    onTwapUrgencyChange: (value: TwapLoUrgency) => void;
    requestAvailableTrade: (side: string, price: number, options?: { immediate?: boolean }) => void;
    bumpFormPrice: (side: string, direction: string) => void;
    bumpQty: (side: string, direction: string) => void;
    setBuyPercentage: (pct: number) => void;
    setSellPercentage: (pct: number) => void;
};

export const TradePanelForm = ({
    form,
    activeConfig,
    isLO,
    is247,
    isIceberg,
    isTwapLo,
    orderMode,
    selectedOrderType,
    twapStartAt,
    twapUrgency,
    onTwapStartAtChange,
    onTwapUrgencyChange,
    requestAvailableTrade,
    bumpFormPrice,
    bumpQty,
    setBuyPercentage,
    setSellPercentage,
}: Props) => {
    const trans = useTranslate();

    return (
        <form
            className="flex w-full items-start"
            onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
            }}
        >
            <fieldset className="flex flex-1 flex-col gap-1" aria-label={activeConfig.ariaLabel}>
                <legend className="sr-only">{activeConfig.legendSr}</legend>
                <form.Field
                    name={activeConfig.priceField}
                    validators={{
                        onChange: activeConfig.validatePrice,
                    }}
                >
                    {(field) => (
                        <TradeStepperInput
                            value={is247 || isLO ? field.state.value : selectedOrderType}
                            label={trans.trading.panel.price_label}
                            hasValue={parsePrice(field.state.value) > 0}
                            side={activeConfig.stepperSide}
                            disabled={!is247 && !isLO}
                            onChange={(v) => {
                                const formatted = formatNumberVNInput(v, {
                                    mode: 'decimal',
                                    decimalSeparator: ',',
                                    maxFractionDigits: 3,
                                    allowEmpty: true,
                                    normalizeLeadingZero: true,
                                });
                                field.handleChange(formatted);
                                requestAvailableTrade(activeConfig.key, parsePrice(formatted), {
                                    immediate: false,
                                });
                            }}
                            onBlur={() => {
                                const price = parsePrice(field.state.value);
                                const formatted = price > 0 ? formatBoardPrice(price) : '';
                                form.setFieldValue(activeConfig.priceField, formatted);
                                activeConfig.setStorePrice(price);
                                field.handleBlur();
                            }}
                            onIncrement={() =>
                                bumpFormPrice(activeConfig.key, TRADE_LITERAL.INCREASE)
                            }
                            onDecrement={() =>
                                bumpFormPrice(activeConfig.key, TRADE_LITERAL.DECREASE)
                            }
                            error={field.state.meta.errors[0]?.toString()}
                        />
                    )}
                </form.Field>
                <form.Field
                    name={activeConfig.qtyField}
                    validators={{
                        onChange: activeConfig.validateQty,
                    }}
                >
                    {(field) => (
                        <TradeStepperInput
                            unit="cp"
                            value={field.state.value}
                            label={trans.trading.panel.qty_label}
                            hasValue={parseQuantity(field.state.value) > 0}
                            side={activeConfig.stepperSide}
                            onChange={(v) => {
                                const formatted = formatNumberVNInput(v, {
                                    mode: 'integer',
                                    allowEmpty: true,
                                });
                                field.handleChange(formatted);
                                const qty = parseQuantity(formatted);
                                activeConfig.setStoreQty(qty);
                                const percent =
                                    activeConfig.maxQty > 0
                                        ? Math.min(
                                              100,
                                              Math.round((qty / activeConfig.maxQty) * 100),
                                          )
                                        : 0;
                                if (activeConfig.key === TRADE_LITERAL.BUY) {
                                    setBuyPercentage(percent);
                                } else {
                                    setSellPercentage(percent);
                                }
                                form.validateField(activeConfig.qtyField, 'change');
                                if (isIceberg) {
                                    form.validateField('childQuantity', 'change');
                                }
                            }}
                            onBlur={() => {
                                const qty = parseQuantity(field.state.value);
                                form.setFieldValue(
                                    activeConfig.qtyField,
                                    qty > 0 ? formatNumberVN(qty, { decimals: 0 }) : '',
                                );
                                activeConfig.setStoreQty(qty);
                                form.validateField(activeConfig.qtyField, 'change');
                                if (isIceberg) {
                                    form.validateField('childQuantity', 'change');
                                }
                                field.handleBlur();
                            }}
                            onIncrement={() => bumpQty(activeConfig.key, TRADE_LITERAL.INCREASE)}
                            onDecrement={() => bumpQty(activeConfig.key, TRADE_LITERAL.DECREASE)}
                            error={field.state.meta.errors[0]?.toString()}
                        />
                    )}
                </form.Field>
                {isIceberg && (
                    <form.Field
                        name="childQuantity"
                        validators={{
                            onChange: ({ value }) => {
                                if (!value.trim()) return undefined;
                                const child = parseQuantity(value);
                                const total = parseQuantity(
                                    form.getFieldValue(activeConfig.qtyField),
                                );
                                if (child <= 0) return trans.trading.panel.err_child_qty_required;
                                if (child % 100 !== 0) return trans.trading.panel.err_qty_divisible;
                                if (total > 0 && child > total) {
                                    return trans.trading.panel.err_child_qty;
                                }
                                return undefined;
                            },
                        }}
                    >
                        {(field) => (
                            <TradeStepperInput
                                unit="cp"
                                value={field.state.value}
                                label={trans.trading.panel.qty_label_child}
                                hasValue={parseQuantity(field.state.value) > 0}
                                side={activeConfig.stepperSide}
                                onChange={(v) => {
                                    const formatted = formatNumberVNInput(v, {
                                        mode: 'integer',
                                        allowEmpty: true,
                                    });
                                    field.handleChange(formatted);
                                }}
                                onBlur={() => {
                                    const qty = parseQuantity(field.state.value);
                                    form.setFieldValue(
                                        'childQuantity',
                                        qty > 0 ? formatNumberVN(qty, { decimals: 0 }) : '',
                                    );
                                    form.validateField('childQuantity', 'change');
                                    field.handleBlur();
                                }}
                                onIncrement={() => {
                                    const cur = parseQuantity(field.state.value);
                                    const next = cur + stepIncreaseVolume(cur);
                                    form.setFieldValue(
                                        'childQuantity',
                                        formatNumberVN(next, { decimals: 0 }),
                                    );
                                    form.validateField('childQuantity', 'change');
                                }}
                                onDecrement={() => {
                                    const cur = parseQuantity(field.state.value);
                                    const next = Math.max(0, cur - stepDecreaseVolume(cur));
                                    form.setFieldValue(
                                        'childQuantity',
                                        next > 0 ? formatNumberVN(next, { decimals: 0 }) : '',
                                    );
                                    form.validateField('childQuantity', 'change');
                                }}
                                error={field.state.meta.errors[0]?.toString()}
                            />
                        )}
                    </form.Field>
                )}
                {orderMode === ORDER_MODE_KEY.TAB_247 && (
                    <TradePanel247Dates form={form} activeSideKey={activeConfig.key} />
                )}
                {isTwapLo && (
                    <TradePanelTwapFields
                        startAt={twapStartAt}
                        urgency={twapUrgency}
                        side={activeConfig.stepperSide}
                        onStartAtChange={onTwapStartAtChange}
                        onUrgencyChange={onTwapUrgencyChange}
                    />
                )}
                {!isIceberg && !isTwapLo && (
                    <TradeQuickSlider
                        value={activeConfig.percentage}
                        onChange={activeConfig.onPctChange}
                        active={activeConfig.key === TRADE_LITERAL.BUY}
                    />
                )}
                {isLO && (
                    <form.Subscribe
                        selector={(s) => ({
                            pv: s.values[activeConfig.priceField],
                            qv: s.values[activeConfig.qtyField],
                        })}
                    >
                        {({ pv, qv }) => {
                            const price = parsePrice(pv);
                            const qty = parseQuantity(qv);
                            const hasVal = price > 0 && qty > 0;
                            return (
                                <TradeTotalField
                                    label={activeConfig.totalLabel}
                                    value={
                                        hasVal
                                            ? `${formatNumberVN(price * qty, { trimTrailingZeros: true })}${trans.trading.currency.suffix}`
                                            : trans.trading.currency.zero
                                    }
                                    hasValue={hasVal}
                                    side={activeConfig.stepperSide}
                                />
                            );
                        }}
                    </form.Subscribe>
                )}
            </fieldset>
        </form>
    );
};

type SubmitProps = {
    form: TradePanelFormInstance;
    activeConfig: TradePanelActiveConfig;
    isLO: boolean;
    isIceberg: boolean;
    selectedOrderType: string;
    symbol: string;
    isOrderTypeAllowedInSession: boolean;
    isSessionNearBoundary: boolean;
    canTrade: boolean;
    onOpenConfirm: (side: string) => void;
};

export const TradePanelSubmit = ({
    form,
    activeConfig,
    isLO,
    isIceberg,
    selectedOrderType,
    symbol,
    isOrderTypeAllowedInSession,
    isSessionNearBoundary,
    canTrade,
    onOpenConfirm,
}: SubmitProps) => {
    const trans = useTranslate();

    return (
        <div className="w-full shrink-0">
            <form.Subscribe
                selector={(s) => ({
                    pv: s.values[activeConfig.priceField],
                    qv: s.values[activeConfig.qtyField],
                    cv: s.values.childQuantity,
                    pErrors: s.fieldMeta[activeConfig.priceField]?.errors || [],
                    qErrors: s.fieldMeta[activeConfig.qtyField]?.errors || [],
                    cErrors: s.fieldMeta.childQuantity?.errors || [],
                })}
            >
                {({ pv, qv, cv, pErrors, qErrors, cErrors }) => {
                    const hasErrors = pErrors.length > 0 || qErrors.length > 0;
                    const qty = parseQuantity(qv);
                    const isSessionBlocked =
                        isSessionNearBoundary && selectedOrderType !== ORDER_TYPE_KEY.LO;
                    const hasMaxQty = activeConfig.maxQty > 0;
                    const isChildQtyValid =
                        !isIceberg || (parseQuantity(cv) > 0 && cErrors.length === 0);
                    const canSubmit =
                        isChildQtyValid &&
                        (isLO
                            ? parsePrice(pv) > 0 &&
                              qty > 0 &&
                              !hasErrors &&
                              isOrderTypeAllowedInSession &&
                              !isSessionBlocked &&
                              hasMaxQty
                            : qty > 0 &&
                              !hasErrors &&
                              isOrderTypeAllowedInSession &&
                              !isSessionBlocked &&
                              hasMaxQty);
                    const ctaLabel = `${activeConfig.ctaLabel} ${symbol}`;
                    const isDisabled = !canTrade || !canSubmit;

                    const ctaButton = (
                        <button
                            type="button"
                            disabled={isDisabled}
                            onClick={() => {
                                if (!canTrade || !canSubmit) return;
                                if (!isOrderTypeAllowedInSession || isSessionBlocked) return;
                                onOpenConfirm(activeConfig.orderSide);
                            }}
                            className={`flex w-full items-center justify-center rounded-full px-4 py-2 font-body-3-highlight transition-opacity ${
                                isDisabled
                                    ? 'cursor-not-allowed bg-disabled text-disabled'
                                    : activeConfig.ctaEnabledClass
                            }`}
                        >
                            {ctaLabel}
                        </button>
                    );

                    if (!canTrade) {
                        return (
                            <Tooltip
                                content={trans.trading.panel.cannot_trade}
                                placement="top"
                                className="block w-full"
                            >
                                {ctaButton}
                            </Tooltip>
                        );
                    }

                    return ctaButton;
                }}
            </form.Subscribe>
        </div>
    );
};
