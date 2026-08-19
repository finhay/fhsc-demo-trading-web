'use client';

import { useEffect, useMemo, useRef } from 'react';

import { AnalysisSection } from '@/components/common/stock-info/finance/analysis/common/AnalysisSection';
import {
    ANALYSIS_CHART_CANVAS,
    ANALYSIS_CHART_FILL,
    ANALYSIS_CONTENT_CARD,
    BILLION,
    CHART_LINE_COLORS,
    FINANCE_ANALYSIS_LABELS,
    NET_REVENUE_FIELD,
    NON_FINANCIAL_MARGIN_ITEMS,
} from '@/constants/stock-info';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import type { FinancialStatementRow } from '@/types/datafeed/finance';
import { formatNumberVN, formatPeriodMMYYYY } from '@/utils/format';
import { sortByYearAsc } from '@/utils/stock-info';

export const NonFinancialMargin = ({
    dataQuarterly,
    incomeData,
}: {
    dataQuarterly: any;
    incomeData: FinancialStatementRow[];
}) => {
    const fa = FINANCE_ANALYSIS_LABELS as Record<string, string>;
    const latest = dataQuarterly?.[0] ?? {};
    const sortedIncome = sortByYearAsc(incomeData);
    const latestIncome = sortedIncome[sortedIncome.length - 1] ?? {};
    const netRevenue = (Number(latestIncome?.[NET_REVENUE_FIELD]) || 0) / BILLION;

    const marginItems = NON_FINANCIAL_MARGIN_ITEMS.map((item) => ({
        ...item,
        value: Number(latest?.[item.field]) * 100 || 0,
    }));

    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useEChartsInstance(chartRef);

    const chartOptions = useMemo(() => {
        const sorted = sortByYearAsc(incomeData);
        const categories = sorted.map((d: any) => formatPeriodMMYYYY(d));
        const seriesData = sorted.map((d: any) => (Number(d?.[NET_REVENUE_FIELD]) || 0) / BILLION);
        const first = seriesData[0] ?? 0;
        const last = seriesData[seriesData.length - 1] ?? 0;
        const lineColor = first < last ? CHART_LINE_COLORS.green : CHART_LINE_COLORS.red;

        return {
            animation: false,
            backgroundColor: 'transparent',
            grid: { top: 8, right: 8, bottom: 28, left: 8, containLabel: false },
            tooltip: {
                trigger: 'axis',
                renderMode: 'html',
                backgroundColor: '#28292b',
                borderWidth: 0,
                padding: 8,
                formatter: (params: any) => {
                    const p = Array.isArray(params) ? params[0] : params;
                    return `<div class="flex flex-col gap-0.5"><span class="font-caption text-secondary">${p?.axisValue ?? ''}</span><span class="font-caption-highlight text-primary">${formatNumberVN(Number(p?.value ?? 0))}</span></div>`;
                },
            },
            xAxis: {
                type: 'category' as const,
                data: categories,
                boundaryGap: false,
                offset: 10,
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: {
                    color: '#666666',
                    fontSize: 11,
                    interval: Math.max(0, Math.ceil(categories.length / 5) - 1),
                },
            },
            yAxis: {
                type: 'value' as const,
                splitNumber: 4,
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { show: false },
                axisLabel: {
                    color: '#666666',
                    fontSize: 11,
                    align: 'left' as const,
                    margin: 30,
                    formatter: (v: number) =>
                        Math.abs(v) >= 1000
                            ? `${formatNumberVN(v / 1000, { trimTrailingZeros: true })}k`
                            : formatNumberVN(v, { trimTrailingZeros: true }),
                },
            },
            series: [
                {
                    type: 'line' as const,
                    data: seriesData,
                    symbol: 'none' as const,
                    showSymbol: false,
                    smooth: true,
                    lineStyle: { color: lineColor, width: 2 },
                    itemStyle: { color: lineColor },
                },
            ],
        };
    }, [incomeData]);

    useEffect(() => {
        chartInstanceRef.current?.setOption(chartOptions, { notMerge: true });
        requestAnimationFrame(() => chartInstanceRef.current?.resize());
    }, [chartOptions, chartInstanceRef]);

    return (
        <AnalysisSection
            title={'Biên lợi nhuận thế nào?'}
            right={
                <span className="shrink-0 rounded-full border border-tertiary px-2 py-1 font-body-3 text-primary">
                    {'QoQ'}
                </span>
            }
        >
            <div className={ANALYSIS_CONTENT_CARD}>
                <div className="flex shrink-0 items-center gap-3">
                    <p className="font-body-3 text-secondary">{'Doanh thu thuần'}</p>
                    <p className="font-body-2-highlight text-primary">
                        {formatNumberVN(netRevenue, {
                            trimTrailingZeros: true,
                        })}{' '}
                        {'tỷ'}
                    </p>
                </div>
                <div className={ANALYSIS_CHART_FILL}>
                    <div ref={chartRef} className={ANALYSIS_CHART_CANVAS} aria-hidden />
                </div>
            </div>
            <div className="flex shrink-0 flex-row items-end gap-3 rounded-xl border border-quaternary p-3">
                {marginItems.map((item) => (
                    <div key={item.labelKey} className="flex min-w-0 flex-1 flex-col gap-1">
                        <p className="font-body-3 text-secondary">{fa[item.labelKey]}</p>
                        <p className="font-body-2-highlight text-primary">
                            {formatNumberVN(item.value)}%
                        </p>
                    </div>
                ))}
            </div>
        </AnalysisSection>
    );
};
