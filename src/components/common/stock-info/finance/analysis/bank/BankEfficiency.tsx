'use client';

import { useEffect, useMemo, useRef } from 'react';

import * as echarts from 'echarts';

import { AnalysisSection } from '@/components/common/stock-info/finance/analysis/common/AnalysisSection';
import { createStockInfoAxisLine } from '@/config/stock-info';
import { ANALYSIS_CONTENT_CARD, BANK_EFFICIENCY_PANELS } from '@/constants/stock-info';
import { useEChartsInstances } from '@/hooks/chart/useEChartsInstances';
import { useTranslate } from '@/hooks/useTranslate';
import { formatNumberVN, formatPeriodMMYYYY } from '@/utils/format';
import { sortByYearAsc, toneClass, trendColor } from '@/utils/stock-info';

export const BankEfficiency = ({ dataAnnual }: { dataAnnual: any }) => {
    const trans = useTranslate();
    const fa = trans.stockInfo.finance_analysis as Record<string, string>;
    const latest = dataAnnual?.[0] ?? {};

    const containerRef = useRef<HTMLDivElement>(null);
    const { chartsMapRef, disposeAll } = useEChartsInstances();

    const sortedData = useMemo(() => sortByYearAsc(dataAnnual), [dataAnnual]);
    const categories = useMemo(
        () => sortedData.map((d: any) => formatPeriodMMYYYY(d)),
        [sortedData],
    );

    const panels = useMemo(
        () =>
            BANK_EFFICIENCY_PANELS.map((panel) => {
                const series = sortedData.map(
                    (item: any) => Number(item?.[panel.field] ?? 0) * 100,
                );
                const color = trendColor(series);
                return {
                    ...panel,
                    series,
                    color,
                    value: Number(latest?.[panel.field] ?? 0) * 100,
                    textClass: toneClass(color),
                };
            }),
        [sortedData, latest],
    );

    useEffect(() => {
        const root = containerRef.current;
        if (!root) return;

        disposeAll();
        panels.forEach(({ id, series, color }) => {
            if (series.length === 0) return;
            const el = root.querySelector<HTMLDivElement>(`[data-panel-chart="${id}"]`);
            if (!el) return;

            const instance = echarts.init(el, 'vnsc-default');
            chartsMapRef.current.set(id, instance);
            instance.setOption(createStockInfoAxisLine(categories, series, color), {
                notMerge: true,
            });
            requestAnimationFrame(() => instance.resize());
        });
    }, [panels, categories, chartsMapRef, disposeAll]);

    return (
        <AnalysisSection title={fa.bank_efficiency_question}>
            <div className="flex shrink-0 flex-row gap-3 rounded-xl border border-quaternary p-3">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="font-body-3 text-secondary">{fa.cof}</span>
                    <span className="font-body-2-highlight text-primary">
                        {formatNumberVN(latest?.cof * 100)}%
                    </span>
                </div>
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="font-body-3 text-secondary">{fa.yea}</span>
                    <span className="font-body-2-highlight text-primary">
                        {formatNumberVN(latest?.yea * 100)}%
                    </span>
                </div>
            </div>
            <div ref={containerRef} className="flex min-h-0 flex-1 items-stretch gap-3">
                {panels.map(({ id, labelKey, value, textClass }) => (
                    <div key={id} className={`${ANALYSIS_CONTENT_CARD} min-h-0`}>
                        <div className="flex shrink-0 flex-col gap-0.5">
                            <span className="font-body-3 text-secondary">{fa[labelKey]}</span>
                            <span className={`font-body-2-highlight ${textClass}`}>
                                {formatNumberVN(value)}%
                            </span>
                        </div>
                        <div
                            className="h-40 w-full min-w-0 shrink-0"
                            data-panel-chart={id}
                            aria-hidden
                        />
                    </div>
                ))}
            </div>
        </AnalysisSection>
    );
};
