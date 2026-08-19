'use client';

import { FaArrowRight } from 'react-icons/fa6';

import { FLEXIBLE_SELL_FLOW_STEPS } from '@/constants/haybond';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { getHayBondDynamicCashFlow } from '@/services/api/bond-enterprise/orders';
import { useHaybondFlexStore } from '@/stores/haybond/useHaybondFlexStore';
import { getApiErrorMessage, isSuccessApi } from '@/utils/common';
import { formatNumberVN } from '@/utils/format';

export const HaybondFlexibleConfirmSell = () => {
    const trans = useTranslate();
    const {
        setIsOverlayLoading,
        dataSellPreview,
        bondDynamicSellAmount,
        setDataCashFlow,
        setSellStep: setStep,
    } = useHaybondFlexStore();
    const {
        fee_sell_amount,
        receive_sell_amount,
        tax_sell_amount,
        is_selling_all,
        total_coupon_received,
    } = dataSellPreview;

    const handleOpenProcess = async () => {
        setIsOverlayLoading(true);
        try {
            const { data, error_code, message } =
                await getHayBondDynamicCashFlow(bondDynamicSellAmount);
            if (isSuccessApi(error_code)) {
                setDataCashFlow({
                    cashFlows: data.cashFlows,
                    receiveSellAmountDisplay: data.receiveSellAmountDisplay,
                });
                setStep(FLEXIBLE_SELL_FLOW_STEPS.PROCESS);
            } else {
                toast.error(message);
            }
        } catch (err) {
            toast.error(getApiErrorMessage(err, trans.haybond.response_message.system_error));
        } finally {
            setIsOverlayLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="bg-secondary flex flex-col gap-6 rounded p-3">
                <div className="flex items-center justify-between gap-3">
                    <span className="font-body-3 text-secondary shrink-0">
                        {trans.haybond.sell_amount}
                    </span>
                    <span className="font-body-3-highlight text-primary text-right">
                        {`${formatNumberVN(bondDynamicSellAmount || 0, { decimals: 0 })}${trans.haybond.currency_unit}`}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                    <span className="font-body-3 text-secondary shrink-0">
                        {trans.haybond.trade_fee}
                    </span>
                    <span className="font-body-3-highlight text-primary text-right">
                        {`${formatNumberVN(Number(fee_sell_amount), { decimals: 0 })}${trans.haybond.currency_unit}`}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                    <span className="font-body-3 text-secondary shrink-0">
                        {trans.haybond.trade_tax}
                    </span>
                    <span className="font-body-3-highlight text-primary text-right">
                        {`${formatNumberVN(Number(tax_sell_amount), { decimals: 0 })}${trans.haybond.currency_unit}`}
                    </span>
                </div>
                {is_selling_all && (
                    <div className="flex items-center justify-between gap-3">
                        <span className="font-body-3 text-secondary shrink-0">
                            {trans.haybond.coupon_deducted}
                        </span>
                        <span className="font-body-3-highlight text-primary text-right">
                            {`${formatNumberVN(total_coupon_received || 0, { decimals: 0 })}${trans.haybond.currency_unit}`}
                        </span>
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <span className="font-body-3 text-secondary">
                        {trans.haybond.actual_received}
                    </span>
                    <span className="font-body-1-highlight text-green">
                        {`${formatNumberVN(receive_sell_amount, { decimals: 0 })}${trans.haybond.currency_unit}`}
                    </span>
                </div>
                {is_selling_all && (
                    <button
                        type="button"
                        className="flex cursor-pointer items-center justify-between"
                        onClick={handleOpenProcess}
                    >
                        <span className="font-body-3 text-secondary">
                            {trans.haybond.view_receive_process}
                        </span>
                        <FaArrowRight size={16} className="text-secondary" />
                    </button>
                )}
            </div>
            <button
                type="button"
                className="flex cursor-pointer items-center gap-2"
                onClick={() => setStep(FLEXIBLE_SELL_FLOW_STEPS.LIST_COMMAND)}
            >
                <span className="font-body-3 text-blue">{trans.haybond.ticket_detail}</span>
                <FaArrowRight size={14} className="text-blue" />
            </button>
            <button
                type="button"
                onClick={() => setStep(FLEXIBLE_SELL_FLOW_STEPS.OTP)}
                className="bg-highlight text-quaternary font-body-3-highlight w-full rounded-full px-4 py-2"
            >
                {trans.haybond.confirm}
            </button>
        </div>
    );
};
