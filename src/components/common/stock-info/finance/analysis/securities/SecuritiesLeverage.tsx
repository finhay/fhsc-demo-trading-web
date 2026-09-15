'use client';

import { useEffect, useMemo, useRef } from 'react';

import { AnalysisSection } from '@/components/common/stock-info/finance/analysis/common/AnalysisSection';
import { ANALYSIS_CONTENT_CARD, FINANCE_ANALYSIS_LABELS } from '@/constants/stock-info';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import { formatNumberVN, formatPeriodMMYYYY } from '@/utils/format';
import { sortByYearAsc, trendColor } from '@/utils/stock-info';

export const SecuritiesLeverage = ({ dataQuarterly }: { dataQuarterly: any }) => {
    const fa = FINANCE_ANALYSIS_LABELS as Record<string, string>;
    const latestQuarterly = dataQuarterly?.[0] ?? {};

    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useEChartsInstance(chartRef);

    const chartOptions = useMemo(() => {
        const sorted = sortByYearAsc(dataQuarterly);
        const categories = sorted.map((d: any) => formatPeriodMMYYYY(d));
        const seriesData = sorted.map((d: any) => Number(d?.tilechovaykq ?? 0));
        const lineColor = trendColor(seriesData);

        return {
            animation: false,
            backgroundColor: 'transparent',
            grid: { top: 8, right: 8, bottom: 28, left: 8, containLabel: true },
            tooltip: {
                trigger: 'axis' as const,
                renderMode: 'html' as const,
                backgroundColor: '#28292b',
                borderWidth: 0,
                padding: 8,
                formatter: (params: any) => {
                    const p = Array.isArray(params) ? params[0] : params;
                    return `<div class="flex flex-col gap-0.5"><span class="body-5 text-secondary">${p?.axisValue ?? ''}</span><span class="body-5-highlight text-primary">${formatNumberVN(Number(p?.value ?? 0))}x</span></div>`;
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
                    formatter: (v: number) => formatNumberVN(v, { trimTrailingZeros: true }),
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
    }, [dataQuarterly]);

    useEffect(() => {
        chartInstanceRef.current?.setOption(chartOptions, { notMerge: true });
        requestAnimationFrame(() => chartInstanceRef.current?.resize());
    }, [chartOptions, chartInstanceRef]);

    const stats = [
        { labelKey: 'de_ratio', value: formatNumberVN(latestQuarterly?.nophaitra_vcsh) },
        {
            labelKey: 'debt_to_assets',
            value: `${formatNumberVN(latestQuarterly?.tongno_tongtaisan * 100)}%`,
        },
        {
            labelKey: 'equity_coefficient',
            value: `${formatNumberVN(latestQuarterly?.vcsh_nguonvon * 100)}%`,
        },
    ];

    return (
        <AnalysisSection
            title={'Đòn bẩy margin có an toàn không?'}
            right={
                <span className="shrink-0 rounded-full border border-tertiary px-2 py-1 body-4 text-primary">
                    {'QoQ'}
                </span>
            }
        >
            <div className={ANALYSIS_CONTENT_CARD}>
                <div className="flex shrink-0 flex-col gap-0.5">
                    <p className="body-4 text-secondary">{'Cho vay KQ/VCSH'}</p>
                    <p className="body-3-highlight text-primary">
                        {formatNumberVN(latestQuarterly?.tilechovaykq)}x
                    </p>
                </div>
                <div ref={chartRef} className="h-44 w-full shrink-0" aria-hidden />
            </div>
            <div className="flex shrink-0 gap-3">
                {stats.map((s) => (
                    <div
                        key={s.labelKey}
                        className="flex min-w-0 flex-1 flex-col gap-1 rounded-xl border border-quaternary p-3"
                    >
                        <span className="body-4 text-secondary">{fa[s.labelKey]}</span>
                        <span className="body-3-highlight text-primary">{s.value}</span>
                    </div>
                ))}
            </div>
        </AnalysisSection>
    );
};
