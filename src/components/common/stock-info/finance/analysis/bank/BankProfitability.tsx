'use client';

import { useEffect, useMemo, useRef } from 'react';

import { AnalysisSection } from '@/components/common/stock-info/finance/analysis/common/AnalysisSection';
import {
    ANALYSIS_CONTENT_CARD,
    FINANCE_ANALYSIS_LABELS,
    PROFITABILITY,
    PROFITABILITY_SERIES_COLORS,
} from '@/constants/stock-info';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import { getChangeColor } from '@/utils/common';
import { formatNumberVN, formatPeriodMMYYYY } from '@/utils/format';
import { appendPercentTooltip, sortByYearAsc } from '@/utils/stock-info';

export const BankProfitability = ({ dataAnnual }: { dataAnnual: any }) => {
    const fa = FINANCE_ANALYSIS_LABELS as Record<string, string>;
    const profitabilityItems = useMemo(() => {
        const sorted = sortByYearAsc(dataAnnual);
        const data = dataAnnual?.[0] ?? {};
        return PROFITABILITY.items
            .filter((item) => item.key !== 'roic')
            .map((item, index) => {
                const value = (Number(data?.[item.key]) || 0) * 100;
                const first = Number(sorted[0]?.[item.key]) || 0;
                const last = Number(sorted[sorted.length - 1]?.[item.key]) || 0;
                return {
                    ...item,
                    ...(PROFITABILITY_SERIES_COLORS[index] ?? PROFITABILITY_SERIES_COLORS[0]),
                    value,
                    valueColor: getChangeColor(last - first),
                };
            });
    }, [dataAnnual]);

    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useEChartsInstance(chartRef);

    const chartOptions = useMemo(() => {
        const sorted = sortByYearAsc(dataAnnual);
        const categories = sorted.map((d: any) => formatPeriodMMYYYY(d));
        const series = profitabilityItems.map((item) => ({
            type: 'line' as const,
            name: fa[item.labelKey],
            data: sorted.map((d: any) => (Number(d?.[item.key]) || 0) * 100),
            symbol: 'none' as const,
            showSymbol: false,
            smooth: true,
            lineStyle: { color: item.lineColor, width: 2 },
            itemStyle: { color: item.lineColor },
        }));

        const base = {
            animation: false,
            backgroundColor: 'transparent',
            grid: { top: 8, right: 8, bottom: 28, left: 8, containLabel: true },
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
            series,
        };

        return appendPercentTooltip(
            base,
            profitabilityItems.map((it) => ({ label: fa[it.labelKey], dotColor: it.dotColor })),
        );
    }, [dataAnnual, fa, profitabilityItems]);

    useEffect(() => {
        chartInstanceRef.current?.setOption(chartOptions, { notMerge: true });
        requestAnimationFrame(() => chartInstanceRef.current?.resize());
    }, [chartOptions, chartInstanceRef]);

    return (
        <AnalysisSection title={fa.profitability_question}>
            <div className={ANALYSIS_CONTENT_CARD}>
                <div className="grid w-full shrink-0 grid-cols-3 items-center gap-4">
                    {profitabilityItems.map((item) => (
                        <div key={item.labelKey} className="flex items-center gap-1">
                            <div className="flex items-center gap-2">
                                <span
                                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${item.dotColor}`}
                                    aria-hidden
                                />
                                <span className="body-5 text-secondary">
                                    {fa[item.labelKey]}
                                </span>
                            </div>
                            <span className={`body-4-highlight ${item.valueColor}`}>
                                {formatNumberVN(item.value)}%
                            </span>
                        </div>
                    ))}
                </div>
                <div ref={chartRef} className="h-44 w-full shrink-0" />
            </div>
        </AnalysisSection>
    );
};
