'use client';

import { useForm, useStore } from '@tanstack/react-form';

import Link from 'next/link';

import { FaArrowRight, FaXmark } from 'react-icons/fa6';

import { InputField } from '@/components/common/feature/InputField';
import { useTranslate } from '@/hooks/useTranslate';
import { useSubscriptionStore } from '@/stores/ipo/useSubscriptionStore';
import { formatNumberVN } from '@/utils/format';
import { calculateDeposit, calculateTotalValue } from '@/utils/ipo';

export const IpoSubscriptionForm = () => {
    const trans = useTranslate();
    const {
        selectedItem,
        registrationInfo,
        quantity,
        price,
        availableBalance,
        setQuantity,
        setPrice,
        setProceedToConfirm,
        resetStore,
    } = useSubscriptionStore();

    const {
        min_price,
        max_price,
        min_quantity,
        max_quantity,
        step_price,
        step_quantity,
        is_fix_price,
        is_fix_quantity,
        conditions_description,
        deposit_rate,
        info_url,
    } = registrationInfo;

    const form = useForm({
        defaultValues: {
            quantity,
            price,
        },
        onSubmit: ({ value }) => {
            setProceedToConfirm(value.quantity, value.price);
        },
    });

    const canSubmit = useStore(form.store, (state) => state.canSubmit && !state.isSubmitting);

    const totalValue = calculateTotalValue(quantity, price);
    const deposit = calculateDeposit(totalValue, deposit_rate);
    const isExceedBalance =
        totalValue !== null && availableBalance !== null && totalValue > availableBalance;
    const isButtonDisabled = !canSubmit || isExceedBalance;

    if (!selectedItem) return null;

    return (
        <>
            <header className="flex items-start gap-4 relative">
                <div className="flex flex-col gap-1 flex-1">
                    <h2 id="subscription-form-title" className="font-body-1-highlight text-primary">
                        {trans.ipo.modal.form.title}
                        {selectedItem.symbol}
                    </h2>
                    <p className="font-body-3 text-secondary">{selectedItem.name}</p>
                </div>
                <button
                    onClick={resetStore}
                    className="absolute top-0 right-0 text-primary bg-transparent border-none cursor-pointer"
                    type="button"
                    aria-label={trans.ipo.common.close}
                >
                    <FaXmark size={20} />
                </button>
            </header>
            <div className="flex gap-3 flex-1 min-h-0">
                <section
                    className="bg-secondary flex-1 flex flex-col gap-6 rounded-xl p-3 overflow-y-auto"
                    aria-labelledby="important-info-title"
                >
                    <h3 id="important-info-title" className="font-body-3-highlight text-primary">
                        {trans.ipo.modal.form.important}
                    </h3>
                    <ul className="list-disc pl-6 flex flex-col gap-1 font-body-2 text-primary">
                        {conditions_description.map((condition, index) => (
                            <li key={index}>{condition}</li>
                        ))}
                    </ul>
                    <Link
                        href={info_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-tertiary flex items-center justify-between gap-2 p-3 rounded-xl no-underline hover:opacity-80 transition-opacity"
                    >
                        <span className="font-body-3-highlight text-green">
                            {trans.ipo.modal.form.view_full_info}
                            <br />
                            {trans.ipo.modal.form.fund_certificate}
                            {selectedItem.symbol}
                        </span>
                        <FaArrowRight size={16} className="text-green shrink-0" />
                    </Link>
                </section>
                <section
                    className="bg-secondary flex-1 flex flex-col gap-8 rounded-xl p-3"
                    aria-labelledby="registration-info-title"
                >
                    <h3 id="registration-info-title" className="font-body-3-highlight text-primary">
                        {trans.ipo.modal.form.registration_info}
                    </h3>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            form.handleSubmit();
                        }}
                        className="flex flex-col gap-6 items-center"
                    >
                        {is_fix_price ? (
                            <div className="bg-tertiary flex flex-col gap-1 px-3 py-2 rounded-xl w-full border border-transparent">
                                <span className="font-caption-highlight text-primary">
                                    {trans.ipo.modal.form.price}
                                </span>
                                <p className="font-caption text-tertiary">
                                    {formatNumberVN(min_price)}
                                </p>
                            </div>
                        ) : (
                            <form.Field
                                name="price"
                                validators={{
                                    onChange: ({ value }) => {
                                        if (!value || value === 0) {
                                            return trans.ipo.modal.form.price_required;
                                        }
                                        if (value < min_price) {
                                            return `${trans.ipo.modal.form.price_min}${formatNumberVN(min_price)}`;
                                        }
                                        if (max_price !== null && value > max_price) {
                                            return `${trans.ipo.modal.form.price_max}${formatNumberVN(max_price)}`;
                                        }
                                        if (value % step_price !== 0) {
                                            return `${trans.ipo.modal.form.price_step}${formatNumberVN(step_price)}`;
                                        }
                                        const total = calculateTotalValue(quantity, value);
                                        if (
                                            total !== null &&
                                            availableBalance !== null &&
                                            total > availableBalance
                                        ) {
                                            return trans.ipo.modal.form.balance_exceeded;
                                        }
                                        return undefined;
                                    },
                                }}
                            >
                                {(field) => (
                                    <InputField
                                        id="price-input"
                                        label={trans.ipo.modal.form.price}
                                        type="text"
                                        inputMode="numeric"
                                        placeholder={`${trans.ipo.modal.form.placeholder_from}${formatNumberVN(min_price)}`}
                                        error={field.state.meta.errors?.[0]}
                                        value={price ? formatNumberVN(price) : ''}
                                        onChange={(e) => {
                                            const inputValue = e.target.value.replace(/\./g, '');
                                            const numValue =
                                                inputValue === '' ? 0 : parseInt(inputValue, 10);
                                            if (!isNaN(numValue)) {
                                                field.handleChange(numValue);
                                                setPrice(numValue);
                                            }
                                        }}
                                    />
                                )}
                            </form.Field>
                        )}
                        {is_fix_quantity ? (
                            <div className="bg-tertiary flex flex-col gap-1 px-3 py-2 rounded-xl w-full border border-transparent">
                                <span className="font-caption-highlight text-primary">
                                    {trans.ipo.modal.form.quantity}
                                </span>
                                <p className="font-caption text-tertiary">
                                    {formatNumberVN(min_quantity, { decimals: 0 })}
                                </p>
                            </div>
                        ) : (
                            <form.Field
                                name="quantity"
                                validators={{
                                    onChange: ({ value }) => {
                                        if (!value || value === 0) {
                                            return trans.ipo.modal.form.quantity_required;
                                        }
                                        if (value < min_quantity) {
                                            return `${trans.ipo.modal.form.quantity_min}${formatNumberVN(min_quantity, { decimals: 0 })}`;
                                        }
                                        if (max_quantity !== null && value > max_quantity) {
                                            return `${trans.ipo.modal.form.quantity_max}${formatNumberVN(max_quantity, { decimals: 0 })}`;
                                        }
                                        if (value % step_quantity !== 0) {
                                            return `${trans.ipo.modal.form.quantity_step}${formatNumberVN(step_quantity, { decimals: 0 })}`;
                                        }
                                        const total = calculateTotalValue(value, price);
                                        if (
                                            total !== null &&
                                            availableBalance !== null &&
                                            total > availableBalance
                                        ) {
                                            return trans.ipo.modal.form.balance_exceeded;
                                        }
                                        return undefined;
                                    },
                                }}
                            >
                                {(field) => (
                                    <InputField
                                        id="quantity-input"
                                        label={trans.ipo.modal.form.quantity}
                                        type="text"
                                        inputMode="numeric"
                                        placeholder={`${trans.ipo.modal.form.placeholder_from}${formatNumberVN(min_quantity, { decimals: 0 })}`}
                                        error={field.state.meta.errors?.[0]}
                                        value={
                                            quantity
                                                ? formatNumberVN(quantity, { decimals: 0 })
                                                : ''
                                        }
                                        onChange={(e) => {
                                            const inputValue = e.target.value.replace(/\./g, '');
                                            const numValue =
                                                inputValue === '' ? 0 : parseInt(inputValue, 10);
                                            if (!isNaN(numValue)) {
                                                field.handleChange(numValue);
                                                setQuantity(numValue);
                                            }
                                        }}
                                    />
                                )}
                            </form.Field>
                        )}
                        <div className="flex flex-col gap-2 w-full">
                            <div className="flex items-center justify-between">
                                <span className="font-body-2 text-secondary">
                                    {trans.ipo.modal.form.total_value}
                                </span>
                                <span className="font-body-2-highlight text-primary">
                                    {totalValue !== null
                                        ? `${formatNumberVN(totalValue, { trimTrailingZeros: true })}đ`
                                        : '0đ'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="font-body-2 text-secondary">
                                        {trans.ipo.modal.form.deposit}
                                    </span>
                                    <span className="bg-red text-primary font-caption-highlight px-1.5 py-0.5 rounded-full text-center">
                                        {deposit_rate}%
                                    </span>
                                </div>
                                <span className="font-body-2-highlight text-primary">
                                    {deposit !== null
                                        ? `${formatNumberVN(deposit, { trimTrailingZeros: true })}đ`
                                        : '0đ'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-body-2 text-secondary">
                                    {trans.ipo.modal.form.available_balance}
                                </span>
                                <span className="font-body-2-highlight text-primary">
                                    {availableBalance !== null
                                        ? `${formatNumberVN(availableBalance, { trimTrailingZeros: true })}đ`
                                        : '0đ'}
                                </span>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isButtonDisabled}
                            className={`${isButtonDisabled ? 'bg-disabled text-secondary' : 'bg-highlight text-quaternary'} font-body-3-highlight rounded-full px-4 py-2 w-2/3 flex items-center justify-center disabled:cursor-not-allowed`}
                        >
                            {trans.ipo.modal.form.submit_button}
                        </button>
                    </form>
                </section>
            </div>
        </>
    );
};
