'use client';

import { useMemo, useRef } from 'react';

import {
    buildDualMacroChartSeries,
    createChartMacroLine,
    createChartMacroMulti,
} from '@/config/market/market-macro';
import { MACRO_SERIES_COLORS, MARKET_MACRO } from '@/constants/market';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import { useEChartsOption } from '@/hooks/chart/useEChartsOption';
import type { MacroUsRawState } from '@/types/pages/market';
import { formatNumberVN } from '@/utils/format';
import { formatMacroPercent, getLastMacroValue } from '@/utils/market/market-macro';

type Props = {
    data: MacroUsRawState;
};

export const MarketMacroUs = ({ data }: Props) => {
    const detail = MARKET_MACRO;

    const { dates, series } = useMemo(
        () =>
            buildDualMacroChartSeries(data.pce, data.corePce, {
                primary: 'PCE',
                secondary: 'PCE lõi',
            }),
        [data.pce, data.corePce, detail],
    );
    const consumptionLegends = [
        {
            key: 'pce',
            label: 'PCE',
            colorClass: 'base-blue',
            value: getLastMacroValue(data.pce),
        },
        {
            key: 'core_pce',
            label: 'PCE lõi',
            colorClass: 'base-orange',
            value: getLastMacroValue(data.corePce),
        },
    ];
    const consumptionRef = useRef<HTMLDivElement>(null);
    const consumptionHasData =
        dates.length > 0 && series.some((item) => item.values.some((v) => v != null));
    const consumptionInstanceRef = useEChartsInstance(consumptionRef, {
        shouldInitialize: consumptionHasData,
    });

    const nfpLast = getLastMacroValue(data.nfp);
    const nfpRef = useRef<HTMLDivElement>(null);
    const nfpHasData = data.nfp.length > 0;
    const nfpInstanceRef = useEChartsInstance(nfpRef, { shouldInitialize: nfpHasData });

    const unemploymentRef = useRef<HTMLDivElement>(null);
    const unemploymentHasData = data.unemployment.length > 0;
    const unemploymentInstanceRef = useEChartsInstance(unemploymentRef, {
        shouldInitialize: unemploymentHasData,
    });

    const formatNfp = (value: number) =>
        `${formatNumberVN(value, { trimTrailingZeros: true })} ${'nghìn'}`;
    const formatNfpAxis = (value: number) =>
        `${formatNumberVN(value, { trimTrailingZeros: true })}k`;

    useEChartsOption(
        consumptionInstanceRef,
        () => createChartMacroMulti(dates, series, { valueSuffix: '%' }),
        { enabled: consumptionHasData, deps: [dates, series] },
    );

    useEChartsOption(
        nfpInstanceRef,
        () =>
            createChartMacroLine(data.nfp, 'Việc làm (NFP)', {
                color: MACRO_SERIES_COLORS.orange,
                yFormatter: formatNfpAxis,
                valueFormatter: formatNfp,
            }),
        { enabled: nfpHasData, deps: [data.nfp] },
    );

    useEChartsOption(
        unemploymentInstanceRef,
        () =>
            createChartMacroLine(data.unemployment, 'Tỷ lệ thất nghiệp', {
                color: MACRO_SERIES_COLORS.blue,
                valueSuffix: '%',
            }),
        { enabled: unemploymentHasData, deps: [data.unemployment] },
    );

    return (
        <section className="base-secondary flex flex-col gap-4 rounded-2xl p-4">
            <h3 className="body-3-highlight text-primary">{'Tiêu dùng & việc làm'}</h3>
            <div className="flex flex-col gap-4 lg:flex-row">
                <div className="border-tertiary base-secondary flex min-w-0 flex-1 flex-col gap-5 rounded-2xl border p-4">
                    <div className="flex flex-col gap-4">
                        <p className="body-4 text-secondary">{'Lạm phát (YoY)'}</p>
                        <div className="flex flex-wrap items-center gap-4">
                            {consumptionLegends.map((legend) => (
                                <div
                                    key={legend.key}
                                    className="border-tertiary flex items-center gap-4 rounded-full border px-3 py-1"
                                >
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`h-2 w-2 shrink-0 rounded-full ${legend.colorClass}`}
                                            aria-hidden
                                        />
                                        <span className="body-4 text-secondary">
                                            {legend.label}
                                        </span>
                                    </div>
                                    <span className="body-4-highlight text-primary">
                                        {formatMacroPercent(legend.value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {consumptionHasData ? (
                        <div key="chart" ref={consumptionRef} className="min-h-52 w-full flex-1" />
                    ) : (
                        <div
                            key="empty"
                            className="text-secondary body-5 flex min-h-52 w-full flex-1 items-center justify-center"
                        >
                            --
                        </div>
                    )}
                </div>
                <div className="border-tertiary base-secondary flex min-w-0 flex-1 flex-col rounded-2xl border">
                    <div className="flex w-full flex-col gap-5 p-4">
                        <div className="flex flex-col gap-1">
                            <p className="body-4 text-secondary">{'Việc làm (NFP)'}</p>
                            <p className="body-3-highlight text-primary">
                                {nfpLast == null ? '--' : formatNfp(nfpLast)}
                            </p>
                        </div>
                        {nfpHasData ? (
                            <div key="chart" ref={nfpRef} className="h-32 w-full" />
                        ) : (
                            <div
                                key="empty"
                                className="text-secondary body-5 flex h-32 w-full items-center justify-center"
                            >
                                --
                            </div>
                        )}
                    </div>
                    <div className="base-tertiary h-px w-full" />
                    <div className="flex w-full flex-col gap-5 p-4">
                        <div className="flex flex-col gap-1">
                            <p className="body-4 text-secondary">{'Tỷ lệ thất nghiệp'}</p>
                            <p className="body-3-highlight text-primary">
                                {formatMacroPercent(getLastMacroValue(data.unemployment))}
                            </p>
                        </div>
                        {unemploymentHasData ? (
                            <div key="chart" ref={unemploymentRef} className="h-32 w-full" />
                        ) : (
                            <div
                                key="empty"
                                className="text-secondary body-5 flex h-32 w-full items-center justify-center"
                            >
                                --
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
