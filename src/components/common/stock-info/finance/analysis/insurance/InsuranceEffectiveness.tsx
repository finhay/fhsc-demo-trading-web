'use client';

import { useEffect, useMemo, useRef } from 'react';

import * as echarts from 'echarts';

import { AnalysisSection } from '@/components/common/stock-info/finance/analysis/common/AnalysisSection';
import { createStockInfoSparkline } from '@/config/stock-info';
import {
    CHART_GRADIENTS,
    FINANCE_ANALYSIS_LABELS,
    INSURANCE_EFFECTIVENESS,
    STATUS_COLORS,
} from '@/constants/stock-info';
import { useEChartsInstances } from '@/hooks/chart/useEChartsInstances';
import { formatNumberVN, formatPeriodMMYYYY } from '@/utils/format';
import { sortByYearAsc, trendColor } from '@/utils/stock-info';

export const InsuranceEffectiveness = ({ dataQuarterly }: { dataQuarterly: any }) => {
    const fa = FINANCE_ANALYSIS_LABELS as Record<string, string>;
    const latestQuarterly = dataQuarterly?.[0] ?? {};

    const containerRef = useRef<HTMLDivElement>(null);
    const { chartsMapRef, disposeAll } = useEChartsInstances();

    const sortedData = useMemo(() => sortByYearAsc(dataQuarterly), [dataQuarterly]);

    const rows = useMemo(
        () =>
            INSURANCE_EFFECTIVENESS.rows.map((row) => {
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

    const { breakdownFields } = INSURANCE_EFFECTIVENESS;
    const nhanTho = Number(latestQuarterly?.[breakdownFields.nhanTho] ?? 0) * 100;
    const phiNhanTho = Number(latestQuarterly?.[breakdownFields.phiNhanTho] ?? 0) * 100;
    const xeCoGioi = Number(latestQuarterly?.[breakdownFields.xeCoGioi] ?? 0) * 100;
    const sucKhoe = Number(latestQuarterly?.[breakdownFields.sucKhoe] ?? 0) * 100;

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
        <AnalysisSection
            title={'Bảo hiểm có hiệu quả không?'}
            right={
                <div className="flex shrink-0 items-center gap-1">
                    <span className="rounded-full px-3 py-1 body-4 text-secondary">
                        {'Tổng quan'}
                    </span>
                    <span className="rounded-full base-tertiary px-3 py-1 body-4-highlight text-primary">
                        {'YoY'}
                    </span>
                </div>
            }
        >
            <div className="flex flex-col gap-4">
                <div ref={containerRef} className="flex items-stretch gap-3">
                    {rows.map(({ id, labelKey, value, textClass }) => (
                        <div
                            key={id}
                            className="flex min-w-0 flex-1 flex-col gap-4 rounded-2xl border border-tertiary p-4"
                        >
                            <div className="flex flex-col gap-1">
                                <p className="truncate body-4 text-secondary">
                                    {fa[labelKey]}
                                </p>
                                <p className={`body-4-highlight ${textClass}`}>
                                    {value >= 0 ? '+' : ''}
                                    {formatNumberVN(value)}%
                                </p>
                            </div>
                            <div className="h-7 w-full min-w-0" data-chart-id={id} aria-hidden />
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-3">
                    <p className="body-4 text-primary">{'% bồi thường theo nghiệp vụ'}</p>
                    <div className="flex gap-3">
                        <div
                            className="flex min-w-0 flex-1 flex-col gap-1 rounded-xl px-3 py-2"
                            style={{ background: CHART_GRADIENTS.neutral }}
                        >
                            <p className="body-4 text-secondary">{'Nhân thọ'}</p>
                            <p className="body-4-highlight text-primary">
                                {formatNumberVN(nhanTho)}%
                            </p>
                        </div>
                        <div
                            className="flex min-w-0 flex-1 flex-col gap-1 rounded-xl px-3 py-2"
                            style={{ background: CHART_GRADIENTS.positive }}
                        >
                            <p className="body-4 text-secondary">{'Phi nhân thọ'}</p>
                            <p className="body-4-highlight text-green">
                                {formatNumberVN(phiNhanTho)}%
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-xl border border-tertiary p-3">
                            <span className="truncate body-5 text-secondary">
                                {'Xe cơ giới'}
                            </span>
                            <span className="shrink-0 body-4-highlight text-primary">
                                {formatNumberVN(xeCoGioi)}%
                            </span>
                        </div>
                        <div className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-xl border border-tertiary p-3">
                            <span className="truncate body-5 text-secondary">
                                {'Sức khoẻ'}
                            </span>
                            <span className="shrink-0 body-4-highlight text-primary">
                                {formatNumberVN(sucKhoe)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </AnalysisSection>
    );
};
