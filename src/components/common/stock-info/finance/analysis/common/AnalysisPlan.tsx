'use client';

import { useTranslate } from '@/hooks/useTranslate';
import type { PlanItem } from '@/types/pages/stock-info';
import { formatNumberVN } from '@/utils/format';

type Props = {
    items: PlanItem[];
    title?: string;
};

export const AnalysisPlan = ({ items, title }: Props) => {
    const trans = useTranslate();
    const fa = trans.stockInfo.finance_analysis as Record<string, string>;
    const resolvedTitle = title ?? fa.plan_completion_pct;

    return (
        <div className="flex flex-col gap-1">
            <p className="font-caption-highlight text-secondary">{resolvedTitle}</p>
            <div className="flex gap-8">
                {items.map((item) => (
                    <div key={item.labelKey} className="flex flex-1 flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                            <span className="font-body-3 text-secondary">{fa[item.labelKey]}</span>
                            <span className={`shrink-0 font-body-3-highlight ${item.textColor}`}>
                                {item.isZero ? '--' : `${formatNumberVN(item.value)}%`}
                            </span>
                        </div>
                        <div className="relative h-1.5 w-full rounded-full">
                            <div
                                className={`absolute inset-0 rounded-full ${item.bgColor} opacity-20`}
                                aria-hidden
                            />
                            <div
                                className="absolute inset-y-0 left-0 overflow-hidden rounded-full"
                                style={{ width: `${Math.min(item.value, 100)}%` }}
                                aria-hidden
                            >
                                <div
                                    className={`absolute inset-0 min-w-full rounded-full ${item.bgColor}`}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
