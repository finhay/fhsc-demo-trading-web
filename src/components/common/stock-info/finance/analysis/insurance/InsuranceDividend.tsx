'use client';

import { useEffect, useMemo, useRef } from 'react';

import { AnalysisSection } from '@/components/common/stock-info/finance/analysis/common/AnalysisSection';
import { ANALYSIS_CONTENT_CARD, CHART_LINE_COLORS } from '@/constants/stock-info';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import { formatNumberVN, formatPeriodMMYYYY } from '@/utils/format';
import { sortByYearAsc } from '@/utils/stock-info';

export const InsuranceDividend = ({ dataAnnual }: { dataAnnual: any }) => {
    const data = dataAnnual?.[0] ?? {};

    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useEChartsInstance(chartRef);

    const chartOptions = useMemo(() => {
        const sorted = sortByYearAsc(dataAnnual);
        const categories = sorted.map((d: any) => formatPeriodMMYYYY(d));
        const seriesData = sorted.map((d: any) => (Number(d?.tysuatcotuc) || 0) * 100);
        const first = seriesData[0] ?? 0;
        const last = seriesData[seriesData.length - 1] ?? 0;
        const lineColor = first < last ? CHART_LINE_COLORS.green : CHART_LINE_COLORS.red;

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
                    return `<div class="flex flex-col gap-0.5"><span class="body-5 text-secondary">${p?.axisValue ?? ''}</span><span class="body-5-highlight text-primary">${formatNumberVN(Number(p?.value ?? 0))}%</span></div>`;
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
                    formatter: (v: number) => `${formatNumberVN(v, { trimTrailingZeros: true })}%`,
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
    }, [dataAnnual]);

    useEffect(() => {
        chartInstanceRef.current?.setOption(chartOptions, { notMerge: true });
        requestAnimationFrame(() => chartInstanceRef.current?.resize());
    }, [chartOptions, chartInstanceRef]);

    return (
        <AnalysisSection title={'Cổ tức trả thế nào?'}>
            <div className={ANALYSIS_CONTENT_CARD}>
                <div className="flex w-full shrink-0 items-center justify-between gap-2 whitespace-nowrap">
                    <span className="body-3-highlight text-green">
                        {data.tysuatcotuc ? `${formatNumberVN(data.tysuatcotuc * 100)}%` : '--'}
                    </span>
                    <p className="body-4 text-tertiary">
                        {'TB 3 năm:'}{' '}
                        <span className="body-4-highlight text-primary">
                            {data.bq_tysuatcotuc ? `${formatNumberVN(data.bq_tysuatcotuc)}%` : '--'}
                        </span>
                    </p>
                </div>
                <div ref={chartRef} className="h-44 w-full shrink-0" />
            </div>
        </AnalysisSection>
    );
};
