'use client';

import { useEffect, useMemo, useRef } from 'react';

import { AnalysisPlan } from '@/components/common/stock-info/finance/analysis/common/AnalysisPlan';
import { AnalysisSection } from '@/components/common/stock-info/finance/analysis/common/AnalysisSection';
import {
    ANALYSIS_CHART_BOX,
    ANALYSIS_CHART_CANVAS,
    ANALYSIS_CONTENT_CARD,
    INSURANCE_GROWTH_ITEMS,
} from '@/constants/stock-info';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import { useTranslate } from '@/hooks/useTranslate';
import { getChangeColor } from '@/utils/common';
import { formatNumberVN, formatPeriodMMYYYY } from '@/utils/format';
import { appendPercentTooltip, pickPlanItems, sortByYearAsc } from '@/utils/stock-info';

export const InsuranceGrowth = ({
    dataAnnual,
    dataQuarterly,
}: {
    dataAnnual: any;
    dataQuarterly: any;
}) => {
    const trans = useTranslate();
    const fa = trans.stockInfo.finance_analysis as Record<string, string>;
    const latestAnnual = dataAnnual?.[0] ?? {};

    const planItems = pickPlanItems(latestAnnual);

    const growthItems = useMemo(() => {
        const sorted = sortByYearAsc(dataQuarterly);
        const latestQuarterly = dataQuarterly?.[0] ?? {};
        return INSURANCE_GROWTH_ITEMS.map((item) => {
            const value = (Number(latestQuarterly?.[item.key]) || 0) * 100;
            const first = Number(sorted[0]?.[item.key]) || 0;
            const last = Number(sorted[sorted.length - 1]?.[item.key]) || 0;
            return {
                ...item,
                value,
                valueColor: getChangeColor(last - first),
            };
        });
    }, [dataQuarterly]);

    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useEChartsInstance(chartRef);

    const chartOptions = useMemo(() => {
        const sorted = sortByYearAsc(dataQuarterly);
        const categories = sorted.map((d: any) => formatPeriodMMYYYY(d));
        const series = growthItems.map((item) => ({
            type: 'line' as const,
            name: fa[item.labelKey],
            data: sorted.map((d: any) => Number(d?.[item.key]) * 100 || 0),
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
            growthItems.map((it) => ({ label: fa[it.labelKey], dotColor: it.dotColor })),
        );
    }, [dataQuarterly, fa, growthItems]);

    useEffect(() => {
        chartInstanceRef.current?.setOption(chartOptions, { notMerge: true });
        requestAnimationFrame(() => chartInstanceRef.current?.resize());
    }, [chartOptions, chartInstanceRef]);

    return (
        <AnalysisSection
            title={fa.growth_question}
            right={
                <span className="shrink-0 rounded-full border border-tertiary px-2 py-1 font-body-3 text-primary">
                    {fa.yoy}
                </span>
            }
        >
            <div className={ANALYSIS_CONTENT_CARD}>
                <div className="flex w-full shrink-0 items-center justify-between gap-2">
                    {growthItems.map((item) => (
                        <div key={item.labelKey} className="flex min-w-0 flex-1 items-center gap-1">
                            <div className="flex items-center gap-2">
                                <span
                                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${item.dotColor}`}
                                    aria-hidden
                                />
                                <span className="font-body-3 text-secondary">
                                    {fa[item.labelKey]}
                                </span>
                            </div>
                            <span className={`font-body-3-highlight ${item.valueColor}`}>
                                {formatNumberVN(item.value)}%
                            </span>
                        </div>
                    ))}
                </div>

                <div className={ANALYSIS_CHART_BOX}>
                    <div ref={chartRef} className={ANALYSIS_CHART_CANVAS} />
                </div>
            </div>
            <div className="shrink-0 rounded-xl border border-quaternary p-3">
                <AnalysisPlan items={planItems} />
            </div>
        </AnalysisSection>
    );
};
