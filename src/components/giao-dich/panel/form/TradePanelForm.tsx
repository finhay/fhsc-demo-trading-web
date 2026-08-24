'use client';

import { Tooltip } from '@/components/common/ui/Tooltip';
import { TradeQuickSlider } from '@/components/giao-dich/panel/form/TradeQuickSlider';
import { TradeStepperInput } from '@/components/giao-dich/panel/form/TradeStepperInput';
import { TradeTotalField } from '@/components/giao-dich/panel/form/TradeTotalField';
import { TRADE_LITERAL } from '@/constants/trading';
import { type TradePanelActiveConfig, type TradePanelFormInstance } from '@/types/pages/trading';
import { formatBoardPrice, formatNumberVN, formatNumberVNInput } from '@/utils/format';
import { parsePrice, parseQuantity } from '@/utils/trading/panel';

type Props = {
    form: TradePanelFormInstance;
    activeConfig: TradePanelActiveConfig;
    requestAvailableTrade: (side: string, price: number, options?: { immediate?: boolean }) => void;
    bumpFormPrice: (side: string, direction: string) => void;
    bumpQty: (side: string, direction: string) => void;
    setBuyPercentage: (pct: number) => void;
    setSellPercentage: (pct: number) => void;
};

export const TradePanelForm = ({
    form,
    activeConfig,
    requestAvailableTrade,
    bumpFormPrice,
    bumpQty,
    setBuyPercentage,
    setSellPercentage,
}: Props) => {
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
                            value={field.state.value}
                            label={'Giá'}
                            hasValue={parsePrice(field.state.value) > 0}
                            side={activeConfig.stepperSide}
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
                            label={'Khối lượng'}
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
                            }}
                            onBlur={() => {
                                const qty = parseQuantity(field.state.value);
                                form.setFieldValue(
                                    activeConfig.qtyField,
                                    qty > 0 ? formatNumberVN(qty, { decimals: 0 }) : '',
                                );
                                activeConfig.setStoreQty(qty);
                                form.validateField(activeConfig.qtyField, 'change');
                                field.handleBlur();
                            }}
                            onIncrement={() => bumpQty(activeConfig.key, TRADE_LITERAL.INCREASE)}
                            onDecrement={() => bumpQty(activeConfig.key, TRADE_LITERAL.DECREASE)}
                            error={field.state.meta.errors[0]?.toString()}
                        />
                    )}
                </form.Field>
                <TradeQuickSlider
                    value={activeConfig.percentage}
                    onChange={activeConfig.onPctChange}
                    active={activeConfig.key === TRADE_LITERAL.BUY}
                />
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
                                        ? `${formatNumberVN(price * qty, { trimTrailingZeros: true })}${'đ'}`
                                        : '0đ'
                                }
                                hasValue={hasVal}
                                side={activeConfig.stepperSide}
                            />
                        );
                    }}
                </form.Subscribe>
            </fieldset>
        </form>
    );
};

type SubmitProps = {
    form: TradePanelFormInstance;
    activeConfig: TradePanelActiveConfig;
    symbol: string;
    isSessionOpen: boolean;
    onOpenConfirm: (side: string) => void;
};

export const TradePanelSubmit = ({
    form,
    activeConfig,
    symbol,
    isSessionOpen,
    onOpenConfirm,
}: SubmitProps) => {
    return (
        <div className="w-full shrink-0">
            <form.Subscribe
                selector={(s) => ({
                    pv: s.values[activeConfig.priceField],
                    qv: s.values[activeConfig.qtyField],
                    pErrors: s.fieldMeta[activeConfig.priceField]?.errors || [],
                    qErrors: s.fieldMeta[activeConfig.qtyField]?.errors || [],
                })}
            >
                {({ pv, qv, pErrors, qErrors }) => {
                    const hasErrors = pErrors.length > 0 || qErrors.length > 0;
                    const qty = parseQuantity(qv);
                    const canSubmit =
                        parsePrice(pv) > 0 &&
                        qty > 0 &&
                        !hasErrors &&
                        isSessionOpen &&
                        activeConfig.maxQty > 0;
                    const ctaLabel = `${activeConfig.ctaLabel} ${symbol}`;
                    const isDisabled = !canSubmit;

                    const ctaButton = (
                        <button
                            type="button"
                            disabled={isDisabled}
                            onClick={() => {
                                if (!canSubmit) return;
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

                    if (!isSessionOpen) {
                        return (
                            <Tooltip
                                content={'Ngoài giờ giao dịch'}
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
