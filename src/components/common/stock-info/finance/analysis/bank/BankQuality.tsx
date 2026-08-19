'use client';

import { useEffect, useMemo, useRef } from 'react';

import * as echarts from 'echarts';

import { AnalysisSection } from '@/components/common/stock-info/finance/analysis/common/AnalysisSection';
import { createStockInfoSparkline } from '@/config/stock-info';
import {
    ANALYSIS_CONTENT_CARD,
    BANK_QUALITY_SPARK_ROWS,
    FINANCE_ANALYSIS_LABELS,
} from '@/constants/stock-info';
import { useEChartsInstances } from '@/hooks/chart/useEChartsInstances';
import { formatNumberVN, formatNumberVNWithUnit, formatPeriodMMYYYY } from '@/utils/format';
import { sortByYearAsc, toneClass, trendColor } from '@/utils/stock-info';

export const BankQuality = ({ dataQuarterly }: { dataQuarterly: any }) => {
    const fa = FINANCE_ANALYSIS_LABELS as Record<string, string>;
    const latest = dataQuarterly?.[0] ?? {};

    const containerRef = useRef<HTMLDivElement>(null);
    const { chartsMapRef, disposeAll } = useEChartsInstances();

    const sortedData = useMemo(() => sortByYearAsc(dataQuarterly), [dataQuarterly]);

    const rows = useMemo(
        () =>
            BANK_QUALITY_SPARK_ROWS.map((row) => {
                const series = sortedData.map((item: any) => Number(item?.[row.field] ?? 0) * 100);
                const color = trendColor(series);
                return {
                    ...row,
                    series,
                    color,
                    value: Number(latest?.[row.field] ?? 0) * 100,
                };
            }),
        [sortedData, latest],
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
        <AnalysisSection title={'Chất lượng tài sản thế nào?'}>
            <div className={ANALYSIS_CONTENT_CARD}>
                <div
                    ref={containerRef}
                    className="flex min-h-0 flex-1 flex-col justify-between gap-4"
                >
                    {rows.map(({ id, labelKey, value, color }) => (
                        <div key={id} className="flex items-center justify-between gap-4">
                            <div className="flex flex-col gap-0.5">
                                <span className="font-body-3 text-secondary">{fa[labelKey]}</span>
                                <span className={`font-body-2-highlight ${toneClass(color)}`}>
                                    {formatNumberVN(value)}%
                                </span>
                            </div>
                            <div className="h-8 w-1/2 min-w-0" data-chart-id={id} aria-hidden />
                        </div>
                    ))}
                </div>
                <div className="h-px w-full shrink-0 bg-tertiary" />
                <div className="flex shrink-0 gap-4">
                    <div className="flex min-w-0 flex-1 flex-col">
                        <span className="font-body-3 text-secondary">{'Nợ xấu (giá trị)'}</span>
                        <span className="font-body-2-highlight text-primary">
                            {formatNumberVNWithUnit(latest?.noxau)}
                        </span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                        <span className="font-body-3 text-secondary">{'Dự phòng/Cho vay KH'}</span>
                        <span className="font-body-2-highlight text-primary">
                            {formatNumberVN(latest?.duphongchovaykh_chovaykh * 100)}%
                        </span>
                    </div>
                </div>
            </div>
        </AnalysisSection>
    );
};
