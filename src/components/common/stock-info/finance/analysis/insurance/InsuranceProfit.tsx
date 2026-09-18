'use client';

import { useEffect, useMemo, useRef } from 'react';

import * as echarts from 'echarts';

import { AnalysisSection } from '@/components/common/stock-info/finance/analysis/common/AnalysisSection';
import { createStockInfoSparkline } from '@/config/stock-info';
import {
    FINANCE_ANALYSIS_LABELS,
    INSURANCE_PROFIT_ROWS,
    STATUS_COLORS,
} from '@/constants/stock-info';
import { useEChartsInstances } from '@/hooks/chart/useEChartsInstances';
import { formatNumberVN, formatPeriodMMYYYY } from '@/utils/format';
import { sortByYearAsc, trendColor } from '@/utils/stock-info';

export const InsuranceProfit = ({ dataQuarterly }: { dataQuarterly: any }) => {
    const fa = FINANCE_ANALYSIS_LABELS as Record<string, string>;
    const latestQuarterly = dataQuarterly?.[0] ?? {};

    const containerRef = useRef<HTMLDivElement>(null);
    const { chartsMapRef, disposeAll } = useEChartsInstances();

    const sortedData = useMemo(() => sortByYearAsc(dataQuarterly), [dataQuarterly]);

    const rows = useMemo(
        () =>
            INSURANCE_PROFIT_ROWS.map((row) => {
                const series = sortedData.map((item: any) => Number(item?.[row.field] ?? 0) * 100);
                const color = trendColor(series);
                const raw = Number(latestQuarterly?.[row.field] ?? 0) * 100;
                return {
                    ...row,
                    series,
                    color,
                    textClass: color === STATUS_COLORS.positive ? 'text-green' : 'text-red',
                    value: raw,
                };
            }),
        [sortedData, latestQuarterly],
    );

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

    return (
        <AnalysisSection title={'Lợi nhuận đến từ đâu?'}>
            <div ref={containerRef} className="grid grid-cols-3 gap-3">
                {rows.map(({ id, labelKey, kind, value, textClass }) => (
                    <div
                        key={id}
                        className="flex min-w-0 flex-col gap-4 rounded-2xl border border-tertiary p-4"
                    >
                        <div className="flex flex-col gap-1">
                            <div className="flex min-w-0 items-center gap-2">
                                <p className="truncate body-4 text-secondary">
                                    {fa[labelKey]}
                                </p>
                                {kind === 'yoy' && (
                                    <span className="shrink-0 rounded-full border border-tertiary px-2 py-1 body-5-highlight text-primary">
                                        {'YoY'}
                                    </span>
                                )}
                            </div>
                            <p className={`body-4-highlight ${textClass}`}>
                                {value >= 0 ? '+' : ''}
                                {formatNumberVN(value)}%
                            </p>
                        </div>
                        <div className="h-7 w-full min-w-0" data-chart-id={id} aria-hidden />
                    </div>
                ))}
            </div>
        </AnalysisSection>
    );
};
