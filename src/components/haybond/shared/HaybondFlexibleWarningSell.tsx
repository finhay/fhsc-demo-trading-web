'use client';

import Image from 'next/image';

import { FLEXIBLE_SELL_FLOW_STEPS } from '@/constants/haybond';
import { useTranslate } from '@/hooks/useTranslate';
import { useHaybondFlexStore } from '@/stores/haybond/useHaybondFlexStore';

export const HaybondFlexibleWarningSell = () => {
    const trans = useTranslate();
    const {
        warningMessage,
        resetForm,
        setSellStep: setStep,
        resetSellFlow,
    } = useHaybondFlexStore();

    const handleClose = () => {
        resetForm();
        resetSellFlow();
    };

    return (
        <div className="flex flex-col items-center gap-6 py-4 text-center">
            <Image
                src="https://cdn1.finhay.com.vn/vnsc-prod/1739420600672-Status_Warning.svg"
                width={140}
                height={140}
                alt="warning"
            />
            <h3 className="font-heading-4 text-primary">{trans.haybond.sell_will_loss}</h3>
            <p className="font-body-1 text-primary">{warningMessage}</p>
            <div className="flex w-full max-w-sm flex-col gap-2">
                <button
                    type="button"
                    onClick={handleClose}
                    className="bg-highlight text-quaternary font-body-3-highlight w-full rounded-full px-4 py-2"
                >
                    {trans.haybond.continue_invest}
                </button>
                <button
                    type="button"
                    onClick={() => setStep(FLEXIBLE_SELL_FLOW_STEPS.CONFIRM)}
                    className="bg-success text-highlight font-body-3-highlight w-full rounded-full px-4 py-2"
                >
                    {trans.haybond.choose_sell}
                </button>
            </div>
        </div>
    );
};
