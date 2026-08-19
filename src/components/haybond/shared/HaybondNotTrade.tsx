'use client';

import { FaCircleXmark } from 'react-icons/fa6';

import { useTranslate } from '@/hooks/useTranslate';
import { useHaybondStore } from '@/stores/haybond/useHaybondStore';

export const HaybondNotTrade = () => {
    const trans = useTranslate();
    const { resetBuyFlow } = useHaybondStore();

    return (
        <div className="flex flex-col items-center gap-6 py-4 text-center">
            <FaCircleXmark size={140} className="text-red" aria-label="fail" />
            <h3 className="font-heading-4 text-primary">{trans.haybond.need_complete_contract}</h3>
            <p className="font-body-2 text-secondary">
                {trans.haybond.contact_support}
                <br />
                hotline: 024 7777 8996
            </p>
            <button
                type="button"
                onClick={resetBuyFlow}
                className="bg-highlight text-quaternary font-body-3-highlight w-full max-w-sm rounded-full px-4 py-2"
            >
                {trans.haybond.close}
            </button>
        </div>
    );
};
