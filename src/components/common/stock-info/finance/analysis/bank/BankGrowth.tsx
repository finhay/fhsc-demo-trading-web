'use client';

import { useEffect, useMemo, useRef } from 'react';

import * as echarts from 'echarts';

import { AnalysisPlan } from '@/components/common/stock-info/finance/analysis/common/AnalysisPlan';
import { AnalysisSection } from '@/components/common/stock-info/finance/analysis/common/AnalysisSection';
import { createStockInfoSparkline } from '@/config/stock-info';
import {
    ANALYSIS_CONTENT_CARD,
    BANK_GROWTH_ROWS,
    FINANCE_ANALYSIS_LABELS,
    STATUS_COLORS,
} from '@/constants/stock-info';
import { useEChartsInstances } from '@/hooks/chart/useEChartsInstances';
import { formatNumberVN, formatPeriodMMYYYY } from '@/utils/format';
import { pickPlanItems, sortByYearAsc, trendColor } from '@/utils/stock-info';

export const BankGrowth = ({
    dataAnnual,
    dataQuarterly,
}: {
    dataAnnual: any;
    dataQuarterly: any;
}) => {
    const fa = FINANCE_ANALYSIS_LABELS as Record<string, string>;
    const latest = dataAnnual?.[0] ?? {};
    const latestQuarterly = dataQuarterly?.[0] ?? {};

    const containerRef = useRef<HTMLDivElement>(null);
    const { chartsMapRef, disposeAll } = useEChartsInstances();

    const sortedData = useMemo(() => sortByYearAsc(dataAnnual), [dataAnnual]);

    const rows = useMemo(
        () =>
            BANK_GROWTH_ROWS.map((row) => {
                const series = sortedData.map((item: any) => Number(item?.[row.field] ?? 0) * 100);
                const color = trendColor(series);
                return {
                    ...row,
                    series,
                    color,
                    textClass: color === STATUS_COLORS.positive ? 'text-green' : 'text-red',
                    value: Number(latestQuarterly?.[row.field] ?? 0) * 100,
                };
            }),
        [sortedData, latestQuarterly],
    );

    const kpiRows = rows.filter((row) => row.id !== 'lnst');
    const lnstRow = rows.find((row) => row.id === 'lnst');
    const planItems = pickPlanItems(latest);

    useEffect(() => {
        const root = containerRef.current;
        if (!root) return;

        disposeAll();
        const categories = sortedData.map((d: any) => formatPeriodMMYYYY(d));
        rows.forEach(({ id, series, color }) => {
            if (series.length === 0) return;
            const el = root.querySelector<HTMLDivElement>(`[data-chart-id="${id}"]`);
            if (!el) return;

            const instance = echarts.init(el, 'vnsc-default');
            chartsMapRef.current.set(id, instance);
            instance.setOption(
                createStockInfoSparkline(series, color, { enableTooltip: true, categories }),
                { notMerge: true },
            );
            requestAnimationFrame(() => instance.resize());
        });
    }, [rows, sortedData, chartsMapRef, disposeAll]);

    const renderSparkCard = (row: (typeof rows)[number], className?: string) => (
        <div
            key={row.id}
            className={`flex flex-col gap-2 rounded-2xl border border-tertiary p-3 ${className ?? ''}`}
        >
            <div className="flex flex-col gap-0.5">
                <p className="font-body-3 text-secondary">{fa[row.labelKey]}</p>
                <p className={`font-body-3-highlight ${row.textClass}`}>
                    {row.value >= 0 ? '+' : ''}
                    {formatNumberVN(row.value)}%
                </p>
            </div>
            <div className="h-10 w-full min-w-0" data-chart-id={row.id} aria-hidden />
        </div>
    );

    return (
        <AnalysisSection
            title={'Có tăng trưởng không?'}
            right={
                <span className="shrink-0 rounded-full border border-tertiary px-2 py-1 font-body-3 text-primary">
                    {'YoY'}
                </span>
            }
        >
            <div ref={containerRef} className={ANALYSIS_CONTENT_CARD}>
                <div className="grid grid-cols-3 gap-3">
                    {kpiRows.map((row) => renderSparkCard(row))}
                </div>
                <div className="flex items-stretch gap-3">
                    {lnstRow && renderSparkCard(lnstRow, 'w-72 shrink-0')}
                    <div className="flex min-w-0 flex-1 flex-col justify-center rounded-xl border border-quaternary p-3">
                        <AnalysisPlan items={planItems} />
                    </div>
                </div>
            </div>
        </AnalysisSection>
    );
};
