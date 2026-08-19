'use client';

import { useRef } from 'react';

import { createChartInterbank } from '@/config/market/market-currency';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import { useEChartsOption } from '@/hooks/chart/useEChartsOption';
import { useTranslate } from '@/hooks/useTranslate';
import type { MacroPoint } from '@/types/datafeed/finance';
import { formatNumberVN } from '@/utils/format';

type Props = {
    points: MacroPoint[];
};

export const MarketInterbank = ({ points }: Props) => {
    const trans = useTranslate();
    const detail = trans.market.currency.detail;
    const chartRef = useRef<HTMLDivElement>(null);
    const hasData = points.length > 0;
    const chartInstanceRef = useEChartsInstance(chartRef, { shouldInitialize: hasData });
    const lastValue = points.at(-1)?.value;

    useEChartsOption(
        chartInstanceRef,
        () => createChartInterbank(points, detail.interbank_series),
        { enabled: hasData, deps: [points, detail.interbank_series] },
    );

    return (
        <section className="bg-secondary flex flex-col gap-4 rounded-2xl p-4">
            <div className="flex flex-col gap-1">
                <p className="font-body-3 text-secondary">{detail.interbank_overnight}</p>
                <p className="font-body-1-highlight text-primary">
                    {lastValue == null
                        ? '--'
                        : `${formatNumberVN(lastValue, { trimTrailingZeros: true })}%`}
                </p>
            </div>
            {hasData ? (
                <div key="chart" ref={chartRef} className="h-48 w-full" />
            ) : (
                <div
                    key="empty"
                    className="text-secondary font-caption flex h-48 items-center justify-center"
                >
                    --
                </div>
            )}
        </section>
    );
};
