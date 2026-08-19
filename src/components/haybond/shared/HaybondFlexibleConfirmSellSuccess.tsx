'use client';

import { useRouter } from 'next/router';

import { FaCircleCheck } from 'react-icons/fa6';

import { useTranslate } from '@/hooks/useTranslate';
import { useHaybondFlexStore } from '@/stores/haybond/useHaybondFlexStore';

export const HaybondFlexibleConfirmSellSuccess = () => {
    const trans = useTranslate();
    const router = useRouter();
    const { resetForm, resetSellFlow } = useHaybondFlexStore();

    const handleClose = () => {
        resetForm();
        resetSellFlow();
    };

    const handleToHistory = () => {
        router.push('/haybond/lich-su-dat-lenh');
        handleClose();
    };

    return (
        <div className="flex flex-col items-center gap-6 py-4 text-center">
            <FaCircleCheck size={140} className="text-green" aria-label="success" />
            <h3 className="font-heading-4 text-primary">{trans.haybond.confirm_success}</h3>
            <p className="font-body-1 text-primary">{trans.haybond.sell_order_received}</p>
            <div className="flex w-full max-w-sm flex-col gap-2">
                <button
                    type="button"
                    onClick={handleClose}
                    className="bg-success text-highlight font-body-3-highlight w-full rounded-full px-4 py-2"
                >
                    {trans.haybond.close}
                </button>
                <button
                    type="button"
                    onClick={handleToHistory}
                    className="bg-highlight text-quaternary font-body-3-highlight w-full rounded-full px-4 py-2"
                >
                    {trans.haybond.order_history}
                </button>
            </div>
        </div>
    );
};
