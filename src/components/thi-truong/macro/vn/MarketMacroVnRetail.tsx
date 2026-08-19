'use client';

import { useRef } from 'react';

import { createChartMacroLine } from '@/config/market/market-macro';
import { MACRO_SERIES_COLORS, MARKET_MACRO } from '@/constants/market';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import { useEChartsOption } from '@/hooks/chart/useEChartsOption';
import type { MacroPoint } from '@/types/datafeed/finance';
import { formatMacroPercent, getLastMacroValue } from '@/utils/market/market-macro';

type Props = {
    serviceRetail: MacroPoint[];
    goodsRetail: MacroPoint[];
    cpi: MacroPoint[];
};

export const MarketMacroVnRetail = ({ serviceRetail, goodsRetail, cpi }: Props) => {
    const detail = MARKET_MACRO;

    const serviceRef = useRef<HTMLDivElement>(null);
    const serviceHasData = serviceRetail.length > 0;
    const serviceInstanceRef = useEChartsInstance(serviceRef, { shouldInitialize: serviceHasData });

    const goodsRef = useRef<HTMLDivElement>(null);
    const goodsHasData = goodsRetail.length > 0;
    const goodsInstanceRef = useEChartsInstance(goodsRef, { shouldInitialize: goodsHasData });

    const cpiRef = useRef<HTMLDivElement>(null);
    const cpiHasData = cpi.length > 0;
    const cpiInstanceRef = useEChartsInstance(cpiRef, { shouldInitialize: cpiHasData });

    useEChartsOption(
        serviceInstanceRef,
        () =>
            createChartMacroLine(serviceRetail, 'Dịch vụ (YoY)', {
                color: MACRO_SERIES_COLORS.orange,
                valueSuffix: '%',
            }),
        { enabled: serviceHasData, deps: [serviceRetail] },
    );

    useEChartsOption(
        goodsInstanceRef,
        () =>
            createChartMacroLine(goodsRetail, 'Hàng hoá (YoY)', {
                color: MACRO_SERIES_COLORS.blue,
                valueSuffix: '%',
            }),
        { enabled: goodsHasData, deps: [goodsRetail] },
    );

    useEChartsOption(
        cpiInstanceRef,
        () =>
            createChartMacroLine(cpi, 'Lạm phát (YoY)', {
                color: MACRO_SERIES_COLORS.gray,
                valueSuffix: '%',
            }),
        { enabled: cpiHasData, deps: [cpi] },
    );

    return (
        <section className="bg-secondary flex flex-col gap-4 rounded-2xl p-4">
            <h3 className="font-body-2-highlight text-primary">{'Bán lẻ & tiêu dùng'}</h3>
            <div className="flex flex-col gap-4 lg:flex-row">
                <div className="border-tertiary bg-secondary flex min-w-0 flex-1 flex-col rounded-2xl border">
                    <div className="flex w-full flex-col gap-5 p-4">
                        <div className="flex flex-col gap-1">
                            <p className="font-body-3 text-secondary">{'Dịch vụ (YoY)'}</p>
                            <p className="font-body-2-highlight text-primary">
                                {formatMacroPercent(getLastMacroValue(serviceRetail))}
                            </p>
                        </div>
                        {serviceHasData ? (
                            <div key="chart" ref={serviceRef} className="h-32 w-full" />
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
                            <p className="font-body-3 text-secondary">{'Hàng hoá (YoY)'}</p>
                            <p className="font-body-2-highlight text-primary">
                                {formatMacroPercent(getLastMacroValue(goodsRetail))}
                            </p>
                        </div>
                        {goodsHasData ? (
                            <div key="chart" ref={goodsRef} className="h-32 w-full" />
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
                <div className="border-tertiary bg-secondary flex min-w-0 flex-1 flex-col rounded-2xl border">
                    <div className="flex w-full flex-1 flex-col gap-5 p-4">
                        <div className="flex flex-col gap-1">
                            <p className="font-body-3 text-secondary">{'Lạm phát (YoY)'}</p>
                            <p className="font-body-2-highlight text-primary">
                                {formatMacroPercent(getLastMacroValue(cpi))}
                            </p>
                        </div>
                        {cpiHasData ? (
                            <div key="chart" ref={cpiRef} className="min-h-52 w-full flex-1" />
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
            </div>
        </section>
    );
};
