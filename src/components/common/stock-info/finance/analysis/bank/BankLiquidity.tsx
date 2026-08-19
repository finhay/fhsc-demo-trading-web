'use client';

import { useEffect, useMemo, useRef } from 'react';

import { AnalysisSection } from '@/components/common/stock-info/finance/analysis/common/AnalysisSection';
import {
    ANALYSIS_CHART_CANVAS,
    ANALYSIS_CHART_FILL,
    ANALYSIS_CONTENT_CARD,
    BANK_LIQUIDITY_METRICS,
    CHART_LINE_COLORS,
    FINANCE_ANALYSIS_LABELS,
} from '@/constants/stock-info';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import { formatNumberVN, formatPeriodMMYYYY } from '@/utils/format';
import { getValueClass, sortByYearAsc } from '@/utils/stock-info';

export const BankLiquidity = ({ dataAnnual }: { dataAnnual: any }) => {
    const fa = FINANCE_ANALYSIS_LABELS as Record<string, string>;
    const latest = dataAnnual?.[0] ?? {};

    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useEChartsInstance(chartRef);

    const chartOptions = useMemo(() => {
        const sorted = sortByYearAsc(dataAnnual);
        const categories = sorted.map((d: any) => formatPeriodMMYYYY(d));
        const seriesData = sorted.map((d: any) => Number(d?.tile_casa ?? 0) * 100);
        const first = seriesData[0] ?? 0;
        const last = seriesData[seriesData.length - 1] ?? 0;
        const lineColor = first > last ? CHART_LINE_COLORS.redSoft : CHART_LINE_COLORS.green;

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
                    return `<div class="flex flex-col gap-0.5"><span class="font-caption text-secondary">${p?.axisValue ?? ''}</span><span class="font-caption-highlight text-primary">${formatNumberVN(Number(p?.value ?? 0))}%</span></div>`;
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
                splitNumber: 3,
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

    const casaValue = Number(latest?.tile_casa ?? 0) * 100;

    return (
        <AnalysisSection
            title={'Thanh khoản & vốn có an toàn?'}
            right={
                <span className="shrink-0 rounded-full border border-tertiary px-2 py-1 font-body-3 text-primary">
                    {'QoQ'}
                </span>
            }
        >
            <div className={ANALYSIS_CONTENT_CARD}>
                <div className="flex min-h-0 flex-1 flex-col gap-1">
                    <div className="flex shrink-0 flex-col">
                        <p className="font-body-3 text-secondary">{'CASA'}</p>
                        <p className={`font-body-2-highlight ${getValueClass(casaValue, true)}`}>
                            {formatNumberVN(casaValue)}%
                        </p>
                    </div>
                    <div className={ANALYSIS_CHART_FILL}>
                        <div ref={chartRef} className={ANALYSIS_CHART_CANVAS} aria-hidden />
                    </div>
                </div>
                <div className="h-px w-full shrink-0 bg-tertiary" />
                <div className="flex shrink-0 gap-4">
                    {BANK_LIQUIDITY_METRICS.map(({ labelKey, field }) => {
                        const v = Number(latest?.[field] ?? 0) * 100;
                        return (
                            <div key={labelKey} className="flex min-w-0 flex-1 flex-col gap-1">
                                <p className="font-body-3 text-secondary">{fa[labelKey]}</p>
                                <p className={`font-body-2-highlight ${getValueClass(v, true)}`}>
                                    {formatNumberVN(v, { trimTrailingZeros: true })}%
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AnalysisSection>
    );
};
