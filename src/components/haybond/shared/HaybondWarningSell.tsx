'use client';

import Image from 'next/image';

import { TERM_SELL_FLOW_STEPS } from '@/constants/haybond';
import { useTranslate } from '@/hooks/useTranslate';
import { useHaybondStore } from '@/stores/haybond/useHaybondStore';
import { formatNumberVN } from '@/utils/format';

export const HaybondWarningSell = () => {
    const trans = useTranslate();
    const { dataClosing, setSellStep: setStep, resetSellFlow } = useHaybondStore();

    return (
        <div className="flex flex-col items-center gap-5 py-2 text-center">
            <Image src="/market/ic-warning.svg" width={90} height={110} alt="warning" />
            <h2 className="font-heading-4 text-primary">
                {trans.haybond.early_sell_profit_note}{' '}
                {formatNumberVN(dataClosing.early_profit * 100, {
                    decimals: 2,
                    trimTrailingZeros: true,
                })}
                %/{trans.haybond.year}
            </h2>
            <p className="font-body-2 text-secondary">
                {trans.haybond.wait_for_term}{' '}
                {formatNumberVN(dataClosing.profit * 100, { decimals: 2, trimTrailingZeros: true })}
                %/
                {trans.haybond.year}
            </p>
            <button
                type="button"
                onClick={resetSellFlow}
                className="bg-highlight text-quaternary font-body-3-highlight w-full max-w-sm rounded-full px-4 py-2"
            >
                {trans.haybond.continue_saving}
            </button>
            <button
                type="button"
                onClick={() => setStep(TERM_SELL_FLOW_STEPS.CONFIRM)}
                className="bg-tertiary text-primary font-body-3-highlight w-full max-w-sm rounded-full px-4 py-2"
            >
                {trans.haybond.still_early_sell}
            </button>
        </div>
    );
};
