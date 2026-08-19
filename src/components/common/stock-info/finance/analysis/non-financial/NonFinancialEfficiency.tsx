'use client';

import { Fragment } from 'react';

import { AnalysisSection } from '@/components/common/stock-info/finance/analysis/common/AnalysisSection';
import {
    ANALYSIS_CONTENT_CARD,
    FINANCE_ANALYSIS_LABELS,
    NON_FINANCIAL_EFFICIENCY,
} from '@/constants/stock-info';
import { formatNumberVN } from '@/utils/format';

export const NonFinancialEfficiency = ({
    dataAnnual,
    dataQuarterly,
}: {
    dataAnnual: any;
    dataQuarterly: any;
}) => {
    const fa = FINANCE_ANALYSIS_LABELS as Record<string, string>;

    const latest = dataAnnual?.[0] ?? {};
    const quarterlyLatest = dataQuarterly?.[0] ?? {};

    const liquidityItems = NON_FINANCIAL_EFFICIENCY.liquidityItems.map((item) => ({
        ...item,
        value: Number(quarterlyLatest?.[item.field]) || 0,
    }));

    const turnoverItems = NON_FINANCIAL_EFFICIENCY.turnoverItems.map((item) => ({
        ...item,
        value: Number(latest?.[item.field]) || 0,
    }));

    return (
        <AnalysisSection title={'Hoạt động có hiệu quả không?'}>
            <div className={ANALYSIS_CONTENT_CARD}>
                <div className="flex gap-3">
                    {liquidityItems.map((item) => (
                        <div key={item.labelKey} className="flex min-w-0 flex-1 flex-col gap-1">
                            <p className="font-body-3 text-secondary">{fa[item.labelKey]}</p>
                            <div className="flex items-center gap-2">
                                <span className={`font-body-2-highlight ${item.valueColor}`}>
                                    {formatNumberVN(item.value)}
                                </span>
                                <span className="shrink-0 rounded-full border border-tertiary px-2 py-0.5 font-tiny-highlight text-primary">
                                    {item.badge}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="h-px w-full bg-tertiary" />
                <div className="flex flex-col gap-2">
                    <p className="font-body-3-highlight text-secondary">{'Vòng quay'}</p>
                    <div className="flex w-full items-stretch">
                        {turnoverItems.map((item, idx) => (
                            <Fragment key={item.labelKey}>
                                {idx > 0 && (
                                    <span className="my-auto h-px w-3 shrink-0 bg-tertiary" />
                                )}
                                <div className="flex min-w-0 flex-1 flex-col gap-1 rounded-xl border border-tertiary p-3">
                                    <p className="font-body-3 text-secondary">
                                        {fa[item.labelKey]}
                                    </p>
                                    <p className="font-body-2-highlight text-primary">
                                        {formatNumberVN(item.value)}
                                    </p>
                                </div>
                            </Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </AnalysisSection>
    );
};
