'use client';

import { useEffect, useState } from 'react';

import { FaArrowRight, FaCircleInfo, FaRegSquare, FaSquareCheck } from 'react-icons/fa6';

import { Tooltip } from '@/components/common/ui/Tooltip';
import { FLEXIBLE_BUY_FLOW_STEPS } from '@/constants/haybond';
import { toast } from '@/hooks/lib/useToast';
import { useTranslate } from '@/hooks/useTranslate';
import { useHaybondFlexStore } from '@/stores/haybond/useHaybondFlexStore';
import { formatDate, formatNumberVN } from '@/utils/format';

export const HaybondFlexibleConfirmBuy = () => {
    const trans = useTranslate();
    const [disabled, setDisabled] = useState(true);
    const {
        bondDynamicAmount,
        dataPreview,
        acceptTC,
        setAcceptTC,
        setBuyStep: setStep,
    } = useHaybondFlexStore();
    const { estimateInfo, agreementData, start } = dataPreview;
    const buyAgreement = agreementData.find((item) => item.order_side === 'BUY');

    const handleConfirm = () => {
        if (disabled) return;
        if (!acceptTC && !dataPreview.has_accepted_tc) {
            toast.error(trans.haybond.must_accept_terms);
            return;
        }
        setStep(FLEXIBLE_BUY_FLOW_STEPS.OTP);
    };

    useEffect(() => {
        if (dataPreview.has_accepted_tc) {
            setAcceptTC(true);
        }
    }, [dataPreview.has_accepted_tc]);

    useEffect(() => {
        setDisabled(!acceptTC && !dataPreview.has_accepted_tc);
    }, [acceptTC, dataPreview.has_accepted_tc]);

    return (
        <div className="flex flex-col gap-4">
            <div className="bg-secondary flex flex-col gap-6 rounded p-3">
                <div className="flex items-center justify-between gap-3">
                    <span className="font-body-3 text-secondary shrink-0">
                        {trans.haybond.buy_amount}
                    </span>
                    <span className="font-body-3-highlight text-primary text-right">
                        {`${formatNumberVN(bondDynamicAmount, { decimals: 0 })}${trans.haybond.currency_unit}`}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1">
                        <span className="font-body-3 text-secondary">
                            {trans.haybond.actual_buy_amount}
                        </span>
                        <Tooltip
                            variant="light"
                            content={
                                <div className="flex max-w-xs flex-col gap-1 p-1">
                                    <span className="font-body-3-highlight text-quaternary">
                                        {trans.haybond.amount_info.title}
                                    </span>
                                    <span className="font-caption text-quaternary whitespace-pre-line">
                                        {`${trans.haybond.amount_info.content.detail_1}\n${trans.haybond.amount_info.content.detail_2}`}
                                    </span>
                                </div>
                            }
                        >
                            <FaCircleInfo size={16} className="text-secondary cursor-pointer" />
                        </Tooltip>
                    </div>
                    <span className="font-body-3-highlight text-primary">
                        {`${formatNumberVN(buyAgreement?.amount || 0, { decimals: 0 })}${trans.haybond.currency_unit}`}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                    <span className="font-body-3 text-secondary shrink-0">
                        {trans.haybond.trade_fee}
                    </span>
                    <span className="font-body-3-highlight text-primary text-right">
                        {`${formatNumberVN(estimateInfo.fee, { decimals: 0 })}${trans.haybond.currency_unit}`}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1">
                        <span className="font-body-3 text-secondary">
                            {trans.haybond.payment_due}
                        </span>
                        <Tooltip
                            variant="light"
                            content={
                                <div className="flex max-w-xs flex-col gap-1 p-1">
                                    <span className="font-body-3-highlight text-quaternary">
                                        {trans.haybond.payment.title}
                                    </span>
                                    <span className="font-caption text-quaternary whitespace-pre-line">
                                        {`${trans.haybond.payment.content.detail_1}\n${trans.haybond.payment.content.detail_2}`}
                                    </span>
                                </div>
                            }
                        >
                            <FaCircleInfo size={16} className="text-secondary cursor-pointer" />
                        </Tooltip>
                    </div>
                    <span className="font-body-1-highlight text-green">
                        {`${formatNumberVN(buyAgreement?.net_amount || 0, { decimals: 0 })}${trans.haybond.currency_unit}`}
                    </span>
                </div>
                <span className="font-body-3 text-secondary">
                    {trans.haybond.profit_starts_from} {formatDate(start)}
                </span>
            </div>
            {!dataPreview.has_accepted_tc && (
                <div className="flex items-start gap-2">
                    <button
                        type="button"
                        className={`mt-0.5 shrink-0 cursor-pointer ${acceptTC ? 'text-highlight' : 'text-primary'}`}
                        onClick={() => setAcceptTC(!acceptTC)}
                    >
                        {acceptTC ? <FaSquareCheck size={18} /> : <FaRegSquare size={18} />}
                    </button>
                    <div className="font-caption text-secondary flex flex-wrap gap-1">
                        <span className="cursor-pointer" onClick={() => setAcceptTC(!acceptTC)}>
                            {trans.haybond.accept_terms_under}
                        </span>
                        <a
                            href={dataPreview.contract.path_file}
                            target="_blank"
                            rel="noreferrer"
                            className="text-highlight underline"
                        >
                            {trans.haybond.terms_and_conditions}
                        </a>
                    </div>
                </div>
            )}
            <button
                type="button"
                className="flex cursor-pointer items-center gap-2"
                onClick={() => setStep(FLEXIBLE_BUY_FLOW_STEPS.LIST_COMMAND)}
            >
                <span className="font-body-3 text-blue">{trans.haybond.ticket_detail}</span>
                <FaArrowRight size={14} className="text-blue" />
            </button>
            <button
                type="button"
                disabled={disabled}
                onClick={handleConfirm}
                className={`font-body-2-highlight w-full rounded-full px-4 py-2 ${
                    disabled
                        ? 'bg-disabled text-disabled cursor-not-allowed'
                        : 'bg-highlight text-quaternary'
                }`}
            >
                {trans.haybond.confirm}
            </button>
        </div>
    );
};
