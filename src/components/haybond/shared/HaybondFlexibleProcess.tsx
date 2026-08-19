'use client';

import { FaRegCircle } from 'react-icons/fa6';

import { useTranslate } from '@/hooks/useTranslate';
import { useHaybondFlexStore } from '@/stores/haybond/useHaybondFlexStore';

export const HaybondFlexibleProcess = () => {
    const trans = useTranslate();
    const { dataCashFlow } = useHaybondFlexStore();

    return (
        <div className="flex flex-col gap-3">
            <p className="font-body-3-highlight text-secondary">{trans.haybond.receive_process}</p>
            <div className="bg-tertiary flex items-center justify-between rounded-xl px-3 py-2">
                <span className="font-body-3 text-secondary">
                    {trans.haybond.proceeds_after_sell}
                </span>
                <span className="font-body-3-highlight text-primary">
                    {dataCashFlow.receiveSellAmountDisplay}
                </span>
            </div>
            <div className="bg-tertiary flex gap-3 rounded-xl p-3">
                <div className="flex flex-col items-center">
                    {dataCashFlow.cashFlows.map((_, index) => (
                        <div key={`line-${index}`} className="flex flex-col items-center">
                            <FaRegCircle size={16} className="text-green" />
                            {index < dataCashFlow.cashFlows.length - 1 && (
                                <div className="bg-green my-1 h-14 w-0.5" />
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex flex-1 flex-col gap-2">
                    {dataCashFlow.cashFlows.map((item, index) => (
                        <div
                            key={`item-${index}`}
                            className="flex items-start justify-between gap-2"
                        >
                            <div className="flex flex-col gap-1">
                                <span className="font-body-3-highlight text-primary">
                                    {item.title}
                                </span>
                                <span className="font-body-3 text-secondary">{item.date}</span>
                                <span className="font-caption text-secondary">
                                    {item.description}
                                </span>
                            </div>
                            <span className="font-body-3-highlight text-green shrink-0">
                                {item.amountDisplay}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
