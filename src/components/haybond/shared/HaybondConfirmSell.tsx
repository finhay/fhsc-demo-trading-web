'use client';

import { useState } from 'react';

import { FaChevronDown, FaChevronUp, FaFileLines } from 'react-icons/fa6';

import { TERM_SELL_FLOW_STEPS } from '@/constants/haybond';
import { useTranslate } from '@/hooks/useTranslate';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useHaybondStore } from '@/stores/haybond/useHaybondStore';
import { formatDate, formatNumberVN } from '@/utils/format';

export const HaybondConfirmSell = () => {
    const trans = useTranslate();
    const [toggleInfo, setToggleInfo] = useState(false);
    const { profile } = useAuthStore();
    const { dataClosing, setSellStep: setStep } = useHaybondStore();
    const {
        name,
        start_date,
        execute_date,
        amount,
        early_profit,
        trading_fee,
        net_amount,
        symbol,
        quantity,
        price,
    } = dataClosing;

    const normalAcc =
        profile?.sub_accounts?.find(
            (acc: { product_type_name?: string; sub_account_ext?: string }) =>
                acc.product_type_name === '.1',
        )?.sub_account_ext ?? null;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex max-h-[70vh] flex-col gap-6 overflow-y-auto">
                <div className="bg-tertiary flex flex-col gap-3 rounded-xl p-3">
                    <div className="flex items-center justify-between gap-3">
                        <span className="font-body-3 text-secondary shrink-0">
                            {trans.haybond.saving_package}
                        </span>
                        <span className="font-body-3-highlight text-primary text-right">
                            {name}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <span className="font-body-3 text-secondary shrink-0">
                            {trans.haybond.start_date}
                        </span>
                        <span className="font-body-3-highlight text-primary text-right">
                            {formatDate(start_date)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <span className="font-body-3 text-secondary shrink-0">
                            {trans.haybond.sell_date}
                        </span>
                        <span className="font-body-3-highlight text-primary text-right">
                            {formatDate(execute_date)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <span className="font-body-3 text-secondary shrink-0">
                            {trans.haybond.amount}
                        </span>
                        <span className="font-body-3-highlight text-primary text-right">
                            {`${formatNumberVN(amount, { decimals: 0 })}${trans.haybond.currency_unit}`}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <span className="font-body-3 text-secondary shrink-0">
                            {trans.haybond.yield_rate}
                        </span>
                        <span className="font-body-3-highlight text-primary text-right">
                            {`${formatNumberVN(early_profit * 100, { decimals: 2, trimTrailingZeros: true })}%/${trans.haybond.year}`}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <span className="font-body-3 text-secondary shrink-0">
                            {trans.haybond.trade_fee}
                        </span>
                        <span className="font-body-3-highlight text-primary text-right">
                            {`${formatNumberVN(trading_fee, { decimals: 0 })}${trans.haybond.currency_unit}`}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <span className="font-body-3 text-secondary shrink-0">
                            {trans.haybond.net_received}
                        </span>
                        <span className="font-body-3-highlight text-primary text-right">
                            {`${formatNumberVN(net_amount, { decimals: 0 })}${trans.haybond.currency_unit}`}
                        </span>
                    </div>
                </div>
                <div className="bg-tertiary rounded-xl p-3">
                    <div className="flex items-center justify-between gap-3">
                        <span className="font-body-3 text-secondary shrink-0">
                            {trans.haybond.receive_account}
                        </span>
                        <span className="font-body-3-highlight text-primary text-right">
                            {`${normalAcc ?? ''} (${trans.haybond.normal})`}
                        </span>
                    </div>
                </div>
                <div className="bg-tertiary rounded-xl p-3">
                    <button
                        type="button"
                        className="flex w-full cursor-pointer items-center justify-between"
                        onClick={() => setToggleInfo((prev) => !prev)}
                    >
                        <div className="flex items-center gap-2">
                            <FaFileLines size={16} className="text-secondary" />
                            <span className="font-body-2 text-primary">
                                {trans.haybond.sell_order_info}
                            </span>
                        </div>
                        {toggleInfo ? (
                            <FaChevronUp className="text-secondary" size={12} />
                        ) : (
                            <FaChevronDown className="text-secondary" size={12} />
                        )}
                    </button>
                    {toggleInfo && (
                        <div className="mt-3 flex flex-col gap-3">
                            <div className="flex items-center justify-between gap-3">
                                <span className="font-body-3 text-secondary shrink-0">
                                    {trans.haybond.bond_symbol}
                                </span>
                                <span className="font-body-3-highlight text-primary text-right">
                                    {symbol}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="font-body-3 text-secondary shrink-0">
                                    {trans.haybond.quantity}
                                </span>
                                <span className="font-body-3-highlight text-primary text-right">
                                    {`${quantity}${trans.haybond.bond_abbr}`}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="font-body-3 text-secondary shrink-0">
                                    {trans.haybond.unit_price}
                                </span>
                                <span className="font-body-3-highlight text-primary text-right">
                                    {`${formatNumberVN(price, { decimals: 0 })}${trans.haybond.currency_unit}`}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="font-body-3 text-secondary shrink-0">
                                    {trans.haybond.buyer}
                                </span>
                                <span className="font-body-3-highlight text-primary text-right">
                                    {`[${trans.haybond.agreed_buyer}]`}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <button
                type="button"
                onClick={() => setStep(TERM_SELL_FLOW_STEPS.OTP)}
                className="bg-highlight text-quaternary font-body-3-highlight w-full rounded-full px-4 py-2"
            >
                {trans.haybond.confirm}
            </button>
        </div>
    );
};
