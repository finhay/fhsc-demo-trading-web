'use client';

import { useRouter } from 'next/router';

import { FaCircleCheck } from 'react-icons/fa6';

import { useTranslate } from '@/hooks/useTranslate';
import { useHaybondFlexStore } from '@/stores/haybond/useHaybondFlexStore';

export const HaybondFlexibleConfirmBuySuccess = () => {
    const trans = useTranslate();
    const router = useRouter();
    const { dataBuyingSuccess, resetForm, resetBuyFlow } = useHaybondFlexStore();

    const handleClose = () => {
        resetForm();
        resetBuyFlow();
    };

    const handleToDetail = () => {
        if (dataBuyingSuccess.order_id) {
            router.push(
                `/haybond/lich-su-dat-lenh-flexible/chi-tiet?id=${dataBuyingSuccess.order_id}`,
            );
        }
        handleClose();
    };

    return (
        <div className="flex flex-col items-center gap-6 py-4 text-center">
            <FaCircleCheck size={140} className="text-green" aria-label="success" />
            <h3 className="font-heading-4 text-primary">{trans.haybond.confirm_success}</h3>
            <p className="font-body-1 text-primary">{trans.haybond.order_received}</p>
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
                    onClick={handleToDetail}
                    className="bg-highlight text-quaternary font-body-3-highlight w-full rounded-full px-4 py-2"
                >
                    {trans.haybond.view_order}
                </button>
            </div>
        </div>
    );
};
