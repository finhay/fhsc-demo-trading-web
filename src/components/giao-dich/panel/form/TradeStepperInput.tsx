'use client';

import { useId } from 'react';

import { FaMinus, FaPlus } from 'react-icons/fa6';

import { getTradingFieldBg } from '@/utils/trading/panel';

type Props = {
    value: string;
    label?: string;
    hasValue?: boolean;
    side?: 'buy' | 'sell';
    disabled?: boolean;
    onChange: (value: string) => void;
    onBlur: () => void;
    onIncrement?: () => void;
    onDecrement?: () => void;
    error?: string;
    unit?: string;
};

export const TradeStepperInput = ({
    value,
    label,
    hasValue = false,
    side,
    disabled = false,
    onChange,
    onBlur,
    onIncrement,
    onDecrement,
    error,
    unit,
}: Props) => {
    const inputId = useId();
    const textClass = hasValue ? 'text-primary' : 'text-secondary';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value.replace(/[^0-9.,]/g, ''));
    };

    return (
        <div className="flex w-full flex-col gap-1">
            <div
                className={`flex items-center justify-between rounded-xl p-2 overflow-hidden transition-colors ${getTradingFieldBg(hasValue, side, disabled)}`}
            >
                <button
                    type="button"
                    onClick={onDecrement}
                    disabled={disabled}
                    className="flex items-center justify-center px-1 disabled:cursor-not-allowed"
                >
                    <FaMinus size={14} className="text-primary" />
                </button>
                <label
                    htmlFor={inputId}
                    className="flex flex-1 flex-col items-center justify-center cursor-text"
                >
                    {label && hasValue && (
                        <span className="font-caption text-tertiary">{label}</span>
                    )}
                    <span className="flex items-center justify-center min-w-0">
                        <input
                            id={inputId}
                            type="text"
                            inputMode="decimal"
                            value={value}
                            placeholder={label}
                            disabled={disabled}
                            onChange={handleChange}
                            onFocus={(e) => e.target.select()}
                            onBlur={onBlur}
                            size={Math.max(value.length || label?.length || 1, 1)}
                            className={`${hasValue ? 'font-body-3-highlight' : 'font-caption'} text-center bg-transparent focus:outline-none placeholder:text-tertiary min-w-0 ${textClass}`}
                        />
                        {hasValue && unit && (
                            <span className="font-body-3-highlight text-primary">{unit}</span>
                        )}
                    </span>
                </label>
                <button
                    type="button"
                    onClick={onIncrement}
                    disabled={disabled}
                    className="flex items-center justify-center px-1 disabled:cursor-not-allowed"
                >
                    <FaPlus size={14} className="text-primary" />
                </button>
            </div>
            <span className="font-tiny text-red px-1">{error || ''}</span>
        </div>
    );
};
