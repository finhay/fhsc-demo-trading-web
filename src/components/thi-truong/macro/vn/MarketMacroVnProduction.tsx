'use client';

import { useMemo, useRef } from 'react';

import {
    buildExportChartSeries,
    createChartMacroLine,
    createChartMacroMulti,
} from '@/config/market/market-macro';
import { MACRO_SERIES_COLORS } from '@/constants/market';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import { useEChartsOption } from '@/hooks/chart/useEChartsOption';
import { useTranslate } from '@/hooks/useTranslate';
import type { MacroExportPoint, MacroPoint } from '@/types/datafeed/finance';
import { formatNumberVN } from '@/utils/format';
import { formatMacroPercent, getLastMacroValue } from '@/utils/market/market-macro';

type Props = {
    iip: MacroPoint[];
    pmi: MacroPoint[];
    exportData: MacroExportPoint[];
};

export const MarketMacroVnProduction = ({ iip, pmi, exportData }: Props) => {
    const detail = useTranslate().market.macro.detail;

    const iipRef = useRef<HTMLDivElement>(null);
    const iipHasData = iip.length > 0;
    const iipInstanceRef = useEChartsInstance(iipRef, { shouldInitialize: iipHasData });

    const pmiLast = getLastMacroValue(pmi);
    const pmiRef = useRef<HTMLDivElement>(null);
    const pmiHasData = pmi.length > 0;
    const pmiInstanceRef = useEChartsInstance(pmiRef, { shouldInitialize: pmiHasData });

    const { dates, series } = useMemo(
        () =>
            buildExportChartSeries(exportData, {
                domestic: detail.export_domestic,
                fdi: detail.export_fdi,
                total: detail.export_total,
            }),
        [exportData, detail],
    );
    const lastExport = [...exportData].sort((a, b) => a.month.localeCompare(b.month)).at(-1);
    const exportLegends = [
        {
            key: 'domestic',
            label: detail.export_domestic,
            colorClass: 'bg-blue',
            value: lastExport?.domestic,
        },
        {
            key: 'fdi',
            label: detail.export_fdi,
            colorClass: 'bg-orange',
            value: lastExport?.fdi,
        },
        {
            key: 'total',
            label: detail.export_total,
            colorClass: 'bg-gray',
            value: lastExport?.total,
        },
    ];
    const exportRef = useRef<HTMLDivElement>(null);
    const exportHasData =
        dates.length > 0 && series.some((item) => item.values.some((v) => v != null));
    const exportInstanceRef = useEChartsInstance(exportRef, { shouldInitialize: exportHasData });

    useEChartsOption(
        iipInstanceRef,
        () =>
            createChartMacroLine(iip, detail.iip, {
                color: MACRO_SERIES_COLORS.orange,
                valueSuffix: '%',
            }),
        { enabled: iipHasData, deps: [iip] },
    );

    useEChartsOption(
        pmiInstanceRef,
        () => createChartMacroLine(pmi, detail.pmi, { color: MACRO_SERIES_COLORS.blue }),
        { enabled: pmiHasData, deps: [pmi] },
    );

    useEChartsOption(
        exportInstanceRef,
        () => createChartMacroMulti(dates, series, { valueSuffix: '%' }),
        { enabled: exportHasData, deps: [dates, series] },
    );

    return (
        <section className="bg-secondary flex flex-col gap-4 rounded-2xl p-4">
            <h3 className="font-body-2-highlight text-primary">{detail.section_production}</h3>
            <div className="flex flex-col gap-4 lg:flex-row">
                <div className="border-tertiary bg-secondary flex min-w-0 flex-1 flex-col rounded-2xl border">
                    <div className="flex w-full flex-col gap-5 p-4">
                        <div className="flex flex-col gap-1">
                            <p className="font-body-3 text-secondary">{detail.iip}</p>
                            <p className="font-body-2-highlight text-primary">
                                {formatMacroPercent(getLastMacroValue(iip))}
                            </p>
                        </div>
                        {iipHasData ? (
                            <div key="chart" ref={iipRef} className="h-32 w-full" />
                        ) : (
                            <div
                                key="empty"
                                className="text-secondary font-caption flex h-32 w-full items-center justify-center"
                            >
                                --
                            </div>
                        )}
                    </div>
                    <div className="bg-tertiary h-px w-full" />
                    <div className="flex w-full flex-col gap-5 p-4">
                        <div className="flex flex-col gap-1">
                            <p className="font-body-3 text-secondary">{detail.pmi}</p>
                            <p className="font-body-2-highlight text-primary">
                                {pmiLast == null
                                    ? '--'
                                    : formatNumberVN(pmiLast, { trimTrailingZeros: true })}
                            </p>
                        </div>
                        {pmiHasData ? (
                            <div key="chart" ref={pmiRef} className="h-32 w-full" />
                        ) : (
                            <div
                                key="empty"
                                className="text-secondary font-caption flex h-32 w-full items-center justify-center"
                            >
                                --
                            </div>
                        )}
                    </div>
                </div>
                <div className="border-tertiary bg-secondary flex min-w-0 flex-1 flex-col gap-5 rounded-2xl border p-4">
                    <div className="flex flex-col gap-4">
                        <p className="font-body-3-highlight text-secondary">
                            {detail.export_title}
                        </p>
                        <div className="flex flex-wrap items-center gap-4">
                            {exportLegends.map((legend) => (
                                <div
                                    key={legend.key}
                                    className="border-tertiary flex items-center gap-4 rounded-full border px-3 py-1"
                                >
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`h-2 w-2 shrink-0 rounded-full ${legend.colorClass}`}
                                            aria-hidden
                                        />
                                        <span className="font-body-3 text-secondary">
                                            {legend.label}
                                        </span>
                                    </div>
                                    <span className="font-body-3-highlight text-primary">
                                        {formatMacroPercent(legend.value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {exportHasData ? (
                        <div key="chart" ref={exportRef} className="min-h-52 w-full flex-1" />
                    ) : (
                        <div
                            key="empty"
                            className="text-secondary font-caption flex min-h-52 w-full flex-1 items-center justify-center"
                        >
                            --
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
