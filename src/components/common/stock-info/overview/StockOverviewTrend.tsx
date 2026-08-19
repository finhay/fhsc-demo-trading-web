'use client';

import { useEffect, useMemo, useRef } from 'react';

import { createStockInfoBusinessTrend } from '@/config/stock-info';
import { useEChartsInstance } from '@/hooks/chart/useEChartsInstance';
import { useTradingStore } from '@/stores/trading/useTradingStore';

type StockOverviewTrendProps = {
    categories: string[];
    netRevenue: number[];
    profitAfterTax: number[];
};

export const StockOverviewTrend = ({
    categories,
    netRevenue,
    profitAfterTax,
}: StockOverviewTrendProps) => {
    const { isChartFullscreen } = useTradingStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useEChartsInstance(containerRef, {
        shouldInitialize: netRevenue.length > 0 && profitAfterTax.length > 0,
    });

    const seriesLabels = useMemo(
        () => ({
            netRevenue: 'Doanh thu thuần',
            profitAfterTax: 'Lợi nhuận sau thuế',
        }),
        [],
    );

    const options = useMemo(
        () => createStockInfoBusinessTrend(categories, netRevenue, profitAfterTax, seriesLabels),
        [categories, netRevenue, profitAfterTax, seriesLabels],
    );

    useEffect(() => {
        chartInstanceRef.current?.setOption(options, { notMerge: true });
    }, [options, chartInstanceRef]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const ro = new ResizeObserver(() => {
            chartInstanceRef.current?.resize();
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [chartInstanceRef]);

    useEffect(() => {
        const rafId = window.requestAnimationFrame(() => {
            chartInstanceRef.current?.resize();
        });
        const timeoutId = window.setTimeout(() => {
            chartInstanceRef.current?.resize();
        }, 120);

        return () => {
            window.cancelAnimationFrame(rafId);
            window.clearTimeout(timeoutId);
        };
    }, [isChartFullscreen, chartInstanceRef]);

    if (netRevenue.length === 0 || profitAfterTax.length === 0) return null;

    return (
        <article className="flex flex-col gap-3 text-primary">
            <h2 className="font-body-3-highlight text-primary">{'Xu hướng kinh doanh'}</h2>
            <div className="flex flex-col gap-3 rounded-xl border border-quaternary p-3">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                    <div className="flex flex-wrap items-center gap-4">
                        <span className="inline-flex items-center gap-2">
                            <span
                                className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue"
                                aria-hidden
                            />
                            <span className="font-caption text-secondary">{'Doanh thu thuần'}</span>
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <span
                                className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange"
                                aria-hidden
                            />
                            <span className="font-caption text-secondary">
                                {'Lợi nhuận sau thuế'}
                            </span>
                        </span>
                    </div>
                    <p className="font-caption text-secondary">{'Đơn vị: nghìn tỷ đồng'}</p>
                </div>
                <div ref={containerRef} className="h-52 w-full" aria-hidden="true" />
            </div>
        </article>
    );
};
