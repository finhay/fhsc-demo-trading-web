'use client';

import { FaArrowRight, FaCircleInfo } from 'react-icons/fa6';

import { Tooltip } from '@/components/common/ui/Tooltip';
import { TERM_BUY_FLOW_STEPS } from '@/constants/haybond';
import { useTranslate } from '@/hooks/useTranslate';
import { useHaybondStore } from '@/stores/haybond/useHaybondStore';
import { formatDate, formatNumberVN } from '@/utils/format';

export const HaybondConfirmBuy = () => {
    const trans = useTranslate();
    const { termBuyData, setBuyStep: setStep } = useHaybondStore();
    const { estimateInfo, bondAmount, agreementData, start, contract } = termBuyData;
    const buyAgreement = agreementData.find((item) => item.order_side === 'BUY');

    return (
        <div className="flex flex-col gap-4">
            <div className="bg-secondary flex flex-col gap-6 rounded p-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1">
                        <span className="font-body-3 text-secondary">
                            {trans.haybond.initial_amount}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="font-body-3-highlight text-primary">
                            {`${formatNumberVN(bondAmount || 0, { decimals: 0 })}${trans.haybond.currency_unit}`}
                        </span>
                    </div>
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
                    <div className="flex items-center gap-1">
                        <span className="font-body-3-highlight text-primary">
                            {`${formatNumberVN(buyAgreement?.amount || 0, { decimals: 0 })}${trans.haybond.currency_unit}`}
                        </span>
                    </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1">
                        <span className="font-body-3 text-secondary">
                            {trans.haybond.total_est_profit}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="font-body-3-highlight text-primary">
                            {`${formatNumberVN(estimateInfo.estimated_profit, { decimals: 0 })}${trans.haybond.currency_unit}`}
                        </span>
                    </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1">
                        <span className="font-body-3 text-secondary">
                            {trans.haybond.trade_fee}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="font-body-3-highlight text-primary">
                            {`${formatNumberVN(estimateInfo.fee, { decimals: 0 })}${trans.haybond.currency_unit}`}
                        </span>
                    </div>
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
                    <div className="flex items-center gap-1">
                        <span className="font-body-3-highlight text-primary">
                            {`${formatNumberVN(buyAgreement?.net_amount || 0, { decimals: 0 })}${trans.haybond.currency_unit}`}
                        </span>
                    </div>
                </div>
                <span className="font-body-3 text-secondary">
                    {trans.haybond.profit_starts_from} {formatDate(start)}
                </span>
            </div>
            <button
                type="button"
                className="flex cursor-pointer items-center gap-2"
                onClick={() => setStep(TERM_BUY_FLOW_STEPS.LIST_COMMAND)}
            >
                <span className="font-body-3 text-blue">{trans.haybond.ticket_detail}</span>
                <FaArrowRight size={14} className="text-blue" />
            </button>
            <div className="font-caption text-secondary flex flex-wrap items-center gap-1">
                <span>{trans.haybond.terms_accepted}</span>
                {!contract.signed && (
                    <a
                        href={contract.pathFile}
                        target="_blank"
                        rel="noreferrer"
                        className="text-highlight underline"
                    >
                        {trans.haybond.terms_and_conditions}
                    </a>
                )}
            </div>
            <button
                type="button"
                onClick={() => setStep(TERM_BUY_FLOW_STEPS.OTP)}
                className="bg-highlight text-quaternary font-body-2-highlight w-full rounded-full px-4 py-2"
            >
                {trans.haybond.confirm}
            </button>
        </div>
    );
};
