'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import * as echarts from 'echarts';

import { AnalysisPlan } from '@/components/common/stock-info/finance/analysis/common/AnalysisPlan';
import { AnalysisSection } from '@/components/common/stock-info/finance/analysis/common/AnalysisSection';
import { createStockInfoSparkline } from '@/config/stock-info';
import { FINANCE_ANALYSIS_LABELS, SECURITIES_GROWTH, STATUS_COLORS } from '@/constants/stock-info';
import { useEChartsInstances } from '@/hooks/chart/useEChartsInstances';
import type { SecuritiesGrowthRow } from '@/types/pages/stock-info';
import { formatNumberVN, formatNumberVNWithUnit, formatPeriodMMYYYY } from '@/utils/format';
import { pickPlanItems, sortByYearAsc, trendColor } from '@/utils/stock-info';

export const SecuritiesGrowth = ({
    dataAnnual,
    dataQuarterly,
}: {
    dataAnnual: any;
    dataQuarterly: any;
}) => {
    const fa = FINANCE_ANALYSIS_LABELS as Record<string, string>;
    const [tab, setTab] = useState<string>('% YoY');
    const isYoY = tab === '% YoY';

    const latest = dataQuarterly?.[0] ?? {};
    const annualLatest = dataAnnual?.[0] ?? {};

    const sortedData = useMemo(() => sortByYearAsc(dataQuarterly), [dataQuarterly]);

    const buildRows = (defs: readonly SecuritiesGrowthRow[]) =>
        defs.map((row) => {
            const series = sortedData.map((item: any) => Number(item?.[row.yoyField] ?? 0) * 100);
            const color = trendColor(series);
            return {
                ...row,
                series,
                color,
                textClass: color === STATUS_COLORS.positive ? 'text-green' : 'text-red',
                yoyValue: Number(latest?.[row.yoyField] ?? 0) * 100,
                soValue: Number(latest?.[row.soField] ?? 0),
            };
        });

    const tongQuanRows = useMemo(
        () => buildRows(SECURITIES_GROWTH.tongQuanRows),
        [sortedData, latest],
    );
    const cocauRows = useMemo(() => buildRows(SECURITIES_GROWTH.coCauRows), [sortedData, latest]);

    const planItems = useMemo(() => pickPlanItems(annualLatest), [annualLatest]);

    const containerRef = useRef<HTMLDivElement>(null);
    const { chartsMapRef, disposeAll } = useEChartsInstances();

    useEffect(() => {
        disposeAll();
        if (!isYoY) return;
        const root = containerRef.current;
        if (!root) return;

        const categories = sortedData.map((d: any) => formatPeriodMMYYYY(d));
        [...tongQuanRows, ...cocauRows].forEach(({ id, series, color }) => {
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
    }, [isYoY, sortedData, tongQuanRows, cocauRows, chartsMapRef, disposeAll]);

    const renderCard = (row: (typeof tongQuanRows)[0]) => (
        <div
            key={row.id}
            className="flex min-w-0 flex-1 flex-col gap-4 rounded-2xl border border-tertiary p-4"
        >
            <div className="flex flex-col gap-1">
                <p className="truncate font-body-3 text-secondary">
                    {fa[isYoY ? row.labelKeyYoY : row.labelKeySo]}
                </p>
                {isYoY ? (
                    <p className={`font-body-3-highlight ${row.textClass}`}>
                        {row.yoyValue >= 0 ? '+' : ''}
                        {formatNumberVN(row.yoyValue)}%
                    </p>
                ) : (
                    <p className="font-body-3-highlight text-primary">
                        {row.soUnit
                            ? `${formatNumberVN(row.soValue)} ${row.soUnit}`
                            : formatNumberVNWithUnit(row.soValue)}
                    </p>
                )}
            </div>
            {isYoY && <div className="h-7 w-full min-w-0" data-chart-id={row.id} aria-hidden />}
        </div>
    );

    return (
        <AnalysisSection
            title={'Có tăng trưởng không?'}
            right={
                <div className="flex shrink-0 items-center gap-1">
                    {SECURITIES_GROWTH.tabs.map((t) => (
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
                            {fa[SECURITIES_GROWTH.tabLabelKeys[t]]}
                        </button>
                    ))}
                </div>
            }
        >
            <div ref={containerRef} className="flex flex-col gap-3">
                <p className="font-body-3 text-primary">{'Tổng quan'}</p>
                <div className="flex items-stretch gap-3">{tongQuanRows.map(renderCard)}</div>
                <p className="font-body-3 text-primary">{'Cơ cấu kinh doanh'}</p>
                <div className="flex items-stretch gap-3">{cocauRows.map(renderCard)}</div>
            </div>
            <div className="rounded-xl border border-quaternary p-3">
                <AnalysisPlan items={planItems} />
            </div>
        </AnalysisSection>
    );
};
