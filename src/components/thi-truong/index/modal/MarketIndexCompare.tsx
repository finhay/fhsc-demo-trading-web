'use client';

import { useEffect, useRef } from 'react';

import { FaArrowDown, FaArrowUp } from 'react-icons/fa6';

import { createChartMarketIndexCompareSparkline } from '@/config/market/market-index';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import { useMarketIndexStore } from '@/stores/common/useMarketIndexStore';
import { formatNumberVN } from '@/utils/format';

type Props = {
    index: string;
};

export const MarketIndexCompare = ({ index }: Props) => {
    const { data } = useMarketIndexStore();
    const containerRef = useRef<HTMLDivElement>(null);

    const indexData = data.find((item) => item?.index === index);
    const change = indexData?.change ?? 0;
    const changePercent = indexData?.changePercent ?? 0;
    const changeColorClass =
        changePercent === 0 ? 'text-orange' : changePercent > 0 ? 'text-green' : 'text-red';
    const changeArrow =
        change > 0 ? (
            <FaArrowUp size={12} aria-hidden />
        ) : change < 0 ? (
            <FaArrowDown size={12} aria-hidden />
        ) : null;

    const chartInstanceRef = useEChartsInstance(containerRef, {
        shouldInitialize: !!indexData?.times?.length,
    });

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !indexData?.times?.length) return;

        const options = createChartMarketIndexCompareSparkline(indexData);
        if (!options) return;

        chartInstanceRef.current?.setOption(options, { lazyUpdate: true });

        requestAnimationFrame(() => {
            chartInstanceRef.current?.resize();
        });
    }, [indexData, chartInstanceRef]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new ResizeObserver(() => {
            requestAnimationFrame(() => {
                chartInstanceRef.current?.resize();
            });
        });
        observer.observe(container);

        return () => {
            observer.disconnect();
        };
    }, [chartInstanceRef]);

    return (
        <article className="flex min-w-0 flex-1 flex-col rounded-2xl border border-tertiary base-secondary p-4">
            <div className="flex items-center gap-4">
                <div className="flex shrink-0 flex-col gap-2">
                    <h3 className="body-5 text-secondary">{index}</h3>
                    <span className="body-3-highlight text-primary">
                        {formatNumberVN(indexData?.indexValue ?? 0, { decimals: 2 })}
                    </span>
                    <div className={`flex items-center gap-1 ${changeColorClass}`}>
                        {changeArrow}
                        <span className="body-5-highlight">
                            {formatNumberVN(change, { decimals: 2 })} (
                            {changePercent > 0 ? '+' : ''}
                            {formatNumberVN(changePercent, { decimals: 2 })}%)
                        </span>
                    </div>
                </div>
                <div className="h-16 min-h-0 min-w-0 flex-1">
                    <div ref={containerRef} className="h-full w-full" />
                </div>
            </div>
        </article>
    );
};
