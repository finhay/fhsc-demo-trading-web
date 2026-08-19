'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { AnalysisPlan } from '@/components/common/stock-info/finance/analysis/common/AnalysisPlan';
import { AnalysisSection } from '@/components/common/stock-info/finance/analysis/common/AnalysisSection';
import {
    ANALYSIS_CHART_BOX,
    ANALYSIS_CHART_CANVAS,
    ANALYSIS_CONTENT_CARD,
    NON_FINANCIAL_GROWTH,
} from '@/constants/stock-info';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import { useTranslate } from '@/hooks/useTranslate';
import { getChangeColor } from '@/utils/common';
import { formatNumberVN, formatPeriodMMYYYY } from '@/utils/format';
import { appendPercentTooltip, pickPlanItems, sortByYearAsc } from '@/utils/stock-info';

export const NonFinancialGrowth = ({
    dataAnnual,
    dataQuarterly,
}: {
    dataAnnual: any;
    dataQuarterly: any;
}) => {
    const trans = useTranslate();
    const fa = trans.stockInfo.finance_analysis as Record<string, string>;
    const [tab, setTab] = useState<string>('QoQ');
    const source = tab === 'QoQ' ? dataQuarterly : dataAnnual;
    const latest = source?.[0] ?? {};
    const { keys } = NON_FINANCIAL_GROWTH.tabConfig[tab];

    const planItems = pickPlanItems(latest);

    const growthItems = useMemo(() => {
        const sorted = sortByYearAsc(source);
        const latestItem = source?.[0] ?? {};
        const fieldKeys = [keys.dtt, keys.ebit, keys.lnst];
        return NON_FINANCIAL_GROWTH.itemsBase.map((base, idx) => {
            const key = fieldKeys[idx];
            const value = Number(latestItem?.[key]) || 0;
            const first = Number(sorted[0]?.[key]) || 0;
            const last = Number(sorted[sorted.length - 1]?.[key]) || 0;
            return {
                ...base,
                key,
                value,
                valueColor: getChangeColor(last - first),
            };
        });
    }, [source, keys]);

    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useEChartsInstance(chartRef);

    const chartOptions = useMemo(() => {
        const sorted = sortByYearAsc(source);
        const categories = sorted.map((d: any) => formatPeriodMMYYYY(d));
        const series = growthItems.map((item) => ({
            type: 'line' as const,
            name: fa[item.labelKey],
            data: sorted.map((d: any) => Number(d?.[item.key]) || 0),
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
    }, [tab, dataAnnual, dataQuarterly, fa, growthItems, source]);

    useEffect(() => {
        chartInstanceRef.current?.setOption(chartOptions, { notMerge: true });
        requestAnimationFrame(() => chartInstanceRef.current?.resize());
    }, [chartOptions, chartInstanceRef]);

    return (
        <AnalysisSection
            title={fa.growth_question}
            right={
                <div className="flex shrink-0 items-center gap-1">
                    {NON_FINANCIAL_GROWTH.tabs.map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setTab(t)}
                            className={
                                tab === t
                                    ? 'rounded-full bg-tertiary px-3 py-1 font-body-3-highlight text-primary'
                                    : 'rounded-full px-3 py-1 font-body-3 text-secondary'
                            }
                        >
                            {fa[NON_FINANCIAL_GROWTH.tabLabelKeys[t]]}
                        </button>
                    ))}
                </div>
            }
        >
            <div className={ANALYSIS_CONTENT_CARD}>
                <div className="flex w-full shrink-0 items-center justify-between gap-2">
                    {growthItems.map((item) => (
                        <div key={item.labelKey} className="flex items-center gap-1">
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
