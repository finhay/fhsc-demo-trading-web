'use client';

import { useMemo } from 'react';

import { COMPANY_TYPE } from '@/constants/stock-info';
import { useTranslate } from '@/hooks/useTranslate';
import type { FinanceOverviewData } from '@/types/datafeed/finance';
import { formatNumberVN } from '@/utils/format';

type StockOverviewValuationProps = {
    overview: FinanceOverviewData | null;
    companyType?: string;
};

type ValuationMetric = {
    labelKey: 'metric_pe' | 'metric_pb' | 'metric_ev_ebitda';
    value: number;
    industry: number;
    badgeLabel?: string;
    badgeValue?: number;
};

export const StockOverviewValuation = ({ overview, companyType }: StockOverviewValuationProps) => {
    const trans = useTranslate();
    const t = trans.stockInfo.finance_overview;

    const metrics = useMemo<ValuationMetric[]>(() => {
        if (!overview) return [];
        return [
            {
                labelKey: 'metric_pe',
                value: overview.pe,
                industry: overview.industry.pe,
                badgeLabel: t.metric_eps,
                badgeValue: overview.eps,
            },
            {
                labelKey: 'metric_pb',
                value: overview.pb,
                industry: overview.industry.pb,
            },
            ...(companyType === COMPANY_TYPE.NON_FINANCIAL
                ? [
                      {
                          labelKey: 'metric_ev_ebitda' as const,
                          value: overview.ev_ebitda,
                          industry: overview.industry.ev_ebitda,
                      },
                  ]
                : []),
        ];
    }, [overview, t, companyType]);

    return (
        <article className="flex flex-col gap-3">
            <h2 className="font-body-3-highlight text-primary">{t.valuation_title}</h2>
            {!overview ? (
                <p className="font-caption text-tertiary">{trans.stockInfo.finance_report.empty}</p>
            ) : (
                <div className="flex w-full gap-3">
                    {metrics.map((metric) => (
                        <div
                            key={metric.labelKey}
                            className="flex flex-1 items-start justify-between gap-4 rounded-xl border border-quaternary p-3"
                        >
                            <div className="flex min-w-0 flex-col gap-1">
                                <span className="font-body-3 text-secondary">
                                    {t[metric.labelKey]}
                                </span>
                                <div className="flex flex-col gap-2">
                                    <span className="font-body-3-highlight text-primary">
                                        {formatNumberVN(metric.value, { decimals: 2 })}
                                    </span>
                                    <span className="font-caption text-tertiary">
                                        {t.industry_avg}:{' '}
                                        <span className="text-orange">
                                            {formatNumberVN(metric.industry, { decimals: 2 })}
                                        </span>
                                    </span>
                                </div>
                            </div>
                            {metric.badgeLabel && metric.badgeValue != null && (
                                <span className="flex shrink-0 items-center gap-1 rounded-full bg-tertiary px-2 py-1">
                                    <span className="font-caption text-secondary">
                                        {metric.badgeLabel}:
                                    </span>
                                    <span className="font-caption-highlight text-primary">
                                        {formatNumberVN(metric.badgeValue, { decimals: 0 })}
                                    </span>
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </article>
    );
};
