'use client';

import { useMemo } from 'react';

import { COMPANY_TYPE } from '@/constants/stock-info';
import type { FinanceOverviewData } from '@/types/datafeed/finance';
import { formatNumberVN } from '@/utils/format';

const STOCK_INFO_FINANCE_OVERVIEW = {
    section_aria: 'Tổng quan định giá và chỉ số',
    quick_valuation: 'Định giá nhanh',
    valuation_title: 'Định giá',
    industry_avg: 'TB ngành',
    metric_pe: 'P/E',
    metric_pb: 'P/B',
    metric_ev_ebitda: 'EV/EBITDA',
    gross_margin: 'Biên lãi gộp',
    dividend_pct: '% Cổ tức',
    metric_eps: 'EPS',
    business_trend_title: 'Xu hướng kinh doanh',
    net_revenue: 'Doanh thu thuần',
    profit_after_tax: 'Lợi nhuận sau thuế',
    unit_thousand_bn: 'Đơn vị: nghìn tỷ đồng',
    company_intro_aria: 'Giới thiệu doanh nghiệp',
    no_company_info: 'Không có thông tin về mã cổ phiếu',
};

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
    const t = STOCK_INFO_FINANCE_OVERVIEW;

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
                <p className="font-caption text-tertiary">{'Chưa có dữ liệu'}</p>
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
