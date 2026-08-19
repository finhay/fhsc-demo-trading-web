'use client';

import { FaCircleCheck } from 'react-icons/fa6';

import { useTranslate } from '@/hooks/useTranslate';
import { useHaybondStore } from '@/stores/haybond/useHaybondStore';

export const HaybondConfirmSellSuccess = () => {
    const trans = useTranslate();
    const { resetSellFlow } = useHaybondStore();

    return (
        <div className="flex flex-col items-center gap-6 py-4 text-center">
            <FaCircleCheck size={140} className="text-green" aria-label="success" />
            <h3 className="font-heading-4 text-primary">{trans.haybond.withdraw_success}</h3>
            <p className="font-body-1 text-primary">{trans.haybond.system_processing}</p>
            <button
                type="button"
                onClick={resetSellFlow}
                className="bg-tertiary text-primary font-body-3-highlight w-full max-w-sm rounded-full px-4 py-2"
            >
                {trans.haybond.done}
            </button>
        </div>
    );
};
